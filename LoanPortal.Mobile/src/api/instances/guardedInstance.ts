import { firebaseAuth } from "@/api/instances/firebase";
import { useSessionStore } from "@/stores/SessionStore";
// import { getAuth } from "@firebase/auth";
import axios, {
  AxiosError,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";
// import Router from "next/router";
import { useRouter } from "next/navigation";
// import { useUserOrganisationStore } from "@/store/useUserOrganisationStore";

interface CustomConfig extends InternalAxiosRequestConfig {
  _retry: boolean;
}

// const auth = getAuth();
const exitToSignIn = (router: ReturnType<typeof useRouter>) => {
  console.log("Exiting to Sign In due to token refresh failure.");
  
  localStorage.clear();
  router.push("/auth/SignIn");
};

const guardedInstance = axios.create();

guardedInstance.interceptors.request.use(
  async (config) => {
    config.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Ensure Firebase user is checked
    // const firebaseUser = auth.currentUser;
    // if (firebaseUser) {
    //   console.log("firebaseuser =>", firebaseUser);
    // }

    // Always get latest state after hydration
    const { user, hasHydrated } = useSessionStore.getState();

    // If not hydrated yet, wait a bit (edge case: first page load)
    if (!hasHydrated) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const token = user?.token;
    // const token = await auth.currentUser?.getIdToken(true);

    // console.log("Token from session store:", token);
    

    config.headers = {
      ...config.headers,
      Authorization: token ? `Bearer ${token}` : "",
    } as AxiosRequestHeaders;

    return config;
  },
  (error) => Promise.reject(error)
);


// function waitForFirebaseAuthReady() {
//   return new Promise<void>((resolve) => {
//     const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
//       if (user) {
//         unsubscribe();
//         resolve();
//       }
//     });
//   });
// }

// const guardedInstance = axios.create();
// guardedInstance.interceptors.request.use(
//   async (config) => {
//     config.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
//     // const { isRefreshToken, setRefreshToken } = useUserOrganisationStore.getState();
//     // const test = await firebaseAuth.currentUser;
//     // const token = isRefreshToken ? await firebaseAuth.currentUser?.getIdToken(true) : await firebaseAuth.currentUser?.getIdToken();
//     const token = await firebaseAuth.currentUser?.getIdToken();

//     config.headers = {
//       ...config.headers,
//       Authorization: `Bearer ${token}`,
//     } as AxiosRequestHeaders;
//     // setRefreshToken(false);
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

//this may never fire because the above id token function refreshes itself...
// pls test and if that's true remove the below function
guardedInstance.interceptors.response.use(
  (response) => response,
  async function (error: AxiosError) {
    const router = useRouter();
    const originalRequest = error.config as CustomConfig;
    console.log(originalRequest);
    if (error.response?.status === 403 || error.response?.status === 502) {
      console.error("service is down.");
      router.push("/downtime");
      return Promise.reject(error);
    }
    if (!originalRequest) return exitToSignIn(router);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshLocalToken(router);
      return guardedInstance(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default guardedInstance;

async function refreshLocalToken(router: ReturnType<typeof useRouter>) {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) {
    exitToSignIn(router);
  }
  guardedInstance.defaults.headers["Authorization"] = `Bearer ${token}`;
}
