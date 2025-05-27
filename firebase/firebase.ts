// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA57VCOiK-aON3FWMkdV7EVLK95lnoErWo",
  authDomain: "kyodai-finders.firebaseapp.com",
  projectId: "kyodai-finders",
  storageBucket: "kyodai-finders.firebasestorage.app",
  messagingSenderId: "727718213328",
  appId: "1:727718213328:web:20f69dca5325c8ad0e50d5",
  measurementId: "G-C6G0R4CMG1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
isSupported().then((yes) => {
  if (yes) {
    const analytics = getAnalytics(app);
  }
});
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { auth, db };

