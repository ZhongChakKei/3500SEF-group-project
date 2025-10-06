// Distributed Inventory & Sales - Dataset Fetch Lambda (Node.js 18+)
// Single Lambda (Function URL compatible) that reads dataset JSON files from S3 and serves
// read-only endpoints:
//   GET /products
//   GET /variants?product_id=...
//   GET /inventory?variant_id=V-... | ?location_id=...
// CORS enabled. Simple in-memory caching to reduce S3 calls.

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// ----------- Environment Configuration ----------- //
const {
  BUCKET_NAME,
  PRODUCTS_KEY = 'products.json',
  VARIANTS_KEY = 'variants.json',
  INVENTORY_KEY = 'inventory.json',
  LOCATIONS_KEY = 'locations.json',
  DATA_CACHE_TTL_SECONDS = '60'
} = process.env;

if (!BUCKET_NAME) {
  console.warn('[WARN] BUCKET_NAME not set. Lambda will fail for data fetch.');
}

const CACHE_TTL = parseInt(DATA_CACHE_TTL_SECONDS, 10) || 60; // seconds

// ----------- AWS SDK Client ----------- //
const s3 = new S3Client({}); // region inferred from Lambda execution environment

// ----------- In-Memory Cache ----------- //
let cache = {
  loadedAt: 0,
  products: null,
  variants: null,
  inventory: null,
  locations: null
};

async function streamToString(stream) {
  if (typeof stream.transformToString === 'function') {
    // (Node.js 18 AWS SDK provides transformToString on the body)
    return await stream.transformToString();
  }
  return await new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

async function getJsonObject(Key) {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key }));
  const text = await streamToString(res.Body);
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed parsing JSON for', Key, e);
    throw new Error(`Invalid JSON in ${Key}`);
  }
}

async function loadDataIfNeeded(force = false) {
  const now = Date.now();
  if (!force && cache.loadedAt && (now - cache.loadedAt) < CACHE_TTL * 1000) {
    return cache; // still valid
  }
  console.log('[INFO] Loading dataset from S3...');
  const [products, variants, inventory, locations] = await Promise.all([
    getJsonObject(PRODUCTS_KEY),
    getJsonObject(VARIANTS_KEY),
    getJsonObject(INVENTORY_KEY),
    getJsonObject(LOCATIONS_KEY).catch(() => []) // optional
  ]);
  cache = { products, variants, inventory, locations, loadedAt: now };
  console.log('[INFO] Dataset loaded. Sizes:', {
    products: products?.length,
    variants: variants?.length,
    inventory: inventory?.length,
    locations: locations?.length
  });
  return cache;
}

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    ...extra
  };
}

function jsonResponse(statusCode, bodyObj, extraHeaders = {}) {
  return {
    statusCode,
    headers: corsHeaders({ 'Content-Type': 'application/json', ...extraHeaders }),
    body: JSON.stringify(bodyObj)
  };
}

async function handleProducts(query, data) {
  let items = data.products || [];
  const q = query?.q?.trim();
  if (q) {
    const qLower = q.toLowerCase();
    items = items.filter(p =>
      (p.title && p.title.toLowerCase().includes(qLower)) ||
      (p.product_id && p.product_id.toLowerCase().includes(qLower))
    );
  }
  return jsonResponse(200, { items });
}

async function handleVariants(query, data) {
  const productId = query?.product_id;
  if (!productId) return jsonResponse(400, { error: 'product_id required' });
  const items = (data.variants || []).filter(v => v.product_id === productId);
  return jsonResponse(200, { items });
}

async function handleInventory(query, data) {
  const { variant_id, location_id } = query || {};
  let items = data.inventory || [];
  if (variant_id) {
    items = items.filter(i => i.variantId === variant_id);
  }
  if (location_id) {
    items = items.filter(i => i.locationId === location_id);
  }
  return jsonResponse(200, { items });
}

// (Optional) stub handlers for future write operations
async function handleReserve(body, data) {
  // This dataset fetch Lambda is read-only; you would normally integrate with DynamoDB to atomically reserve.
  return jsonResponse(501, { error: 'Not Implemented: reserve logic requires DynamoDB write operations' });
}

async function handleOrders(body, data) {
  return jsonResponse(501, { error: 'Not Implemented: order creation requires persistent store' });
}

export const handler = async (event) => {
  try {
    if (event.requestContext?.http?.method === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders(), body: '' };
    }

    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = (event.rawPath || event.path || '/').replace(/\/$/, '');
    const query = event.queryStringParameters || {};
    const body = event.body ? (() => { try { return JSON.parse(event.body); } catch { return {}; } })() : {};

    // Load data (cached)
    const data = await loadDataIfNeeded();

    if (method === 'GET' && path === '/products') {
      return await handleProducts(query, data);
    }
    if (method === 'GET' && path === '/variants') {
      return await handleVariants(query, data);
    }
    if (method === 'GET' && path === '/inventory') {
      return await handleInventory(query, data);
    }
    if (method === 'POST' && path === '/reserve') {
      return await handleReserve(body, data);
    }
    if (method === 'POST' && path === '/orders') {
      return await handleOrders(body, data);
    }
    if (method === 'GET' && path === '/health') {
      return jsonResponse(200, { ok: true, loadedAt: cache.loadedAt, cacheTtlSeconds: CACHE_TTL });
    }

    return jsonResponse(404, { error: 'Not Found', path });
  } catch (err) {
    console.error('Unhandled error', err);
    return jsonResponse(500, { error: 'Internal Server Error', message: err.message });
  }
};

// For local testing with `node index.mjs` (mock event)
if (process.env.LOCAL_TEST) {
  (async () => {
    const res = await handler({
      requestContext: { http: { method: 'GET' } },
      rawPath: '/products',
      queryStringParameters: {}
    });
    console.log('Local test response:', res.statusCode, res.body.slice(0, 120) + '...');
  })();
}
