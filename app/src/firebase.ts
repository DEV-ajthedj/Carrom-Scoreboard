import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCqFT43zEqJQ_uqat5MYkxOQNVT0LRdpG4",
  authDomain: "carrom-scoreboard.firebaseapp.com",
  projectId: "carrom-scoreboard",
  storageBucket: "carrom-scoreboard.firebasestorage.app",
  messagingSenderId: "862163575261",
  appId: "1:862163575261:web:e0ce2b920af7d48e661634"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const isSignedIn = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
};