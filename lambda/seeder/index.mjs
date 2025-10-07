// index.mjs
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const s3  = new S3Client({});
const ddb = new DynamoDBClient({});

const TABLE  = process.env.TABLE_NAME;                  // dist-inventory
const BUCKET = process.env.BUCKET_NAME;                 // 3500sefmockproduct
const PREFIX = process.env.PREFIX || "datasets/apple-hk/"; // include trailing /

const readJson = async (name) => {
  const obj  = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: `${PREFIX}${name}` }));
  const text = await obj.Body.transformToString();
  return JSON.parse(text);
};

const put = async (params) => {
  try {
    await ddb.send(new PutItemCommand({ ...params, ConditionExpression: "attribute_not_exists(PK)" }));
    return true;   // wrote
  } catch (e) {
    if (e.name === "ConditionalCheckFailedException") return false; // already exists
    throw e;
  }
};

export const handler = async () => {
  const [products, variants, /*locations*/, inventory] = await Promise.all([
    readJson("products.json"),
    readJson("variants.json"),
    readJson("locations.json"),
    readJson("inventory.json"),
  ]);

  let wrote = { products: 0, productRows: 0, variants: 0, inventory: 0 }, skipped = 0;

  // Product index + product rows
  for (const p of products) {
    const ok1 = await put({
      TableName: TABLE,
      Item: {
        PK: { S: "TYPE#PRODUCT" }, SK: { S: `PRODUCT#${p.product_id}` },
        productId: { S: p.product_id }, title: { S: p.title },
        brand: { S: p.brand }, category: { S: p.category },
        default_image: { S: p.default_image ?? "" },
        attributes: { S: JSON.stringify(p.attributes || {}) },
      },
    });
    ok1 ? wrote.products++ : skipped++;

    const ok2 = await put({
      TableName: TABLE,
      Item: {
        PK: { S: `PRODUCT#${p.product_id}` }, SK: { S: `PRODUCT#${p.product_id}` },
        productId: { S: p.product_id }, title: { S: p.title },
      },
    });
    ok2 ? wrote.productRows++ : skipped++;
  }

  // Variants
  for (const v of variants) {
    const priceHKD = v.price_HKD ?? v.price?.HKD ?? 0;
    const costHKD  = v.cost_HKD  ?? v.cost?.HKD  ?? 0;

    const ok = await put({
      TableName: TABLE,
      Item: {
        PK: { S: `PRODUCT#${v.product_id}` }, SK: { S: `VARIANT#${v.variant_id}` },
        productId: { S: v.product_id }, variantId: { S: v.variant_id },
        sku: { S: v.sku ?? "" }, color: { S: String(v.color ?? "") },
        storage_gb: { N: String(v.storage_gb ?? 0) },
        ram_gb: { N: String(v.ram_gb ?? 0) },
        case_mm: { N: String(v.case_mm ?? 0) },
        connectivity: { S: String(v.connectivity ?? "") },
        price_HKD: { N: String(priceHKD) },
        cost_HKD: { N: String(costHKD) },
        barcode: { S: v.barcode ?? "" },
      },
    });
    ok ? wrote.variants++ : skipped++;
  }

  // Inventory (with GSI1)
  for (const inv of inventory) {
    const variantId  = inv.variant_id;
    const locationId = inv.location_id;
    const onHand     = Number(inv.on_hand ?? inv.onHand ?? 0);
    const reserved   = Number(inv.reserved ?? 0);
    const available  = Number(inv.available ?? (onHand - reserved));
    const updatedAt  = inv.updated_at ?? new Date().toISOString();

    const ok = await put({
      TableName: TABLE,
      Item: {
        PK: { S: `INVENTORY#${variantId}` }, SK: { S: `LOCATION#${locationId}` },
        GSI1PK: { S: `LOCATION#${locationId}` }, GSI1SK: { S: `VARIANT#${variantId}` },
        variantId: { S: variantId }, locationId: { S: locationId },
        onHand: { N: String(onHand) }, reserved: { N: String(reserved) },
        available: { N: String(available) }, updatedAt: { S: updatedAt },
      },
    });
    ok ? wrote.inventory++ : skipped++;
  }

  console.log({ wrote, skipped });
  return { ok: true, ...wrote, skipped };
};
