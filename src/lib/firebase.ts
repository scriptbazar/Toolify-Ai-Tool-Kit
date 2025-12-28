
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCr9mGn2d7OWTX3B-TKxvO3kb7gB_yABdE",
  authDomain: "toolifyai-7sfvi.firebaseapp.com",
  projectId: "toolifyai-7sfvi",
  storageBucket: "toolifyai-7sfvi.appspot.com",
  messagingSenderId: "69818852370",
  appId: "1:69818852370:web:375b674cfee5e2c863e4cb",
  measurementId: "G-TPHVVFR0YT"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
