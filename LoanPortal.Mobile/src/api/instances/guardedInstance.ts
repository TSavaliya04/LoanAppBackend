import { firebaseAuth } from "@/api/instances/firebase";
import axios, {
  AxiosError,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import Router from "next/router";
// import { useUserOrganisationStore } from "@/store/useUserOrganisationStore";

interface CustomConfig extends InternalAxiosRequestConfig {
  _retry: boolean;
}

const exitToSignIn = () => {
  localStorage.clear();
  Router.push({
    pathname: "/auth/SignIn",
    query: {
      cb: Router.query["cb"] != undefined ? Router.query["cb"] : Router.asPath,
    },
  });
};

const guardedInstance = axios.create();
guardedInstance.interceptors.request.use(
  async (config) => {
    config.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    // const { isRefreshToken, setRefreshToken } = useUserOrganisationStore.getState();
    // const test = await firebaseAuth.currentUser;
    // const token = isRefreshToken ? await firebaseAuth.currentUser?.getIdToken(true) : await firebaseAuth.currentUser?.getIdToken();
    const token = await firebaseAuth.currentUser?.getIdToken();
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    } as AxiosRequestHeaders;
    // setRefreshToken(false);
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
    console.log(originalRequest)
    if (error.response?.status === 403 || error.response?.status === 502) {
      console.error("service is down.");
      Router.push("/downtime");
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
