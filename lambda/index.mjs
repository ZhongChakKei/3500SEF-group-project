// AWS Lambda handler for serverless deployment
// This replaces the Express server for AWS Lambda + API Gateway
import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'retail-db';

let cachedClient = null;
let cachedDb = null;

// Reuse MongoDB connection across Lambda invocations
async function getDb() {
  if (cachedDb) return cachedDb;
  
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await cachedClient.connect();
  }
  
  cachedDb = cachedClient.db(MONGODB_DB);
  return cachedDb;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json'
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
  };
}

// Main Lambda handler
export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const method = event.requestContext?.http?.method || event.httpMethod;
  const path = event.requestContext?.http?.path || event.path || event.rawPath || '';
  
  // Handle OPTIONS for CORS
  if (method === 'OPTIONS') {
    return respond(200, { message: 'OK' });
  }
  
  try {
    const db = await getDb();
    
    // Parse path and route to appropriate handler
    const pathSegments = path.split('/').filter(Boolean);
    
    // Health check
    if (path === '/health' || pathSegments[0] === 'health') {
      await db.command({ ping: 1 });
      return respond(200, {
        success: true,
        message: 'API is healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    }
    
    // API routes start with /api
    if (pathSegments[0] !== 'api') {
      return respond(404, { success: false, error: 'Not found' });
    }
    
    const resource = pathSegments[1]; // items, stores, inventory, sales
    const params = pathSegments.slice(2); // additional path parameters
    
    switch (resource) {
      case 'items':
        return await handleItems(db, method, params, event);
      case 'stores':
        return await handleStores(db, method, params, event);
      case 'inventory':
        return await handleInventory(db, method, params, event);
      case 'sales':
        return await handleSales(db, method, params, event);
      case 'products':
        return await handleProducts(db, method, params, event);
      case 'variants':
        return await handleVariants(db, method, params, event);
      default:
        return respond(404, { success: false, error: 'Resource not found' });
    }
    
  } catch (error) {
    console.error('Error:', error);
    return respond(500, { success: false, error: error.message });
  }
};

// ==================== ITEMS HANDLERS ====================

async function handleItems(db, method, params, event) {
  const collection = db.collection('items');
  
  if (method === 'GET' && params.length === 0) {
    // GET /api/items - List all
    const items = await collection.find({}).sort({ itemName: 1 }).toArray();
    return respond(200, { success: true, data: items });
  }
  
  if (method === 'GET' && params.length === 1) {
    // GET /api/items/:itemId - Get single
    const item = await collection.findOne({ itemId: params[0] });
    if (!item) return respond(404, { success: false, error: 'Item not found' });
    return respond(200, { success: true, data: item });
  }
  
  if (method === 'POST' && params.length === 0) {
    // POST /api/items - Create
    const body = JSON.parse(event.body || '{}');
    const { itemId, itemName, itemType, unitPrice } = body;
    
    if (!itemId || !itemName || !itemType || unitPrice === undefined) {
      return respond(400, { success: false, error: 'itemId, itemName, itemType, and unitPrice are required' });
    }
    
    const existing = await collection.findOne({ itemId });
    if (existing) return respond(409, { success: false, error: 'Item already exists' });
    
    const newItem = {
      itemId,
      itemName,
      itemType,
      unitPrice: parseFloat(unitPrice),
      createdAt: new Date().toISOString()
    };
    
    await collection.insertOne(newItem);
    return respond(201, { success: true, data: newItem });
  }
  
  if (method === 'PUT' && params.length === 1) {
    // PUT /api/items/:itemId - Update
    const body = JSON.parse(event.body || '{}');
    const { itemName, itemType, unitPrice } = body;
    
    const updateFields = {};
    if (itemName) updateFields.itemName = itemName;
    if (itemType) updateFields.itemType = itemType;
    if (unitPrice !== undefined) updateFields.unitPrice = parseFloat(unitPrice);
    updateFields.updatedAt = new Date().toISOString();
    
    const result = await collection.findOneAndUpdate(
      { itemId: params[0] },
      { $set: updateFields },
      { returnDocument: 'after' }
    );
    
    if (!result) return respond(404, { success: false, error: 'Item not found' });
    return respond(200, { success: true, data: result });
  }
  
  if (method === 'DELETE' && params.length === 1) {
    // DELETE /api/items/:itemId - Delete
    const result = await collection.deleteOne({ itemId: params[0] });
    if (result.deletedCount === 0) return respond(404, { success: false, error: 'Item not found' });
    return respond(200, { success: true, message: 'Item deleted successfully' });
  }
  
  return respond(405, { success: false, error: 'Method not allowed' });
}

// ==================== STORES HANDLERS ====================

async function handleStores(db, method, params, event) {
  const collection = db.collection('stores');
  
  if (method === 'GET' && params.length === 0) {
    const stores = await collection.find({}).sort({ storeCode: 1 }).toArray();
    return respond(200, { success: true, data: stores });
  }
  
  if (method === 'GET' && params.length === 1) {
    const store = await collection.findOne({ storeId: params[0] });
    if (!store) return respond(404, { success: false, error: 'Store not found' });
    return respond(200, { success: true, data: store });
  }
  
  if (method === 'POST' && params.length === 0) {
    const body = JSON.parse(event.body || '{}');
    const { storeId, storeCode, location, status } = body;
    
    if (!storeId || !storeCode || !location) {
      return respond(400, { success: false, error: 'storeId, storeCode, and location are required' });
    }
    
    const existing = await collection.findOne({ storeId });
    if (existing) return respond(409, { success: false, error: 'Store already exists' });
    
    const newStore = {
      storeId,
      storeCode,
      location,
      status: status || 'OPEN',
      createdAt: new Date().toISOString()
    };
    
    await collection.insertOne(newStore);
    return respond(201, { success: true, data: newStore });
  }
  
  if (method === 'PUT' && params.length === 1) {
    const body = JSON.parse(event.body || '{}');
    const { storeCode, location, status } = body;
    
    const updateFields = {};
    if (storeCode) updateFields.storeCode = storeCode;
    if (location) updateFields.location = location;
    if (status) updateFields.status = status;
    updateFields.updatedAt = new Date().toISOString();
    
    const result = await collection.findOneAndUpdate(
      { storeId: params[0] },
      { $set: updateFields },
      { returnDocument: 'after' }
    );
    
    if (!result) return respond(404, { success: false, error: 'Store not found' });
    return respond(200, { success: true, data: result });
  }
  
  if (method === 'DELETE' && params.length === 1) {
    const result = await collection.deleteOne({ storeId: params[0] });
    if (result.deletedCount === 0) return respond(404, { success: false, error: 'Store not found' });
    return respond(200, { success: true, message: 'Store deleted successfully' });
  }
  
  return respond(405, { success: false, error: 'Method not allowed' });
}

// ==================== INVENTORY HANDLERS ====================

async function handleInventory(db, method, params, event) {
  const collection = db.collection('inventory');
  
  // Enhanced inventory endpoints for products/variants system
  if (method === 'GET' && params.length === 2 && params[0] === 'location') {
    // GET /api/inventory/location/:locationId - Get all inventory for a location
    const locationId = params[1];
    const inventory = await collection.find({ locationId }).toArray();
    return respond(200, { success: true, data: inventory });
  }
  
  if (method === 'GET' && params.length === 2 && params[0] === 'variant') {
    // GET /api/inventory/variant/:variantId - Get inventory across all locations for a variant
    const variantId = params[1];
    const inventory = await collection.find({ variantId }).toArray();
    return respond(200, { success: true, data: inventory });
  }
  
  if (method === 'POST' && params.length === 1 && params[0] === 'reserve') {
    // POST /api/inventory/reserve - Reserve stock
    const body = JSON.parse(event.body || '{}');
    const { variantId, locationId, qty } = body;
    
    if (!variantId || !locationId || !qty) {
      return respond(400, { success: false, error: 'variantId, locationId, and qty are required' });
    }
    
    const inventory = await collection.findOne({ variantId, locationId });
    if (!inventory) {
      return respond(404, { success: false, error: 'Inventory record not found' });
    }
    
    if (inventory.available < qty) {
      return respond(400, { success: false, error: 'Insufficient available quantity' });
    }
    
    const newReserved = inventory.reserved + parseInt(qty);
    const newAvailable = inventory.onHand - newReserved;
    
    await collection.updateOne(
      { variantId, locationId },
      {
        $set: {
          reserved: newReserved,
          available: newAvailable,
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    return respond(200, { success: true, message: `Reserved ${qty} units successfully` });
  }
  
  if (method === 'GET' && params.length === 0) {
    // GET /api/inventory?storeId=xxx&itemId=xxx
    const queryParams = event.queryStringParameters || {};
    const filter = {};
    if (queryParams.storeId) filter.storeId = queryParams.storeId;
    if (queryParams.itemId) filter.itemId = queryParams.itemId;
    
    const inventory = await collection.find(filter).toArray();
    return respond(200, { success: true, data: inventory });
  }
  
  if (method === 'GET' && params.length === 2) {
    // GET /api/inventory/:storeId/:itemId
    const inventory = await collection.findOne({ storeId: params[0], itemId: params[1] });
    if (!inventory) return respond(404, { success: false, error: 'Inventory record not found' });
    return respond(200, { success: true, data: inventory });
  }
  
  if (method === 'POST' && params.length === 0) {
    // POST /api/inventory - Create or update
    const body = JSON.parse(event.body || '{}');
    const { storeId, itemId, inStock, idealStock, reservedQty, availableQty } = body;
    
    if (!storeId || !itemId) {
      return respond(400, { success: false, error: 'storeId and itemId are required' });
    }
    
    const inventoryData = {
      storeId,
      itemId,
      'in-stock': inStock !== undefined ? parseInt(inStock) : 0,
      'ideal-stock': idealStock !== undefined ? parseInt(idealStock) : 0,
      reservedQty: reservedQty !== undefined ? parseInt(reservedQty) : 0,
      availableQty: availableQty !== undefined ? parseInt(availableQty) : (inStock || 0) - (reservedQty || 0),
      updatedAt: new Date().toISOString()
    };
    
    const result = await collection.findOneAndUpdate(
      { storeId, itemId },
      { $set: inventoryData },
      { upsert: true, returnDocument: 'after' }
    );
    
    return respond(201, { success: true, data: result });
  }
  
  if (method === 'PUT' && params.length === 2) {
    // Check if it's variant-based or store-based inventory
    // Try variant/location first
    const possibleVariant = await collection.findOne({ variantId: params[0], locationId: params[1] });
    
    if (possibleVariant) {
      // PUT /api/inventory/:variantId/:locationId - Update variant inventory
      const body = JSON.parse(event.body || '{}');
      const { onHand, reserved } = body;
      
      const updateFields = {};
      if (onHand !== undefined) updateFields.onHand = parseInt(onHand);
      if (reserved !== undefined) updateFields.reserved = parseInt(reserved);
      
      const newOnHand = onHand !== undefined ? parseInt(onHand) : possibleVariant.onHand;
      const newReserved = reserved !== undefined ? parseInt(reserved) : possibleVariant.reserved;
      updateFields.available = newOnHand - newReserved;
      updateFields.updatedAt = new Date().toISOString();
      
      const result = await collection.findOneAndUpdate(
        { variantId: params[0], locationId: params[1] },
        { $set: updateFields },
        { returnDocument: 'after' }
      );
      
      return respond(200, { success: true, data: result });
    }
    
    // Fall back to store/item based inventory
    // PUT /api/inventory/:storeId/:itemId
    const body = JSON.parse(event.body || '{}');
    const { inStock, idealStock, reservedQty } = body;
    
    const current = await collection.findOne({ storeId: params[0], itemId: params[1] });
    if (!current) return respond(404, { success: false, error: 'Inventory record not found' });
    
    const updateFields = {};
    if (inStock !== undefined) updateFields['in-stock'] = parseInt(inStock);
    if (idealStock !== undefined) updateFields['ideal-stock'] = parseInt(idealStock);
    if (reservedQty !== undefined) updateFields.reservedQty = parseInt(reservedQty);
    
    const newInStock = inStock !== undefined ? parseInt(inStock) : current['in-stock'];
    const newReserved = reservedQty !== undefined ? parseInt(reservedQty) : current.reservedQty;
    updateFields.availableQty = newInStock - newReserved;
    updateFields.updatedAt = new Date().toISOString();
    
    const result = await collection.findOneAndUpdate(
      { storeId: params[0], itemId: params[1] },
      { $set: updateFields },
      { returnDocument: 'after' }
    );
    
    return respond(200, { success: true, data: result });
  }
  
  if (method === 'DELETE' && params.length === 2) {
    // DELETE /api/inventory/:storeId/:itemId
    const result = await collection.deleteOne({ storeId: params[0], itemId: params[1] });
    if (result.deletedCount === 0) return respond(404, { success: false, error: 'Inventory record not found' });
    return respond(200, { success: true, message: 'Inventory record deleted successfully' });
  }
  
  return respond(405, { success: false, error: 'Method not allowed' });
}

// ==================== SALES HANDLERS ====================

async function handleSales(db, method, params, event) {
  const collection = db.collection('sales');
  
  if (method === 'GET' && params.length === 0) {
    // GET /api/sales?storeId=xxx&salesDate=xxx
    const queryParams = event.queryStringParameters || {};
    const filter = {};
    if (queryParams.storeId) filter.storeId = queryParams.storeId;
    if (queryParams.salesDate) filter.salesDate = queryParams.salesDate;
    
    const sales = await collection.find(filter).sort({ salesDate: -1 }).toArray();
    return respond(200, { success: true, data: sales });
  }
  
  if (method === 'GET' && params.length === 2) {
    // GET /api/sales/:storeId/:salesDate
    const sales = await collection.findOne({ storeId: params[0], salesDate: params[1] });
    if (!sales) return respond(404, { success: false, error: 'Sales record not found' });
    return respond(200, { success: true, data: sales });
  }
  
  if (method === 'POST' && params.length === 0) {
    // POST /api/sales - Create
    const body = JSON.parse(event.body || '{}');
    const { storeId, salesDate, items } = body;
    
    if (!storeId || !salesDate || !Array.isArray(items)) {
      return respond(400, { success: false, error: 'storeId, salesDate, and items array are required' });
    }
    
    const existing = await collection.findOne({ storeId, salesDate });
    if (existing) return respond(409, { success: false, error: 'Sales record already exists for this date' });
    
    const salesRecord = {
      storeId,
      salesDate,
      items: items.map(item => ({ itemId: item.itemId, salesQty: parseInt(item.salesQty) })),
      createdAt: new Date().toISOString()
    };
    
    await collection.insertOne(salesRecord);
    return respond(201, { success: true, data: salesRecord });
  }
  
  if (method === 'PUT' && params.length === 2) {
    // PUT /api/sales/:storeId/:salesDate
    const body = JSON.parse(event.body || '{}');
    const { items } = body;
    
    if (!Array.isArray(items)) {
      return respond(400, { success: false, error: 'items array is required' });
    }
    
    const result = await collection.findOneAndUpdate(
      { storeId: params[0], salesDate: params[1] },
      {
        $set: {
          items: items.map(item => ({ itemId: item.itemId, salesQty: parseInt(item.salesQty) })),
          updatedAt: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result) return respond(404, { success: false, error: 'Sales record not found' });
    return respond(200, { success: true, data: result });
  }
  
  if (method === 'DELETE' && params.length === 2) {
    // DELETE /api/sales/:storeId/:salesDate
    const result = await collection.deleteOne({ storeId: params[0], salesDate: params[1] });
    if (result.deletedCount === 0) return respond(404, { success: false, error: 'Sales record not found' });
    return respond(200, { success: true, message: 'Sales record deleted successfully' });
  }
  
  return respond(405, { success: false, error: 'Method not allowed' });
}

// ==================== PRODUCTS HANDLERS ====================

async function handleProducts(db, method, params, event) {
  const collection = db.collection('products');
  
  if (method === 'GET' && params.length === 0) {
    // GET /api/products - List all products
    const products = await collection.find({}).sort({ title: 1 }).toArray();
    return respond(200, { success: true, data: products });
  }
  
  if (method === 'GET' && params.length === 1) {
    // GET /api/products/:productId - Get single product
    const product = await collection.findOne({ product_id: params[0] });
    if (!product) return respond(404, { success: false, error: 'Product not found' });
    return respond(200, { success: true, data: product });
  }
  
  if (method === 'GET' && params.length === 2 && params[1] === 'variants') {
    // GET /api/products/:productId/variants - Get all variants for a product
    const variantsCollection = db.collection('variants');
    const variants = await variantsCollection.find({ product_id: params[0] }).toArray();
    return respond(200, { success: true, data: variants });
  }
  
  if (method === 'POST' && params.length === 0) {
    // POST /api/products - Create new product
    const body = JSON.parse(event.body || '{}');
    const { product_id, title, brand, category, default_image, attributes } = body;
    
    if (!product_id || !title || !brand || !category) {
      return respond(400, { success: false, error: 'product_id, title, brand, and category are required' });
    }
    
    const existing = await collection.findOne({ product_id });
    if (existing) return respond(409, { success: false, error: 'Product already exists' });
    
    const newProduct = {
      product_id,
      title,
      brand,
      category,
      default_image: default_image || null,
      attributes: attributes || {},
      createdAt: new Date().toISOString()
    };
    
    await collection.insertOne(newProduct);
    return respond(201, { success: true, data: newProduct });
  }
  
  return respond(405, { success: false, error: 'Method not allowed' });
}

// ==================== VARIANTS HANDLERS ====================

async function handleVariants(db, method, params, event) {
  const collection = db.collection('variants');
  
  if (method === 'GET' && params.length === 1) {
    // GET /api/variants/:variantId - Get single variant
    const variant = await collection.findOne({ variant_id: params[0] });
    if (!variant) return respond(404, { success: false, error: 'Variant not found' });
    return respond(200, { success: true, data: variant });
  }
  
  if (method === 'POST' && params.length === 0) {
    // POST /api/variants - Create new variant
    const body = JSON.parse(event.body || '{}');
    const { variant_id, product_id, sku, price_HKD, cost_HKD, color, storage_gb, ram_gb, case_mm, connectivity, barcode } = body;
    
    if (!variant_id || !product_id || !sku || price_HKD === undefined) {
      return respond(400, { success: false, error: 'variant_id, product_id, sku, and price_HKD are required' });
    }
    
    const existing = await collection.findOne({ variant_id });
    if (existing) return respond(409, { success: false, error: 'Variant already exists' });
    
    const newVariant = {
      variant_id,
      product_id,
      sku,
      price_HKD: parseFloat(price_HKD),
      cost_HKD: cost_HKD ? parseFloat(cost_HKD) : null,
      color: color || null,
      storage_gb: storage_gb ? parseInt(storage_gb) : null,
      ram_gb: ram_gb ? parseInt(ram_gb) : null,
      case_mm: case_mm ? parseInt(case_mm) : null,
      connectivity: connectivity || null,
      barcode: barcode || null,
      createdAt: new Date().toISOString()
    };
    
    await collection.insertOne(newVariant);
    return respond(201, { success: true, data: newVariant });
  }
  
  return respond(405, { success: false, error: 'Method not allowed' });
}
