// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "rent-a-ride-5af16.firebaseapp.com",
  projectId: "rent-a-ride-5af16",
  storageBucket: "rent-a-ride-5af16.appspot.com",
  messagingSenderId: "1068277218849",
  appId: "1:1068277218849:web:8966754aa388cea132ed60"
};

let firebaseApp = null;
try {
  firebaseApp = initializeApp(firebaseConfig);
} catch (error) {
  console.warn("Firebase is not configured for local use.", error.message);
}

export const app = firebaseApp;