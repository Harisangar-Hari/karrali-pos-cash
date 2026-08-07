import { api } from "../services/api";
export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
}


export const getCustomers = async (): Promise<Customer[]> => {

    const res = await api.get("/customers");

    return res.data.map((c: any) => ({

        id: c.Id,

        name: c.Name,

        phone: c.Phone,

        email: c.Email,

        address: c.Address

    }));

};
export const createCustomer = async (data: {
    Name: string;
    Phone: string;
}) => {
    const res = await api.post("/customers", data);
    return res.data;
};
