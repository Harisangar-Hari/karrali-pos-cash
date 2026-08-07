import { api } from "../services/api";

export interface Product {
  id: string;
  name: string;
  barcode: string;
  sku: string;
  price: number;
  costPrice: number;
  stockQty: number;
  reorderLevel: number;
  categoryId: string;
  isActive: boolean;
  // New Fields
  warrantyMonths?: number;
  brand?: {
    id: string;
    name: string;
  } | null;
  category?: {
    id: string;
    name: string;
  } | null;
}

// GET ALL PRODUCTS
export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products");

  return res.data.map((p: any) => ({
    id: p.Id,
    name: p.Name,
    barcode: p.Barcode,
    sku: p.SKU,
    price: Number(p.Price ?? 0),
    costPrice: Number(p.CostPrice ?? 0),
    discount: Number(p.Discount ?? 0),
    stockQty: p.StockQty ?? 0,
    reorderLevel: p.ReorderLevel ?? 0,
    categoryId: p.CategoryId,
    isActive: p.IsActive,
    // New mapped fields
    warrantyMonths: p.WarrantyMonths ?? 0,
    brand: p.Brands
      ? {
        id: p.Brands.Id,
        name: p.Brands.Name,
      }
      : null,
    category: p.Categories
      ? {
        id: p.Categories.Id,
        name: p.Categories.Name,
      }
      : null,
  }));
};

// GET PRODUCT BY BARCODE (fast POS scan mode)
export const getProductByBarcode = async (barcode: string): Promise<Product> => {
  const res = await api.get(`/products/barcode/${barcode}`);
  // Note: You should ensure your backend returns Brands/WarrantyMonths for this endpoint too
  return {
    id: res.data.Id,
    name: res.data.Name,
    barcode: res.data.Barcode,
    sku: res.data.SKU,
    price: Number(res.data.Price ?? 0),
    costPrice: Number(res.data.CostPrice ?? 0),
    stockQty: res.data.StockQty ?? 0,
    reorderLevel: res.data.ReorderLevel ?? 0,
    categoryId: res.data.CategoryId,
    isActive: res.data.IsActive,
    warrantyMonths: res.data.WarrantyMonths ?? 0,
    brand: res.data.Brands
      ? { id: res.data.Brands.Id, name: res.data.Brands.Name }
      : null,
  };
};

// CREATE PRODUCT
export const createProduct = async (data: Partial<Product>) => {
  const res = await api.post("/products", data);
  return res.data;
};

// UPDATE PRODUCT
export const updateProduct = async (id: string, data: Partial<Product>) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

// DELETE PRODUCT
export const deleteProduct = async (id: string) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};