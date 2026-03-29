// Frontend/firebase-config.js

// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// TODO: REPLACE THIS ENTIRE CONFIG OBJECT WITH YOUR REAL KEYS
// const firebaseConfig = {
//     apiKey: "YOUR_API_KEY",
//     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//     projectId: "YOUR_PROJECT_ID",
//     storageBucket: "YOUR_PROJECT_ID.appspot.com",
//     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//     appId: "YOUR_APP_ID",
//     measurementId: "YOUR_MEASUREMENT_ID"
// };
const firebaseConfig = {
    apiKey: "AIzaSyD_xwkDUSvZpx0XBC_k1tjX7MAl7pYuV8g",
    authDomain: "kisansetu-7dc1d.firebaseapp.com",
    projectId: "kisansetu-7dc1d",
    storageBucket: "kisansetu-7dc1d.firebasestorage.app",
    messagingSenderId: "18686263097",
    appId: "1:18686263097:web:dfa3af4f394f294ea4b2e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Enable Offline Persistence (Satisfies NFR 5.2: 100% Offline Data Entry Resilience)
// This will cache data locally when the signal drops, and auto-sync when back online!
enableIndexedDbPersistence(db)
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.error("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
        } else if (err.code == 'unimplemented') {
            console.error("The current browser does not support all of the features required to enable persistence");
        }
    });

console.log("🔥 Firebase Initialized! Offline Sync is ACTIVE.");
