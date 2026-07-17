import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific databaseId if configured
const db = firebaseConfig.firestoreDatabaseId
  ? initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export { app, db };
