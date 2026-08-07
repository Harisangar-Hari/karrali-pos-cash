import { api } from "../services/api";

export const getProductByBarcode = async (barcode: string) => {
  const res = await api.get(`/products/barcode/${barcode}`);
  return res.data;
};

export const checkoutSale = async (data: any) => {
  console.log("POS API PAYLOAD:", data);
  const res = await api.post("/sales/checkout", data);
  return res.data;
};