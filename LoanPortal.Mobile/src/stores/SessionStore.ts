// sessionStore.ts
import { User } from "@/api/models/user";
import { onAuthStateChanged } from "@firebase/auth";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { firebaseAuth } from "@/api/instances/firebase";
import { getRefreshToken } from "@/api/network/user";
import { getTokenRoles } from "@/utils/tokenRole";

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
  refreshToken: string;
}

interface SessionStoreSetUser {
  setUser: (user: User | null) => void;
  user: User | null;
  setHasHydrated: (value: boolean) => void;
}

onAuthStateChanged(firebaseAuth, async (firebaseUser: FirebaseUser | null) => {
  // window.alert(`Auth state changed. User: ${firebaseUser ? firebaseUser.email : "None"}`);
  const { setUser, user, setHasHydrated }: SessionStoreSetUser =
    useSessionStore.getState();

  if (firebaseUser) {
    const token: string = await firebaseUser.getIdToken();
    const refreshToken: string = await firebaseUser.refreshToken;
    // Role always comes from the token so a silent re-login can never switch role
    const { isAdmin, isBorrower } = getTokenRoles(token);
    setUser({
      userId: firebaseUser.uid,
      displayName: firebaseUser.displayName ?? "",
      firstName: "",
      lastName: "",
      email: firebaseUser.email ?? "",
      phone: firebaseUser.phoneNumber ?? "",
      token,
      refreshToken,
      isAdmin,
      isBorrower,
    });
  } else {
    if (user) {
      // window.alert("No Firebase user. Attempting token refresh.");
      const response = await getRefreshToken(user?.refreshToken || "");
      const data = response.data?.data;
      

      // window.alert(`Token refresh response: ${JSON.stringify(data)}`);

      if (!data) {
        // window.alert("Token refresh failed. Logging out.");
        setUser(null);
        return;
      }

      const userId = data.id;
      const firstName = data.firstName || "";
      const lastName = data.lastName || "";
      const displayName = `${firstName} ${lastName}`.trim();
      const email = data.email;
      const phone = data.phone;
      const token = data.idToken;
      const refreshToken = data.refreshToken;

      // window.alert(`data: ${JSON.stringify(data)}`);
      // window.alert(`token: ${JSON.stringify(token)}`);
      // window.alert(`user: ${JSON.stringify(user)}`);
      

      if (token && user) {
        const { isAdmin, isBorrower } = getTokenRoles(token);
        // window.alert("if token and user exist, setting new one.");
        setUser({
          userId,
          displayName,
          firstName,
          lastName,
          email,
          phone,
          token,
          refreshToken,
          isAdmin,
          isBorrower,
        });
      } else {
        // window.alert("setting user null");
        setUser(null);
      }
    }

    // window.alert("No Firebase user. setting existing one.");
    // setUser(user);
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