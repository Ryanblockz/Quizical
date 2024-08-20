import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBVb0nnngA3alTptzOGWkQgUqq96D1PdJ8",
    authDomain: "quizzical-d022a.firebaseapp.com",
    projectId: "quizzical-d022a",
    storageBucket: "quizzical-d022a.appspot.com",
    messagingSenderId: "582332251366",
    appId: "1:582332251366:web:7c0478b07f435dfadc0f27",
    databaseURL: "https://quizzical-d022a-default-rtdb.europe-west1.firebasedatabase.app/"
};

let app, auth, db, rtdb;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);

    // If you're using Firebase Emulators for local development, uncomment these lines:
    // if (process.env.NODE_ENV === 'development') {
    //     connectFirestoreEmulator(db, 'localhost', 8080);
    //     connectDatabaseEmulator(rtdb, 'localhost', 9000);
    // }

} catch (error) {
    console.error("Error initializing Firebase:", error);
}

export { auth, db, rtdb };