import axios from "axios";
import { toast as sonnerToast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";

const billingAction = {
  label: "View billing",
  onClick: () => {
    window.location.href = "/dashboard/billing";
  },
} as const;

export function toastError(error: unknown, fallback = "Something went wrong") {
  const message = getApiErrorMessage(error, fallback);

  if (axios.isAxiosError(error) && error.response?.status === 402) {
    sonnerToast.error(message, { action: billingAction });
    return;
  }

  sonnerToast.error(message);
}

export function toastSuccess(message: string) {
  sonnerToast.success(message);
}

export function toastFailure(message: string) {
  sonnerToast.error(message);
}

export { sonnerToast as toast };
