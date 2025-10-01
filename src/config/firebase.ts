import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4a7rzZZU-3uZ39iyg692GSHLRSUw18Co",
  authDomain: "high-school-student-app.firebaseapp.com",
  projectId: "high-school-student-app",
  storageBucket: "high-school-student-app.appspot.com",
  messagingSenderId: "1067802713097",
  appId: "1:1067802713097:web:56ca5739a95c3876f2ecd8",
  measurementId: "G-1RK7WQTHCB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;