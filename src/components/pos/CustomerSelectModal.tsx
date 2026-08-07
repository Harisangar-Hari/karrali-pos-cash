import { useEffect, useState } from "react";
import { getCustomers, createCustomer } from "../../api/customerApi";

interface Props {
    onClose: () => void;
    onSelect: (customer: any | null) => void;
}

export default function CustomerSelectModal({ onClose, onSelect }: Props) {
    const [customers, setCustomers] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const [mode, setMode] = useState<"list" | "create">("list");

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const res = await getCustomers();
        setCustomers(res);
    };

    const handleCreate = async () => {
        if (!name || !phone) return;

        const res = await createCustomer({ name, phone });
        onSelect(res);
    };

    const filtered = customers.filter(
        c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search)
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-4 rounded-xl space-y-4">

                <h2 className="text-lg font-bold">Customer (Member)</h2>

                {/* MODE SWITCH */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode("list")}
                        className="flex-1 bg-gray-200 p-2 rounded"
                    >
                        Select
                    </button>

                    <button
                        onClick={() => setMode("create")}
                        className="flex-1 bg-black text-white p-2 rounded"
                    >
                        New
                    </button>
                </div>

                {/* LIST MODE */}
                {mode === "list" && (
                    <>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search customer..."
                            className="w-full border p-2 rounded"
                        />

                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {filtered.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => onSelect(c)}
                                    className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                                >
                                    <p className="font-semibold">{c.name}</p>
                                    <p className="text-sm text-gray-500">{c.phone}</p>
                                    <p className="text-xs text-blue-600">
                                        {c.loyaltyPoints} pts • {c.loyaltyTier}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* CREATE MODE */}
                {mode === "create" && (
                    <>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Customer name"
                            className="w-full border p-2 rounded"
                        />

                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone"
                            className="w-full border p-2 rounded"
                        />

                        <button
                            onClick={handleCreate}
                            className="w-full bg-green-600 text-white p-2 rounded"
                        >
                            Create & Select
                        </button>
                    </>
                )}

                <button onClick={onClose} className="w-full text-gray-500">
                    Skip Customer
                </button>
            </div>
        </div>
    );
}