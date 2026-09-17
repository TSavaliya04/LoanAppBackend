import { initializeApp } from "@firebase/app";
import { 
  getAuth, 
  OAuthProvider, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence, 
  setPersistence 
} from "@firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_ID,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FB_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);

/**
 * Try to set the best persistence mode depending on what the browser supports.
 */
async function setBestPersistence(auth: ReturnType<typeof getAuth>) {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log("Firebase Auth Persistence: Local");
  } catch (err) {
    console.warn("Local persistence failed, trying Session:", err);
    try {
      await setPersistence(auth, browserSessionPersistence);
      console.log("Firebase Auth Persistence: Session");
    } catch (err2) {
      console.warn("Session persistence failed, using In-Memory:", err2);
      await setPersistence(auth, inMemoryPersistence);
      console.log("Firebase Auth Persistence: In-Memory");
    }
  }
}

// Run it immediately on load
setBestPersistence(firebaseAuth);

export { firebaseAuth };
export const microsoftAuthProvider = new OAuthProvider("microsoft.com");
