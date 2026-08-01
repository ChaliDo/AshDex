import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

export function createTrainerCode(uid) {
  if (!uid) {
    throw new Error("User ID is required.");
  }

  const cleanUid = uid
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8)
    .toUpperCase();

  return `ASH-${cleanUid}`;
}

export async function publishPublicProfile({
  user,
  trainerProfile,
  ownedPokemon,
  totalPokemon,
}) {
  if (!user?.uid) {
    throw new Error(
      "You must be signed in."
    );
  }

  if (!trainerProfile) {
    throw new Error(
      "Trainer profile is missing."
    );
  }

  const trainerCode =
    trainerProfile.trainerCode ||
    createTrainerCode(user.uid);

  const ownedPokemonIds =
    Object.entries(
      ownedPokemon || {}
    )
      .filter(
        ([, owned]) =>
          owned === true
      )
      .map(
        ([pokemonId]) =>
          pokemonId
      );

  const publicProfileReference = doc(
    db,
    "publicProfiles",
    trainerCode
  );

  await setDoc(
    publicProfileReference,
    {
      uid: user.uid,
      trainerCode,

      trainerName:
        trainerProfile.trainerName ||
        user.displayName ||
        "Trainer",

      trainerTitle:
        trainerProfile.trainerTitle ||
        "Pokémon Figure Collector",

      photoURL:
        trainerProfile.profileImageURL ||
        user.photoURL ||
        "",

      profileImageURL:
        trainerProfile.profileImageURL ||
        "",

      favoritePokemonId:
        trainerProfile.favoritePokemonId ||
        "",

      favoriteRegion:
        trainerProfile.favoriteRegion ||
        "",

      cardTheme:
        trainerProfile.cardTheme ||
        "classic",

      collectionStartDate:
        trainerProfile.collectionStartDate ||
        "",

      featuredBadgeIds:
        Array.isArray(
          trainerProfile.featuredBadgeIds
        )
          ? trainerProfile.featuredBadgeIds
          : [],

      ownedPokemon:
        ownedPokemonIds,

      ownedCount:
        ownedPokemonIds.length,

      totalPokemon:
        totalPokemon || 0,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  return trainerCode;
}

export async function findPublicProfile(
  rawTrainerCode
) {
  const trainerCode =
    rawTrainerCode
      .trim()
      .toUpperCase();

  if (!trainerCode) {
    throw new Error(
      "Trainer Code is required."
    );
  }

  const profileReference = doc(
    db,
    "publicProfiles",
    trainerCode
  );

  const snapshot = await getDoc(
    profileReference
  );

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}