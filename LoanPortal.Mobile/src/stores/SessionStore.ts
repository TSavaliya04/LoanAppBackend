import { User } from "@/api/models/user";
import { produce } from "immer";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SessionStoreState {
  user: User | null;
  verificationId: string | null;
  hasHydrated: boolean;
}

interface SessionStoreFunctions {
  setUser: (user: User | null) => void;
  setVerificationId: (verificationId: string | null) => void;
  setHasHydrated: (value: boolean) => void;
}

type SessionStore = SessionStoreState & SessionStoreFunctions;

export const useSessionStore = create(
  persist<SessionStore>(
    (set) => ({
      user: null,
      verificationId: null,
      hasHydrated: false,

      setUser: async (user: User | null) => {
        set(
          produce((state: SessionStore) => {
            if (user) state.user = { ...user, token: "" };
            else state.user = null;
          })
        );
      },

      setVerificationId: (verificationId: string | null) => {
        set(
          produce((state: SessionStore) => {
            state.verificationId = verificationId;
          })
        );
      },

      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
      },
    }),
    {
      name: "local-param-store",
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          const item = localStorage.getItem(name);
          return item ? decodeBase64(item) : null;
        },
        setItem: (name: string, value: string) => {
          localStorage.setItem(name, encodeBase64(value));
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      })),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

function encodeBase64(data: string) {
  return Buffer.from(data).toString("base64");
}
function decodeBase64(data: string) {
  return Buffer.from(data, "base64").toString("ascii");
}
