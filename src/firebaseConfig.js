import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database"; // Ajout des imports pour Realtime Database
import { getFirestore } from "firebase/firestore"; // Firestore

const firebaseConfig = {
    apiKey: "AIzaSyAmIKdUe78yXWbODfy6A--SEAY-1EgajTY",
    authDomain: "iot-359c8.firebaseapp.com",
    databaseURL: "https://iot-359c8-default-rtdb.firebaseio.com",
    projectId: "iot-359c8",
    storageBucket: "iot-359c8.firebasestorage.app",
    messagingSenderId: "660379896437",
    appId: "1:660379896437:web:4f6b5a7d8ce5183ca7463c"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Firestore (si tu veux l'utiliser aussi)
const db = getFirestore(app);

// Realtime Database (pour ref et onValue)
const database = getDatabase(app);

export { db, database, ref, onValue };
