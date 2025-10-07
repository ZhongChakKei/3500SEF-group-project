// Node.js 18+ Lambda for Function URL
// ENV required:
// TABLE_NAME=dist-inventory
// ALLOWED_ORIGIN=https://<your-frontend>  (use * while testing)
// REQUIRE_AUTH=false  (set to true when Cognito is ready)
// OAUTH_ISSUER=https://cognito-idp.us-east-2.amazonaws.com/<USER_POOL_ID>
// REQUIRED_SCOPES=read.inventory,reserve.stock  (optional; for access-token scope checks)

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient, QueryCommand, GetCommand, UpdateCommand, TransactWriteCommand
} from "@aws-sdk/lib-dynamodb";
import * as jose from "jose";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME;
const ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const REQUIRE_AUTH = String(process.env.REQUIRE_AUTH || "false").toLowerCase() === "true";
const ISSUER = process.env.OAUTH_ISSUER || "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_yBy9tOShl"; // e.g. https://cognito-idp.us-east-2.amazonaws.com/us-east-2_AbC123456
const REQUIRED_SCOPES = (process.env.REQUIRED_SCOPES || "")
  .split(",").map(s => s.trim()).filter(Boolean);

const respond = (code, body) => ({
  statusCode: code,
  headers: {
    "content-type": "application/json",
    "access-control-allow-origin": ORIGIN,
    "access-control-allow-headers": "authorization,content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS"
  },
  body: JSON.stringify(body)
});

async function requireJwt(event) {
  if (!REQUIRE_AUTH) return; // auth disabled for initial smoke test
  const auth = event.headers?.authorization || event.headers?.Authorization;
  if (!auth?.startsWith("Bearer ")) throw new Error("401:no_bearer");
  const token = auth.slice(7);

  // Verify Cognito access token
  const JWKS = jose.createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));
  const { payload } = await jose.jwtVerify(token, JWKS, { issuer: ISSUER });

  // Must be an ACCESS token
  if (payload.token_use !== "access") throw new Error("401:not_access_token");

  // Optional scope check
  if (REQUIRED_SCOPES.length) {
    const scopes = String(payload.scope || "").split(" ");
    const missing = REQUIRED_SCOPES.filter(s => !scopes.includes(s));
    if (missing.length) throw new Error("403:missing_scopes");
  }
}

export const handler = async (event) => {
  try {
    const method = event.requestContext?.http?.method || event.httpMethod || "GET";
    const path = (event.rawPath || event.path || "/").toLowerCase();
    if (method === "OPTIONS") return respond(200, { ok: true });

    await requireJwt(event); // no-op until REQUIRE_AUTH=true

    if (method === "GET" && path === "/products") return listProducts();
    if (method === "GET" && path === "/variants") return listVariants(event);
    if (method === "GET" && path === "/inventory") return getInventory(event);
    if (method === "POST" && path === "/reserve") return reserveStock(event);
    if (method === "POST" && path === "/orders") return createAndCommitOrder(event);

    return respond(404, { error: "Not Found" });
  } catch (e) {
    if (String(e.message).startsWith("401")) return respond(401, { error: "Unauthorized" });
    if (String(e.message).startsWith("403")) return respond(403, { error: "Forbidden" });
    if (e.name === "TransactionCanceledException") return respond(409, { error: "Stock changed; refresh" });
    if (e.name === "ConditionalCheckFailedException") return respond(409, { error: "Insufficient stock" });
    console.error(e);
    return respond(500, { error: "Server error" });
  }
};

/* ---------- Endpoints ---------- */

async function listProducts() {
  const q = new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: "PK = :t",
    ExpressionAttributeValues: { ":t": "TYPE#PRODUCT" }
  });
  const { Items = [] } = await ddb.send(q);
  const items = Items.map(p => ({
    product_id: p.productId, title: p.title, brand: p.brand, category: p.category,
    default_image: p.default_image, attributes: tryJson(p.attributes)
  }));
  return respond(200, { items });
}

async function listVariants(event) {
  const productId = event.queryStringParameters?.product_id;
  if (!productId) return respond(400, { error: "product_id required" });
  const q = new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: "PK = :p AND begins_with(SK, :v)",
    ExpressionAttributeValues: { ":p": `PRODUCT#${productId}`, ":v": "VARIANT#" }
  });
  const { Items = [] } = await ddb.send(q);
  const items = Items.map(v => ({
    variant_id: v.variantId, product_id: v.productId, sku: v.sku, color: v.color,
    storage_gb: v.storage_gb, ram_gb: v.ram_gb, case_mm: v.case_mm, connectivity: v.connectivity,
    price_HKD: v.price_HKD, cost_HKD: v.cost_HKD, barcode: v.barcode
  }));
  return respond(200, { items });
}

async function getInventory(event) {
  const qs = event.queryStringParameters || {};
  const variantId = qs.variant_id;
  const locationId = qs.location_id;

  if (!variantId && !locationId) return respond(400, { error: "variant_id or location_id required" });

  if (variantId && locationId) {
    const g = new GetCommand({ TableName: TABLE, Key: { PK: `INVENTORY#${variantId}`, SK: `LOCATION#${locationId}` }});
    const { Item } = await ddb.send(g);
    return respond(200, { item: Item || null });
  }

  if (variantId) {
    const q = new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": `INVENTORY#${variantId}`, ":sk": "LOCATION#" }
    });
    const { Items = [] } = await ddb.send(q);
    return respond(200, { items: Items });
  }

  const q = new QueryCommand({
    TableName: TABLE, IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :gpk AND begins_with(GSI1SK, :gsk)",
    ExpressionAttributeValues: { ":gpk": `LOCATION#${locationId}`, ":gsk": "VARIANT#" }
  });
  const { Items = [] } = await ddb.send(q);
  return respond(200, { items: Items });
}

async function reserveStock(event) {
  const { variantId, locationId, qty } = parseBody(event.body);
  if (!variantId || !locationId || !Number.isInteger(qty) || qty <= 0)
    return respond(400, { error: "variantId, locationId, positive qty required" });

  const upd = new UpdateCommand({
    TableName: TABLE,
    Key: { PK: `INVENTORY#${variantId}`, SK: `LOCATION#${locationId}` },
    UpdateExpression:
      "SET reserved = if_not_exists(reserved, :z) + :q, " +
      "available = onHand - (if_not_exists(reserved, :z) + :q), " +
      "updatedAt = :now",
    ConditionExpression: "attribute_exists(PK) AND (onHand - if_not_exists(reserved, :z)) >= :q",
    ExpressionAttributeValues: { ":q": qty, ":z": 0, ":now": new Date().toISOString() },
    ReturnValues: "ALL_NEW"
  });
  const { Attributes } = await ddb.send(upd);
  return respond(200, { ok: true, inventory: Attributes });
}

async function createAndCommitOrder(event) {
  const { orderId, locationId, lines } = parseBody(event.body);
  if (!orderId || !locationId || !Array.isArray(lines) || !lines.length)
    return respond(400, { error: "orderId, locationId, lines[] required" });

  const tx = [];
  tx.push({
    Put: {
      TableName: TABLE,
      Item: { PK: `ORDER#${orderId}`, SK: `ORDER#${orderId}`, status: "PAID", locationId, createdAt: new Date().toISOString() },
      ConditionExpression: "attribute_not_exists(PK)"
    }
  });

  lines.forEach((l, i) => {
    if (!l.variantId || !Number.isInteger(l.qty) || l.qty <= 0) throw new Error("bad_line");
    tx.push({
      Put: {
        TableName: TABLE,
        Item: { PK: `ORDER#${orderId}`, SK: `LINE#${String(i).padStart(3,"0")}#${l.variantId}`, variantId: l.variantId, qty: l.qty, price: l.price ?? 0 }
      }
    });
    tx.push({
      Update: {
        TableName: TABLE,
        Key: { PK: `INVENTORY#${l.variantId}`, SK: `LOCATION#${locationId}` },
        UpdateExpression: "SET onHand = onHand - :q, reserved = reserved - :q, available = (onHand - :q) - (reserved - :q), updatedAt = :now",
        ConditionExpression: "onHand >= :q AND reserved >= :q",
        ExpressionAttributeValues: { ":q": l.qty, ":now": new Date().toISOString() }
      }
    });
  });

  await ddb.send(new TransactWriteCommand({ TransactItems: tx }));
  return respond(200, { ok: true, orderId });
}

/* ---------- helpers ---------- */
function parseBody(b){ try{ return JSON.parse(b||"{}"); }catch{ return {}; } }
function tryJson(v){ try{ return typeof v==="string"? JSON.parse(v):v; }catch{ return v; } }
