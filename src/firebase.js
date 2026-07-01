// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCO40ZUkDMVqK14ZyhBi6z2mjSzTve_HVg",
  authDomain: "hk-tune-finder.firebaseapp.com",
  projectId: "hk-tune-finder",
  storageBucket: "hk-tune-finder.firebasestorage.app",
  messagingSenderId: "672915359557",
  appId: "1:672915359557:web:da1eb274f553b9aaf6a02c",
  measurementId: "G-PYWYMVQF9S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);