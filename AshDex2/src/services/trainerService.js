import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

export async function saveTrainerProfile(
  uid,
  profileData
) {
  if (!uid) {
    throw new Error("User ID is required.");
  }

  const userReference = doc(
    db,
    "users",
    uid
  );

  await setDoc(
    userReference,
    {
      trainerName:
        profileData.trainerName?.trim() ||
        "Trainer",

      trainerTitle:
        profileData.trainerTitle?.trim() ||
        "Pokémon Figure Collector",

      favoritePokemonId:
        profileData.favoritePokemonId || "",

      favoriteRegion:
        profileData.favoriteRegion || "",

      cardTheme:
        profileData.cardTheme || "classic",

      collectionStartDate:
        profileData.collectionStartDate || "",

      featuredBadgeIds:
        Array.isArray(
          profileData.featuredBadgeIds
        )
          ? profileData.featuredBadgeIds
          : [],

      profileImageURL:
        profileData.profileImageURL || "",

      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}