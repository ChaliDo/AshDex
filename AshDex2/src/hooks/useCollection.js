import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { ashPokemon } from "../data/ashPokemon";
import { db } from "../firebase/firebase";

const legacyIdLookup = Object.fromEntries(
  ashPokemon.map((pokemon) => [
    pokemon.name.toLowerCase(),
    pokemon.id,
  ])
);

export function useCollection(user) {
  const [ownedPokemon, setOwnedPokemon] = useState({});
  const [collectionLoading, setCollectionLoading] =
    useState(true);
  const [collectionError, setCollectionError] =
    useState("");

  useEffect(() => {
    if (!user) {
      setOwnedPokemon({});
      setCollectionLoading(false);
      setCollectionError("");
      return undefined;
    }

    setCollectionLoading(true);
    setCollectionError("");

    const collectionReference = collection(
      db,
      "users",
      user.uid,
      "collection"
    );

    const unsubscribe = onSnapshot(
      collectionReference,
      (snapshot) => {
        const nextOwnedPokemon = {};

        snapshot.forEach((documentSnapshot) => {
          const pokemonData = documentSnapshot.data();

          /*
           * Yeni belgelerde entryId bulunur.
           * Eski belgelerde belge adı Pokémon ismiydi.
           */
          const entryId =
            pokemonData.entryId ||
            legacyIdLookup[documentSnapshot.id] ||
            documentSnapshot.id;

          nextOwnedPokemon[entryId] =
            pokemonData.owned === true;
        });

        setOwnedPokemon(nextOwnedPokemon);
        setCollectionLoading(false);
      },
      (error) => {
        console.error(
          "Collection could not be loaded:",
          error
        );

        setCollectionError(error.message);
        setCollectionLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return {
    ownedPokemon,
    collectionLoading,
    collectionError,
  };
}