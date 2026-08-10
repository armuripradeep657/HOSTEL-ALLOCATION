import "dotenv/config";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL,
};

const isUrlValid = (url: string | undefined): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith("https://") && !trimmed.includes("<YOUR") && !trimmed.includes("<YOUR_FIREBASE_DATABASE_URL>");
};

const isApiKeyValid = (key: string | undefined): boolean => {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed !== "" && !trimmed.includes("<YOUR") && !trimmed.includes("<YOUR_FIREBASE_API_KEY>");
};

export const isFirebaseConfigured = !!(
  isApiKeyValid(firebaseConfig.apiKey) &&
  isUrlValid(firebaseConfig.databaseURL)
);

let cachedToken: string | null = null;
let tokenExpiryTime: number = 0; // Epoch ms

async function getAuthToken(forceRefresh = false): Promise<string | null> {
  if (!isFirebaseConfigured) return null;
  const now = Date.now();
  if (cachedToken && tokenExpiryTime > now && !forceRefresh) {
    return cachedToken;
  }

  // Obtain ID token via REST API
  try {
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;
    const email = "A001@hostel.com";
    const password = "admin123";

    console.log(`🔐 Authenticating Firebase session as ${email}...`);
    const res = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });

    let authData = await res.json() as any;

    if (res.status !== 200) {
      console.warn("🔐 Firebase sign-in failed, registering a new account profile...", authData);
      // Auto-register since user account profile may not exist in Firebase Auth yet
      const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
      const signUpRes = await fetch(signUpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });
      authData = await signUpRes.json();
      if (signUpRes.status !== 200) {
        console.warn("🔐 Firebase sign-up failed, attempting anonymous registration fallback...", authData);
        const anonRes = await fetch(signUpUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ returnSecureToken: true })
        });
        authData = await anonRes.json();
        if (signUpRes.status !== 200) {
          throw new Error(`All Firebase authentication flows failed: ${JSON.stringify(authData)}`);
        }
      }
    }

    if (authData.idToken) {
      cachedToken = authData.idToken;
      const expiresInSec = parseInt(authData.expiresIn || "3600", 10);
      tokenExpiryTime = Date.now() + (expiresInSec - 600) * 1000; // cache for 50m
      console.log("🔥 Successfully synchronized backend session with Firebase.");
      return cachedToken;
    }
    return null;
  } catch (err) {
    console.error("❌ Failed to synchronize Firebase session:", err);
    return null;
  }
}

export async function fetchFromDB(path: string, fallbackData: any) {
  if (!isFirebaseConfigured) {
    return fallbackData;
  }

  let idToken = await getAuthToken();
  if (!idToken) {
    console.error(`❌ Firebase session is unauthenticated. Cannot fetch path "${path}".`);
    return fallbackData;
  }

  try {
    const url = `${firebaseConfig.databaseURL}/${path}.json?auth=${idToken}`;
    let res = await fetch(url);

    // Refresh if potentially token expired
    if (res.status === 401) {
      console.warn(`🔐 Token expired/invalid for path "${path}", renewing...`);
      idToken = await getAuthToken(true);
      if (idToken) {
        const retryUrl = `${firebaseConfig.databaseURL}/${path}.json?auth=${idToken}`;
        res = await fetch(retryUrl);
      }
    }

    if (res.status === 200) {
      const data = await res.json();
      if (data !== null) {
        if (Array.isArray(fallbackData)) {
          if (Array.isArray(data)) return data;
          if (data && typeof data === "object") {
            return Object.values(data);
          }
        }
        return data;
      } else {
        console.log(`ℹ️ Path "${path}" is empty. Initializing with default data...`);
        await saveToDB(path, fallbackData);
        return fallbackData;
      }
    } else {
      const errorText = await res.text();
      console.error(`❌ Error fetching path "${path}". Status: ${res.status}. Error: ${errorText}`);
      return fallbackData;
    }
  } catch (err: any) {
    console.error(`❌ Network error fetching path "${path}":`, err.message || err);
    return fallbackData;
  }
}

export async function saveToDB(path: string, data: any) {
  if (!isFirebaseConfigured) {
    return;
  }

  let idToken = await getAuthToken();
  if (!idToken) {
    console.error(`❌ Firebase session is unauthenticated. Cannot save path "${path}".`);
    return;
  }

  try {
    const url = `${firebaseConfig.databaseURL}/${path}.json?auth=${idToken}`;
    let res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.status === 401) {
      console.warn(`🔐 Token expired/invalid for path "${path}" save operation, renewing...`);
      idToken = await getAuthToken(true);
      if (idToken) {
        const retryUrl = `${firebaseConfig.databaseURL}/${path}.json?auth=${idToken}`;
        res = await fetch(retryUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      }
    }

    if (res.status !== 200) {
      const errorText = await res.text();
      console.error(`❌ Failed to save path "${path}". Status: ${res.status}. Error: ${errorText}`);
    } else {
      console.log(`💾 Successfully synchronized path "${path}" to Firebase.`);
    }
  } catch (err: any) {
    console.error(`❌ Error saving path "${path}" to Firebase:`, err.message || err);
  }
}
