import { useEffect, useEffectEvent, useState, type Dispatch, type SetStateAction } from "react";

type AsyncState<T> = {
  data: T;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setData: Dispatch<SetStateAction<T>>;
};

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  initialData: T
): AsyncState<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useEffectEvent(async () => {
    setError(null);

    try {
      const nextData = await loader();
      setData(nextData);
    } catch (caughtError) {
      setError((caughtError as Error).message);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    isLoading,
    error,
    reload: async () => {
      setIsLoading(true);
      await load();
    },
    setData
  };
}
