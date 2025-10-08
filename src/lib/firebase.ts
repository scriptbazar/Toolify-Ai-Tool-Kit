
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyA4259SgKef4wJ9wD6vZN-ko-tP3E1a8_Y",
  authDomain: "toolifyai-7sfvi.firebaseapp.com",
  projectId: "toolifyai-7sfvi",
  storageBucket: "toolifyai-7sfvi.appspot.com",
  messagingSenderId: "1091938363769",
  appId: "1:1091938363769:web:a37651a8a253965158189c"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
