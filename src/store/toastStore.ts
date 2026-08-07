import { create } from "zustand";

interface ToastState {
  message: string | null;
  type: "success" | "error" | null;
  visible: boolean;

  showToast: (
    message: string,
    type?: "success" | "error"
  ) => void;

  clearToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  type: null,
  visible: false,

  showToast: (message, type = "success") => {
    set({
      message,
      type,
      visible: true,
    });

    setTimeout(() => {
      set({ visible: false });

      setTimeout(() => {
        set({
          message: null,
          type: null,
        });
      }, 300);
    }, 3000);
  },

  clearToast: () => {
    set({
      visible: false,
    });

    setTimeout(() => {
      set({
        message: null,
        type: null,
      });
    }, 300);
  },
}));