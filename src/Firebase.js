// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCM20jlckQEMNQm823TEIeNvnzGDl0uYPc",
  authDomain: "trade-e301f.firebaseapp.com",
  projectId: "trade-e301f",
  storageBucket: "trade-e301f.firebasestorage.app",
  messagingSenderId: "722130711348",
  appId: "1:722130711348:web:f139cedf0f53756107ab61",
  measurementId: "G-KQDKZ2HXTW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);