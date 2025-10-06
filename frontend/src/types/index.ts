export type Product = {
  product_id: string;
  title: string;
  brand: string;
  category: string;
  default_image?: string;
  attributes?: any;
};

export type Variant = {
  variant_id: string;
  product_id: string;
  sku: string;
  color?: string;
  storage_gb?: number;
  ram_gb?: number;
  case_mm?: number;
  connectivity?: string;
  price_HKD: number;
  cost_HKD?: number;
  barcode?: string;
};

export type InventoryItem = {
  variantId: string;
  locationId: string;
  onHand: number;
  reserved: number;
  available: number;
  updatedAt: string;
};

export type OrderLine = { variantId: string; qty: number; price: number };

export type ReserveRequest = { variantId: string; locationId: string; qty: number };
export type OrderRequest = { orderId: string; locationId: string; lines: OrderLine[] };
