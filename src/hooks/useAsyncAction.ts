import { useCallback, useState } from "react";
import { toastError, toastSuccess } from "@/lib/toast";

interface RunOptions {
  fallbackMessage?: string;
  successMessage?: string;
}

export function useAsyncAction() {
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (action: () => Promise<void>, options?: RunOptions) => {
    setLoading(true);
    try {
      await action();
      if (options?.successMessage) {
        toastSuccess(options.successMessage);
      }
    } catch (err) {
      toastError(err, options?.fallbackMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, run };
}
