// logoToBase64.ts
// Call this once when your app loads, then pass the result into printReceipt()

import logoUrl from "../assets/logo.jpeg";

export async function loadLogoAsBase64(): Promise<string> {
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ── Usage example ─────────────────────────────────────────────────────────────
//
// import { loadLogoAsBase64 } from "./logoToBase64";
// import { printReceipt } from "./PrintReceipt";
//
// const logoBase64 = await loadLogoAsBase64();   // do this once at startup
//
// printReceipt({
//   logoBase64,
//   invoiceNumber: "INV-001",
//   items: [{ name: "Rice 5kg", quantity: 2, price: 450 }],
//   total: 900,
//   paid: 1000,
//   change: 100,
//   paymentMode: "cash",
// });