import { User } from "@/api/models/user";
import { firebaseAuth } from "@/api/instances/firebase";
import { useSessionStore } from "@/stores/SessionStore";
import axios, {
  AxiosError,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { getIDToken, getRefreshToken } from "../network/user";
import { jwtDecode } from "jwt-decode";
import { getTokenRoles } from "@/utils/tokenRole";

interface CustomConfig extends InternalAxiosRequestConfig {
  _retry: boolean;
}

interface SessionStoreSetUser {
  setUser: (user: User | null) => void;
  user: User | null;
  setHasHydrated: (value: boolean) => void;
}

const exitToSignIn = () => {
  console.log("Exiting to Sign In due to token refresh failure.");
  localStorage.clear();
  window.location.href = "/auth/SignIn";
};

const guardedInstance = axios.create();

guardedInstance.interceptors.request.use(
  async (config) => {
    config.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const { user, hasHydrated } = useSessionStore.getState();

    if (!hasHydrated) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    let token = user?.token;
    if (token) {
      const now = Math.floor(Date.now() / 1000);
      const decoded = jwtDecode(token);
      if (typeof decoded === "object" && decoded !== null) {
        const exp = (decoded as any).exp;
        // console.log("expire on =>",exp);
        // console.log("now =>",now);
        
        if (exp < now) {
          console.log("Token expired. Refreshing...");
          await getNewIDToken(user?.refreshToken || "");
          console.log("666");
          token = useSessionStore.getState().user?.token;
        } else {
          // console.log("Token valid. Proceeding with request.");
        }
      }
    }
    // console.log("777");
    // console.log("new token =>", token);
    

    config.headers = {
      ...config.headers,
      Authorization: token ? `Bearer ${token}` : "",
    } as AxiosRequestHeaders;

    return config;
  },
  (error) => Promise.reject(error)
);

//this may never fire because the above id token function refreshes itself...
// pls test and if that's true remove the below function
guardedInstance.interceptors.response.use(
  (response) => response,
  async function (error: AxiosError) {
    const originalRequest = error.config as CustomConfig;
    console.log(originalRequest);
    if (error.response?.status === 403 || error.response?.status === 502) {
      console.error("service is down.");
      window.location.href = "/downtime";
      return Promise.reject(error);
    }
    if (!originalRequest) return exitToSignIn();

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshLocalToken();
      return guardedInstance(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default guardedInstance;

async function refreshLocalToken() {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) {
    exitToSignIn();
  }
  guardedInstance.defaults.headers["Authorization"] = `Bearer ${token}`;
}

async function getNewIDToken(refreshToken: string) {
  console.log("111");
  
  const { setUser, user, setHasHydrated }: SessionStoreSetUser =
    useSessionStore.getState();
  try {
    const response = await getIDToken(refreshToken || "");
    const data = response.data?.data;
    const userData = data?.user;
    console.log("response =>", data);
    console.log("user response =>", userData);
    
    console.log("22");
    if (!data) {
      // window.alert("Token refresh failed. Logging out.");
      setUser(null);
      return;
    }

    const userId = data.id;
    const firstName = userData.firstName || "";
    const lastName = userData.lastName || "";
    const displayName = `${firstName} ${lastName}`.trim();
    const email = userData.email;
    const phone = userData.phone;
    const token = data.idToken;
    const newRefreshToken = data.refreshToken;
    console.log("333");

    if (token && user) {
      const { isAdmin, isBorrower } = getTokenRoles(token);
      console.log("444");
      // window.alert("if token and user exist, setting new one.");
      setUser({
        userId,
        displayName,
        firstName,
        lastName,
        email,
        phone,
        token,
        refreshToken: newRefreshToken,
        isAdmin,
        isBorrower,
      });
      console.log("555");
    } else {
      // window.alert("setting user null");
      setUser(null);
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  } finally {
    setHasHydrated(true);
  }
}
