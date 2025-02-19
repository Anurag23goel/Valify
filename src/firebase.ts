import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  getFirestore, // Import Firestore functions
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore'; // Firestore imports
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAnusPvY7HPDyRlXrP0cTX9kfB117-D704',
  authDomain: 'valify-7e530.firebaseapp.com',
  projectId: 'valify-7e530',
  storageBucket: 'valify-7e530.appspot.com',
  messagingSenderId: '698656086114',
  appId: '1:698656086114:web:77b05f0a6bb43c2e01193b',
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Google provider
const auth = getAuth(app);
const storage = getStorage();
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
const firestore = getFirestore(app); // Initialize Firestore service

// Export the required Firebase services and Firestore for use
export {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  firestore, // Export Firestore instance
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  storage
};
