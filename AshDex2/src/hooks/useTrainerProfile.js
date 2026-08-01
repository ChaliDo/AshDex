import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import {
  createTrainerCode,
} from "../services/publicProfileService";

export function useTrainerProfile(user) {
  const [
    trainerProfile,
    setTrainerProfile,
  ] = useState(null);

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true);

  const [
    profileError,
    setProfileError,
  ] = useState("");

  useEffect(() => {
    if (!user) {
      setTrainerProfile(null);
      setProfileLoading(false);
      setProfileError("");

      return undefined;
    }

    setProfileLoading(true);

    const userReference = doc(
      db,
      "users",
      user.uid
    );

    const unsubscribe = onSnapshot(
      userReference,
      (snapshot) => {
        const data =
          snapshot.data() || {};

        setTrainerProfile({
          trainerName:
            data.trainerName ||
            user.displayName ||
            "Trainer",

          trainerTitle:
            data.trainerTitle ||
            "Pokémon Figure Collector",

          favoritePokemonId:
            data.favoritePokemonId || "",

          favoriteRegion:
            data.favoriteRegion || "",

          trainerCode:
            data.trainerCode ||
            createTrainerCode(user.uid),

          cardTheme:
            data.cardTheme || "classic",

          collectionStartDate:
            data.collectionStartDate || "",

          featuredBadgeIds:
            Array.isArray(
              data.featuredBadgeIds
            )
              ? data.featuredBadgeIds
              : [],

          profileImageURL:
            data.profileImageURL || "",
        });

        setProfileLoading(false);
        setProfileError("");
      },
      (error) => {
        console.error(
          "Trainer profile listener failed:",
          error
        );

        setProfileError(
          error.message ||
            "Trainer profile could not be loaded."
        );

        setProfileLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return {
    trainerProfile,
    profileLoading,
    profileError,
  };
}