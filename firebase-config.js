
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBrYYN1q0k3GMtf44RFuwhbyFmdGlNoM6E",
  authDomain: "absensi-digital-siswa-50228.firebaseapp.com",
  projectId: "absensi-digital-siswa-50228",
  storageBucket: "absensi-digital-siswa-50228.firebasestorage.app",
  messagingSenderId: "465077202530",
  appId: "1:465077202530:web:99c45c56411242956c6b3b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
