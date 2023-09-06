// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCMv5rUZKvw36rt3uEx3Fd8ncLW_BejC-U",
    authDomain: "territorioestrangeirojw.firebaseapp.com",
    projectId: "territorioestrangeirojw",
    storageBucket: "territorioestrangeirojw.appspot.com",
    messagingSenderId: "545856798082",
    appId: "1:545856798082:web:a9d890b1b98fe4bab2239b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Initialize products
const auth = getAuth(app)
const db = getDatabase(app);
const firestore = getFirestore(app);

export { app, auth, db, firestore }