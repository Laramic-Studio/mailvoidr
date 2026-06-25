import { toast as sonnerToast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";

export function toastError(error: unknown, fallback = "Something went wrong") {
  sonnerToast.error(getApiErrorMessage(error, fallback));
}

export function toastSuccess(message: string) {
  sonnerToast.success(message);
}

export { sonnerToast as toast };
