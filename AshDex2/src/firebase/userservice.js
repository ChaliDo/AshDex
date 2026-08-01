import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export async function saveUserProfile(user) {
  if (!user) {
    throw new Error("User is required.");
  }

  const userReference = doc(db, "users", user.uid);

  await setDoc(
    userReference,
    {
      uid: user.uid,
      displayName: user.displayName || "Trainer",
      email: user.email || "",
      photoURL: user.photoURL || "",
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}