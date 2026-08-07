import { useState } from "react";
import { api } from "../../services/api";
import { getProducts } from "../../api/productApi";
import { useToast } from "../../store/toastStore";
import { printReturnReceipt } from "../../utils/printReturnReceipt";

interface InvoiceItem {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
}

interface ReturnItem {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    reason?: string;
}

interface ReplacementItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
}

export default function ReturnPOSPage() {
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
    const [replacementItems, setReplacementItems] = useState<ReplacementItem[]>([]);
    const [reason, setReason] = useState("");

    const [search, setSearch] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);

    const { showToast } = useToast();

    // =========================
    // LOAD INVOICE (FIXED SAFE)
    // =========================
    const loadInvoice = async () => {
        try {
            const res = await api.get(`/sales/invoice/${invoiceNumber}`);


            const items = res.data?.SaleItems ?? [];


            const safeItems: InvoiceItem[] = items.map((i: any) => ({

                productId: i.ProductId,

                name:
                    i.Products?.Name ?? "Unknown Product",

                quantity:
                    i.Quantity ?? 0,

                unitPrice:
                    Number(i.UnitPrice ?? 0)

            }));


            setInvoiceItems(safeItems);

            setReturnItems([]);

            setReplacementItems([]);

            showToast("Invoice loaded", "success");
        } catch {
            showToast("Invoice not found", "error");
        }
    };

    // =========================
    // RETURN ITEM
    // =========================
    const addReturnItem = (item: InvoiceItem, qty: number) => {
        if (!qty || qty <= 0) {
            setReturnItems(prev =>
                prev.filter(p => p.productId !== item.productId)
            );
            return;
        }

        setReturnItems(prev => {
            const exists = prev.find(p => p.productId === item.productId);

            if (exists) {
                return prev.map(p =>
                    p.productId === item.productId
                        ? { ...p, quantity: qty }
                        : p
                );
            }

            return [
                ...prev,
                {
                    productId: item.productId,
                    name: item.name,
                    quantity: qty,
                    unitPrice: item.unitPrice,
                    reason
                }
            ];
        });
    };

    const removeReturn = (id: string) => {
        setReturnItems(prev => prev.filter(i => i.productId !== id));
    };

    // =========================
    // SEARCH PRODUCTS
    // =========================
    const handleSearch = async (value: string) => {
        setSearch(value);

        if (!value.trim()) {
            setResults([]);
            return;
        }

        const data = await getProducts();

        const filtered = data.filter((p: any) =>
            p.name?.toLowerCase().includes(value.toLowerCase()) ||
            p.barcode?.includes(value)
        );

        setResults(filtered);
        setShowResults(true);
    };

    // =========================
    // REPLACEMENT
    // =========================
    const addReplacement = (product: any) => {
        setReplacementItems(prev => {
            const exists = prev.find(p => p.productId === product.id);

            if (exists) {
                return prev.map(p =>
                    p.productId === product.id
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                );
            }

            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    quantity: 1,
                    price: product.price
                }
            ];
        });
    };

    const updateReplacementQty = (id: string, qty: number) => {
        if (!qty || qty <= 0) {
            setReplacementItems(prev =>
                prev.filter(i => i.productId !== id)
            );
            return;
        }

        setReplacementItems(prev =>
            prev.map(i =>
                i.productId === id ? { ...i, quantity: qty } : i
            )
        );
    };

    // =========================
    // CALCULATION (SAFE)
    // =========================
    const returnTotal = returnItems.reduce(
        (sum, i) => sum + (i.unitPrice || 0) * (i.quantity || 0),
        0
    );

    const replacementTotal = replacementItems.reduce(
        (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
        0
    );

    const balance = replacementTotal - returnTotal;

    // =========================
    // PROCESS
    // =========================
    const processExchange = async () => {
        try {
            if (!invoiceNumber) {
                showToast("Enter invoice number", "error");
                return;
            }

            if (returnItems.length === 0 && replacementItems.length === 0) {
                showToast("Nothing to process", "error");
                return;
            }

            if (returnItems.length > 0) {
                await api.post("/sales/return", {
                    invoiceNumber,
                    reason,
                    items: returnItems
                });
            }

            let replacementInvoice = null;

            if (replacementItems.length > 0) {
                const res = await api.post("/sales/replacement", {
                    items: replacementItems
                });

                replacementInvoice = res.data.invoiceNumber;
            }

            printReturnReceipt({
                invoiceNumber,
                newInvoiceNumber: replacementInvoice,

                returnedItems: returnItems.map(i => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.unitPrice   // ✅ FIX HERE
                })),

                replacementItems: replacementItems.map(i => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price
                })),

                returnedTotal: returnTotal,
                replacementTotal,
                balance,
                reason
            });

            showToast("Exchange completed", "success");

            setInvoiceNumber("");
            setInvoiceItems([]);
            setReturnItems([]);
            setReplacementItems([]);
            setSearch("");
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong";
            showToast(message, "error");
        }
    };

    // =========================
    // UI
    // =========================
    return (
        <div className="min-h-screen bg-[#EEF1EF] p-4 md:p-6 font-sans text-[#14181C]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">

                {/* INVOICE */}
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full w-1 bg-[#DC2626]" />

                    <h2 className="text-[11px] font-semibold tracking-widest text-[#DC2626] uppercase">
                        Invoice
                    </h2>

                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-black/10 bg-[#FAFAF8] focus-within:ring-2 focus-within:ring-[#DC2626]/30 focus-within:border-[#DC2626] transition">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="ml-3 shrink-0 text-[#DC2626]/70">
                            <path d="M6 2h9l3 3v17H6V2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                            <path d="M9 9h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        <input
                            className="w-full py-3 pr-3 bg-transparent font-mono text-[15px] cursor-text outline-none placeholder:text-black/30"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            placeholder="Invoice number"
                        />
                    </div>

                    <button
                        onClick={loadInvoice}
                        className="bg-[#4338CA] hover:bg-[#372FA6] text-white w-full mt-3 p-3 rounded-xl font-medium text-[14px] cursor-pointer transition"
                    >
                        Load invoice
                    </button>

                    <div className="mt-4 space-y-2.5">
                        {invoiceItems.length === 0 ? (
                            <div className="py-10 text-center text-black/30 text-sm">
                                Load an invoice to see its items
                            </div>
                        ) : (
                            invoiceItems.map(item => (
                                <div key={item.productId} className="border border-black/10 rounded-xl p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-[14px]">{item.name}</p>
                                        <span className="text-[11px] font-mono text-black/40">
                                            sold {item.quantity} · Rs {item.unitPrice}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <label className="text-[11px] font-semibold tracking-widest text-black/40 uppercase shrink-0">
                                            Return qty
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={item.quantity}
                                            className="border border-black/10 bg-[#FAFAF8] rounded-lg px-2 py-1.5 w-20 font-mono text-[13px] outline-none focus:ring-2 focus:ring-[#DC2626]/30 focus:border-[#DC2626] transition"
                                            onChange={(e) =>
                                                addReturnItem(item, Number(e.target.value))
                                            }
                                        />

                                        {returnItems.find(r => r.productId === item.productId) && (
                                            <button
                                                onClick={() => removeReturn(item.productId)}
                                                className="ml-auto text-red-500/80 hover:text-red-600 text-[12px] font-medium cursor-pointer transition"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* REPLACEMENT */}
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 relative">
                    <h2 className="text-[11px] font-semibold tracking-widest text-[#0B6E4F] uppercase">
                        Replacement
                    </h2>

                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-black/10 bg-[#FAFAF8] focus-within:ring-2 focus-within:ring-[#0B6E4F]/30 focus-within:border-[#0B6E4F] transition">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="ml-3 shrink-0 text-black/35">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <input
                            className="w-full py-3 pr-3 bg-transparent text-[15px] cursor-text outline-none placeholder:text-black/30"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search products"
                        />
                    </div>

                    {showResults && (
                        <div className="border border-black/10 mt-1 max-h-44 overflow-y-auto rounded-xl shadow-lg">
                            {results.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => {
                                        addReplacement(p);
                                        setSearch("");
                                        setShowResults(false);
                                    }}
                                    className="px-4 py-3 hover:bg-[#F3F6F4] cursor-pointer transition border-b border-black/5 last:border-0 text-[14px]"
                                >
                                    {p.name}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 space-y-2.5">
                        {replacementItems.length === 0 ? (
                            <div className="py-10 text-center text-black/30 text-sm">
                                Search and select items to add as replacement
                            </div>
                        ) : (
                            replacementItems.map(item => (
                                <div key={item.productId} className="border border-black/10 rounded-xl p-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-[14px]">{item.name}</p>
                                        <p className="font-mono text-[12px] text-black/40 mt-0.5">Rs {item.price}</p>
                                    </div>

                                    <div className="flex gap-2 items-center">
                                        <button
                                            onClick={() =>
                                                updateReplacementQty(item.productId, item.quantity - 1)
                                            }
                                            className="w-6 h-6 flex items-center justify-center bg-[#F3F6F4] text-black/60 rounded-full hover:bg-[#E7ECE9] cursor-pointer transition text-sm leading-none"
                                        >
                                            −
                                        </button>

                                        <span className="w-5 text-center font-mono text-[13px]">{item.quantity}</span>

                                        <button
                                            onClick={() =>
                                                updateReplacementQty(item.productId, item.quantity + 1)
                                            }
                                            className="w-6 h-6 flex items-center justify-center bg-[#F3F6F4] text-black/60 rounded-full hover:bg-[#E7ECE9] cursor-pointer transition text-sm leading-none"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SUMMARY */}
                <div className="space-y-5">

                    <div className="bg-[#12171A] rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] tracking-widest uppercase text-white/40 font-semibold">
                                Return
                            </span>
                            <span className="font-mono text-[15px] tabular-nums text-white/70">
                                Rs {returnTotal}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[11px] tracking-widest uppercase text-white/40 font-semibold">
                                Replacement
                            </span>
                            <span className="font-mono text-[15px] tabular-nums text-white/70">
                                Rs {replacementTotal}
                            </span>
                        </div>

                        <div className="h-px bg-white/10" />

                        <div>
                            <p className="text-[11px] tracking-widest uppercase text-white/40 font-semibold">
                                Balance {balance > 0 ? "due from customer" : balance < 0 ? "owed to customer" : ""}
                            </p>
                            <p
                                className={`mt-1 font-mono text-4xl font-semibold tabular-nums ${balance > 0
                                    ? "text-[#F87171] [text-shadow:0_0_18px_rgba(248,113,113,0.35)]"
                                    : "text-[#4ADE9A] [text-shadow:0_0_18px_rgba(74,222,154,0.35)]"
                                    }`}
                            >
                                Rs {balance}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-black/5 rounded-2xl shadow-sm space-y-3">
                        <label className="text-[11px] font-semibold tracking-widest text-black/40 uppercase">
                            Reason
                        </label>
                        <textarea
                            className="w-full border border-black/10 bg-[#FAFAF8] rounded-xl p-3 text-[14px] outline-none focus:ring-2 focus:ring-black/10 transition resize-none"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Why is this being returned or exchanged?"
                        />

                        <button
                            onClick={processExchange}
                            className="bg-[#0B6E4F] hover:bg-[#0A5F44] text-white w-full p-3.5 rounded-xl font-semibold tracking-wide cursor-pointer transition shadow-sm"
                        >
                            Process exchange
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}