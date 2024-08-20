import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBVb0nnngA3alTptzOGWkQgUqq96D1PdJ8",
    authDomain: "quizzical-d022a.firebaseapp.com",
    projectId: "quizzical-d022a",
    storageBucket: "quizzical-d022a.appspot.com",
    messagingSenderId: "582332251366",
    appId: "1:582332251366:web:7c0478b07f435dfadc0f27"
};

let app, auth, db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

export { auth, db };