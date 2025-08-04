import { initializeApp, getApps } from "@firebase/app";
import { getAuth, OAuthProvider } from "@firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_ID,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FB_MEASUREMENT_ID
  
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export default firebaseApp;

//export const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);

export const microsoftAuthProvider = new OAuthProvider("microsoft.com");

// firebaseAuth.setPersistence(browserLocalPersistence);

// microsoftAuthProvider.setCustomParameters({
//   tenant: process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID,
// });
