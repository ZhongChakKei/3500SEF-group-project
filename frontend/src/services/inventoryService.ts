import { Product, Variant, InventoryItem, ReserveRequest, OrderRequest } from '../types';
import { getApiClient } from './apiClient';

async function getClient(token: string) {
  return getApiClient(async () => token);
}

export async function listProducts(token: string): Promise<Product[]> {
  const client = await getClient(token);
  const res = await client.get('/products');
  return res.data.items || [];
}

export async function listVariants(token: string, productId: string): Promise<Variant[]> {
  const client = await getClient(token);
  const res = await client.get('/variants', { params: { product_id: productId } });
  return res.data.items || [];
}

export async function getInventoryByVariant(token: string, variantId: string): Promise<any[]> {
  const client = await getClient(token);
  const res = await client.get('/inventory', { params: { variant_id: variantId } });
  return res.data.items || res.data.item || [];
}

export async function getInventoryByLocation(token: string, locationId: string): Promise<InventoryItem[]> {
  const client = await getClient(token);
  const res = await client.get('/inventory', { params: { location_id: locationId } });
  return res.data.items || [];
}

export async function reserveStock(token: string, req: ReserveRequest): Promise<any> {
  const client = await getClient(token);
  try {
    const res = await client.post('/reserve', req);
    return res.data;
  } catch (e: any) {
    if (e.response?.status === 409) return e.response.data;
    throw e;
  }
}

export async function createOrder(token: string, req: OrderRequest): Promise<any> {
  const client = await getClient(token);
  try {
    const res = await client.post('/orders', req);
    return res.data;
  } catch (e: any) {
    if (e.response?.status === 409) return e.response.data;
    throw e;
  }
}
