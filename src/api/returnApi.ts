import { api } from "../services/api";

// 🔍 LOAD INVOICE
export const getInvoice = async (invoiceNumber: string) => {
    const res = await api.get(`/sales/invoice/${invoiceNumber}`);
    return res.data;
};

// 🔁 PROCESS RETURN
export const processReturn = async (data: any) => {
    const res = await api.post(`/sales/return`, data);
    return res.data;
};