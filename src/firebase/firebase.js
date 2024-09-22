import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyBVb0nnngA3alTptzOGWkQgUqq96D1PdJ8",
    authDomain: "quizzical-d022a.firebaseapp.com",
    projectId: "quizzical-d022a",
    storageBucket: "quizzical-d022a.appspot.com",
    messagingSenderId: "582332251366",
    appId: "1:582332251366:web:7c0478b07f435dfadc0f27"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export { app, auth }