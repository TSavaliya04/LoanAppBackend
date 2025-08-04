import { useSessionStore } from "@/stores/SessionStore";
import { useEffect, useState } from "react";

// useSessionStore.ts
export const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const unsub = useSessionStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    // If already hydrated
    if (useSessionStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return unsub;
  }, []);

  return hasHydrated;
};
