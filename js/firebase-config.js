import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  databaseURL: "https://namgameck-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "namgameck",
  authDomain: "namgameck.firebaseapp.com",
  storageBucket: "namgameck.appspot.com",
  // Nhớ điền API Key từ Firebase Console -> Project Settings
  apiKey: "YOUR_API_KEY",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
