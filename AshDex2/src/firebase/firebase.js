import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC2ES4nTnmnlki-7zxPHnqAxHW58TuR0-Y",
  authDomain:
    "ashdex-production.firebaseapp.com",
  projectId: "ashdex-production",
  storageBucket:
    "ashdex-production.firebasestorage.app",
  messagingSenderId:
    "491560788612",
  appId:
    "1:491560788612:web:3aec68cf1683cf219bd8d1",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider =
  new GoogleAuthProvider();