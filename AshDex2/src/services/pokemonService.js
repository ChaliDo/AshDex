import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

export async function savePokemon(uid, pokemon, owned) {
  if (!uid) {
    throw new Error("User ID is required.");
  }

  if (!pokemon?.id) {
    throw new Error("Pokémon ID is required.");
  }

  const pokemonReference = doc(
    db,
    "users",
    uid,
    "collection",
    pokemon.id
  );

  await setDoc(
    pokemonReference,
    {
      entryId: pokemon.id,
      pokemonId: pokemon.id,
      dex: pokemon.dex,
      name: pokemon.name,
      region: pokemon.region,
      kind: pokemon.kind || "",
      note: pokemon.note || "",
      owned,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  /*
   * Eski sürüm Pokémon adını belge kimliği olarak kullanıyordu.
   * Yeni kimlik farklıysa eski belgeyi temizliyoruz.
   */
  const legacyDocumentId = pokemon.name.toLowerCase();

  if (legacyDocumentId !== pokemon.id) {
    const legacyReference = doc(
      db,
      "users",
      uid,
      "collection",
      legacyDocumentId
    );

    await deleteDoc(legacyReference);
  }
}