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
