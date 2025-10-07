import { create } from 'zustand';
import data from '../../data/products.json';

export interface Product { product_id: string; title: string; brand: string; category: string; default_image?: string; }
interface ProductState { products: Product[]; }

export const useProducts = create<ProductState>(() => ({ products: data.items || [] }));
