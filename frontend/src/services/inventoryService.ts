import axios from 'axios';
import { env } from '../utils/env';
import { Product, Variant, InventoryItem, ReserveRequest } from '../types';

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== PRODUCTS ====================

export async function listProducts(token: string): Promise<Product[]> {
  const response = await apiClient.get('/api/products', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data || [];
}

export async function getProduct(token: string, productId: string): Promise<Product> {
  const response = await apiClient.get(`/api/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

export async function createProduct(token: string, product: Omit<Product, 'product_id'>): Promise<Product> {
  const response = await apiClient.post('/api/products', product, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

// ==================== VARIANTS ====================

export async function listVariants(token: string, productId: string): Promise<Variant[]> {
  const response = await apiClient.get(`/api/products/${productId}/variants`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data || [];
}

export async function getVariant(token: string, variantId: string): Promise<Variant> {
  const response = await apiClient.get(`/api/variants/${variantId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

export async function createVariant(token: string, variant: Omit<Variant, 'variant_id'>): Promise<Variant> {
  const response = await apiClient.post('/api/variants', variant, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

// ==================== INVENTORY ====================

export async function getInventoryByLocation(token: string, locationId: string): Promise<InventoryItem[]> {
  const response = await apiClient.get(`/api/inventory/location/${locationId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data || [];
}

export async function getInventoryByVariant(token: string, variantId: string): Promise<Array<{ locationId: string; available: number; onHand: number; reserved: number }>> {
  const response = await apiClient.get(`/api/inventory/variant/${variantId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data || [];
}

export async function reserveStock(token: string, request: ReserveRequest): Promise<{ ok: boolean; message?: string }> {
  try {
    const response = await apiClient.post('/api/inventory/reserve', request, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { ok: true, message: response.data.message };
  } catch (error: any) {
    return { ok: false, message: error.response?.data?.error || error.message };
  }
}

export async function updateInventory(token: string, variantId: string, locationId: string, updates: { onHand?: number; reserved?: number }): Promise<InventoryItem> {
  const response = await apiClient.put(`/api/inventory/${variantId}/${locationId}`, updates, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}
