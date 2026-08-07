import { useState } from "react";
import POSPage from "./pages/pos/POSPage";
import ReturnPOSPage from "./pages/pos/ReturnPOSPage";
import Toast from "./components/ui/toast";

export default function App() {
  const [page, setPage] = useState("pos");

  return (
    <>
      <Toast />

      <div className="flex gap-1 p-2 bg-[#12171A] sticky top-0 z-30">
        <button
          onClick={() => setPage("pos")}
          className={`px-4 py-2 cursor-pointer rounded-xl text-[14px] font-medium transition ${page === "pos"
            ? "bg-[#0B6E4F] text-white shadow-sm"
            : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
        >
          POS
        </button>

        <button
          onClick={() => setPage("return")}
          className={`px-4 py-2 cursor-pointer rounded-xl text-[14px] font-medium transition ${page === "return"
            ? "bg-[#4338CA] text-white shadow-sm"
            : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
        >
          Returns
        </button>
      </div>

      {page === "pos" && <POSPage />}
      {page === "return" && <ReturnPOSPage />}
    </>
  );
}