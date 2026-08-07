import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "../../store/toastStore";

export default function Toast() {
  const message = useToast((s) => s.message);
  const type = useToast((s) => s.type);
  const visible = useToast((s) => s.visible);
  const clearToast = useToast((s) => s.clearToast);

  if (!message) return null;

  return (
    <div
      onClick={clearToast}
      className={`
        fixed top-4 right-4 z-50
        flex items-center gap-3
        px-4 py-3
        rounded-xl
        shadow-xl
        text-white
        cursor-pointer
        transition-all duration-300
        max-w-[90vw]
        md:max-w-sm

        ${visible
          ? "translate-x-0 opacity-100"
          : "translate-x-10 opacity-0"
        }

        ${type === "success"
          ? "bg-green-600"
          : "bg-red-600"
        }
      `}
    >
      {type === "success" ? (
        <CheckCircle size={20} />
      ) : (
        <XCircle size={20} />
      )}

      <span className="font-medium">
        {message}
      </span>
    </div>
  );
}