// sessionStore.ts
import { User } from "@/api/models/user";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { firebaseAuth } from "@/api/instances/firebase";
import { onAuthStateChanged } from "@firebase/auth";

interface SessionStoreState {
  user: User | null;
  hasHydrated: boolean;
}

interface SessionStoreFunctions {
  setUser: (user: User | null) => void;
  setHasHydrated: (value: boolean) => void;
}

type SessionStore = SessionStoreState & SessionStoreFunctions;

export const useSessionStore = create(
  persist<SessionStore>(
    (set) => ({
      user: null,
      hasHydrated: false,

      setUser: (user: User | null) => {
        set(
          produce((state: SessionStore) => {
            state.user = user;
          })
        );
      },

      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
      },
    }),
    { name: "local-session-store" }
  )
);

// 🔑 Sync Zustand with Firebase
interface FirebaseUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  getIdToken: () => Promise<string>;
}

interface SessionStoreSetUser {
  setUser: (user: User | null) => void;
  setHasHydrated: (value: boolean) => void;
}

onAuthStateChanged(firebaseAuth, async (firebaseUser: FirebaseUser | null) => {
  const { setUser, setHasHydrated  }: SessionStoreSetUser = useSessionStore.getState();

  if (firebaseUser) {
    const token: string = await firebaseUser.getIdToken();
    setUser({
      userId: firebaseUser.uid,
      displayName: firebaseUser.displayName ?? "",
      firstName: "",
      lastName: "",
      email: firebaseUser.email ?? "",
      phone: firebaseUser.phoneNumber ?? "",
      token, // store token for UI if needed
    });
  } else {
    setUser(null);
  }
  setHasHydrated(true);
});


// import { User } from "@/api/models/user";
// import { produce } from "immer";
// import { create } from "zustand";
// import { createJSONStorage, persist } from "zustand/middleware";

// interface SessionStoreState {
//   user: User | null;
//   verificationId: string | null;
//   hasHydrated: boolean;
// }

// interface SessionStoreFunctions {
//   setUser: (user: User | null) => void;
//   setVerificationId: (verificationId: string | null) => void;
//   setHasHydrated: (value: boolean) => void;
// }

// type SessionStore = SessionStoreState & SessionStoreFunctions;

// export const useSessionStore = create(
//   persist<SessionStore>(
//     (set) => ({
//       user: null,
//       verificationId: null,
//       hasHydrated: false,

//       setUser: (user: User | null) => {
//         set(
//           produce((state: SessionStore) => {
//             state.user = user;
//           })
//         );
//       },

//       setVerificationId: (verificationId: string | null) => {
//         set(
//           produce((state: SessionStore) => {
//             state.verificationId = verificationId;
//           })
//         );
//       },

//       setHasHydrated: (value: boolean) => {
//         set({ hasHydrated: value });
//       },
//     }),
//     {
//       name: "local-param-store",
//       storage: createJSONStorage(() => localStorage),
//       onRehydrateStorage: (state) => {
//         return () => {
//           console.log(state.user);
          
//           console.log("✅ Zustand hydration complete");
//           state.setHasHydrated(true);
//         };
//       },
//     }
//   )
// );

// import { User } from "@/api/models/user";
// import { produce } from "immer";
// import { create } from "zustand";
// import { createJSONStorage, persist } from "zustand/middleware";

// interface SessionStoreState {
//   user: User | null;
//   verificationId: string | null;
//   hasHydrated: boolean;
// }

// interface SessionStoreFunctions {
//   setUser: (user: User | null) => void;
//   setVerificationId: (verificationId: string | null) => void;
//   setHasHydrated: (value: boolean) => void;
// }

// type SessionStore = SessionStoreState & SessionStoreFunctions;

// export const useSessionStore = create(
//   persist<SessionStore>(
//     (set) => ({
//       user: null,
//       verificationId: null,
//       hasHydrated: false,

//       setUser: async (user: User | null) => {
//         set(
//           produce((state: SessionStore) => {
//             // if (user?.token != undefined || user?.token != null) {
//             //   state.user = user; // ✅ Don't wipe token unless intentional
//             // }
//               state.user = user;
//           })
//         );
//       },

//       setVerificationId: (verificationId: string | null) => {
//         set(
//           produce((state: SessionStore) => {
//             state.verificationId = verificationId;
//           })
//         );
//       },

//       setHasHydrated: (value: boolean) => {
//         set({ hasHydrated: value });
//       },
//     }),
//     {
//       name: "local-param-store",
//       storage: createJSONStorage(() => ({
//         getItem: (name: string) => {
//           const item = localStorage.getItem(name);
//           return item ? decodeBase64(item) : null;
//         },
//         setItem: (name: string, value: string) => {
//           localStorage.setItem(name, encodeBase64(value));
//         },
//         removeItem: (name: string) => {
//           localStorage.removeItem(name);
//         },
//       })),
//       onRehydrateStorage: (state) => {
//         return () => {
//           console.log("✅ Zustand hydration complete");
//           state.setHasHydrated(true);
//         };
//       },
//     }
//   )
// );

// function encodeBase64(data: string) {
//   return Buffer.from(data).toString("base64");
// }
// function decodeBase64(data: string) {
//   return Buffer.from(data, "base64").toString("ascii");
// }
