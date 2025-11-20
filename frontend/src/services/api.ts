import axios, { AxiosInstance } from 'axios';
import { env } from '../utils/env';

let apiClient: AxiosInstance | null = null;

function getApiClient() {
  if (apiClient) return apiClient;
  
  apiClient = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Response interceptor for error handling
  apiClient.interceptors.response.use(
    response => response,
    error => {
      console.error('API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
  
  return apiClient;
}

// ==================== ITEMS API ====================

export interface Item {
  itemId: string;
  itemName: string;
  itemType: string;
  unitPrice: number;
  imageUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const itemsApi = {
  // Get all items
  getAll: async (): Promise<Item[]> => {
    const client = getApiClient();
    const response = await client.get('/api/items');
    return response.data.data;
  },

  // Get single item
  getById: async (itemId: string): Promise<Item> => {
    const client = getApiClient();
    const response = await client.get(`/api/items/${itemId}`);
    return response.data.data;
  },

  // Create new item
  create: async (item: Omit<Item, 'createdAt' | 'updatedAt'>): Promise<Item> => {
    const client = getApiClient();
    const response = await client.post('/api/items', item);
    return response.data.data;
  },

  // Update item
  update: async (itemId: string, updates: Partial<Omit<Item, 'itemId' | 'createdAt' | 'updatedAt'>>): Promise<Item> => {
    const client = getApiClient();
    const response = await client.put(`/api/items/${itemId}`, updates);
    return response.data.data;
  },

  // Delete item
  delete: async (itemId: string): Promise<void> => {
    const client = getApiClient();
    await client.delete(`/api/items/${itemId}`);
  },

  // Add new product with all details
  addProduct: async (productData: {
    itemId: string;
    itemName: string;
    itemType: string;
    unitPrice: number;
    imageUrl?: string;
  }): Promise<Item> => {
    const client = getApiClient();
    const response = await client.post('/api/items', productData);
    return response.data.data;
  },

  // Modify product details
  modifyProduct: async (itemId: string, updates: {
    itemName?: string;
    itemType?: string;
    unitPrice?: number;
    imageUrl?: string;
  }): Promise<Item> => {
    const client = getApiClient();
    const response = await client.put(`/api/items/${itemId}`, updates);
    return response.data.data;
  },

  // Archive product (soft delete by marking status)
  archiveProduct: async (itemId: string): Promise<Item> => {
    const client = getApiClient();
    const response = await client.put(`/api/items/${itemId}`, { status: 'ARCHIVED' });
    return response.data.data;
  },

  // Unarchive product
  unarchiveProduct: async (itemId: string): Promise<Item> => {
    const client = getApiClient();
    const response = await client.put(`/api/items/${itemId}`, { status: 'ACTIVE' });
    return response.data.data;
  }
};

// ==================== STORES API ====================

export interface Store {
  storeId: string;
  storeCode: string;
  location: {
    addressLine1: string;
    district: string;
    city: string;
  };
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export const storesApi = {
  // Get all stores
  getAll: async (): Promise<Store[]> => {
    const client = getApiClient();
    const response = await client.get('/api/stores');
    return response.data.data;
  },

  // Get single store
  getById: async (storeId: string): Promise<Store> => {
    const client = getApiClient();
    const response = await client.get(`/api/stores/${storeId}`);
    return response.data.data;
  },

  // Create new store
  create: async (store: Omit<Store, 'createdAt' | 'updatedAt'>): Promise<Store> => {
    const client = getApiClient();
    const response = await client.post('/api/stores', store);
    return response.data.data;
  },

  // Update store
  update: async (storeId: string, updates: Partial<Omit<Store, 'storeId' | 'createdAt' | 'updatedAt'>>): Promise<Store> => {
    const client = getApiClient();
    const response = await client.put(`/api/stores/${storeId}`, updates);
    return response.data.data;
  },

  // Delete store
  delete: async (storeId: string): Promise<void> => {
    const client = getApiClient();
    await client.delete(`/api/stores/${storeId}`);
  },

  // Close store (set status to CLOSED)
  closeStore: async (storeId: string): Promise<Store> => {
    const client = getApiClient();
    const response = await client.put(`/api/stores/${storeId}`, { status: 'CLOSED' });
    return response.data.data;
  },

  // Reopen store (set status to OPEN)
  reopenStore: async (storeId: string): Promise<Store> => {
    const client = getApiClient();
    const response = await client.put(`/api/stores/${storeId}`, { status: 'OPEN' });
    return response.data.data;
  },

  // Create new store with complete data
  createNewStore: async (storeData: {
    storeCode: string;
    location: {
      addressLine1: string;
      district: string;
      city: string;
    };
    status?: string;
  }): Promise<Store> => {
    const client = getApiClient();
    const response = await client.post('/api/stores', {
      ...storeData,
      status: storeData.status || 'OPEN'
    });
    return response.data.data;
  }
};

// ==================== INVENTORY API ====================

export interface Inventory {
  storeId: string;
  itemId: string;
  'in-stock': number;
  'ideal-stock': number;
  availableQty: number;
  updatedAt?: string;
}

export const inventoryApi = {
  // Get all inventory (with optional filters)
  getAll: async (filters?: { storeId?: string; itemId?: string }): Promise<Inventory[]> => {
    const client = getApiClient();
    const params = new URLSearchParams();
    if (filters?.storeId) params.append('storeId', filters.storeId);
    if (filters?.itemId) params.append('itemId', filters.itemId);
    
    const response = await client.get(`/api/inventory?${params.toString()}`);
    return response.data.data;
  },

  // Get single inventory record
  getByStoreAndItem: async (storeId: string, itemId: string): Promise<Inventory> => {
    const client = getApiClient();
    const response = await client.get(`/api/inventory/${storeId}/${itemId}`);
    return response.data.data;
  },

  // Create or update inventory
  createOrUpdate: async (inventory: {
    storeId: string;
    itemId: string;
    inStock?: number;
    idealStock?: number;
    availableQty?: number;
  }): Promise<Inventory> => {
    const client = getApiClient();
    const response = await client.post('/api/inventory', inventory);
    return response.data.data;
  },

  // Update inventory quantities
  update: async (storeId: string, itemId: string, updates: {
    inStock?: number;
    idealStock?: number;
  }): Promise<Inventory> => {
    const client = getApiClient();
    const response = await client.put(`/api/inventory/${storeId}/${itemId}`, updates);
    return response.data.data;
  },

  // Delete inventory record
  delete: async (storeId: string, itemId: string): Promise<void> => {
    const client = getApiClient();
    await client.delete(`/api/inventory/${storeId}/${itemId}`);
  }
};

// ==================== SALES API ====================

export interface SalesItem {
  itemId: string;
  salesQty: number;
}

export interface Sales {
  storeId: string;
  salesDate: string;
  items: SalesItem[];
  createdAt?: string;
  updatedAt?: string;
}

export const salesApi = {
  // Get all sales (with optional filters)
  getAll: async (filters?: { storeId?: string; salesDate?: string }): Promise<Sales[]> => {
    const client = getApiClient();
    const params = new URLSearchParams();
    if (filters?.storeId) params.append('storeId', filters.storeId);
    if (filters?.salesDate) params.append('salesDate', filters.salesDate);
    
    const response = await client.get(`/api/sales?${params.toString()}`);
    return response.data.data;
  },

  // Get single sales record
  getByStoreAndDate: async (storeId: string, salesDate: string): Promise<Sales> => {
    const client = getApiClient();
    const response = await client.get(`/api/sales/${storeId}/${salesDate}`);
    return response.data.data;
  },

  // Create sales record
  create: async (sales: Omit<Sales, 'createdAt' | 'updatedAt'>): Promise<Sales> => {
    const client = getApiClient();
    const response = await client.post('/api/sales', sales);
    return response.data.data;
  },

  // Update sales record
  update: async (storeId: string, salesDate: string, items: SalesItem[]): Promise<Sales> => {
    const client = getApiClient();
    const response = await client.put(`/api/sales/${storeId}/${salesDate}`, { items });
    return response.data.data;
  },

  // Delete sales record
  delete: async (storeId: string, salesDate: string): Promise<void> => {
    const client = getApiClient();
    await client.delete(`/api/sales/${storeId}/${salesDate}`);
  }
};

// ==================== HEALTH CHECK ====================

export const healthApi = {
  check: async (): Promise<{ success: boolean; message: string; database: string; timestamp: string }> => {
    const client = getApiClient();
    const response = await client.get('/health');
    return response.data;
  }
};
