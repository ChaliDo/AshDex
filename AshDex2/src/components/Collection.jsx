import {
  useMemo,
  useState,
} from "react";

import { ashPokemon } from "../data/ashPokemon";

import {
  useLanguage,
} from "../context/LanguageContext";

import PokemonCard from "./PokemonCard";

function Collection({
  user,
  ownedPokemon,
}) {
  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    selectedRegion,
    setSelectedRegion,
  ] = useState("All");

  const [
    ownershipFilter,
    setOwnershipFilter,
  ] = useState("All");

  const {
    language,
  } = useLanguage();

  const isTurkish =
    language === "tr";

  const regions = useMemo(() => {
    return [
      "All",
      ...new Set(
        ashPokemon.map(
          (pokemon) =>
            pokemon.region
        )
      ),
    ];
  }, []);

  const ownedCount =
    useMemo(() => {
      return ashPokemon.filter(
        (pokemon) =>
          ownedPokemon?.[
            pokemon.id
          ] === true
      ).length;
    }, [ownedPokemon]);

  const filteredPokemon =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLocaleLowerCase(
            language === "tr"
              ? "tr"
              : "en"
          );

      return ashPokemon.filter(
        (pokemon) => {
          const isOwned =
            ownedPokemon?.[
              pokemon.id
            ] === true;

          const matchesSearch =
            !normalizedSearch ||
            pokemon.name
              .toLocaleLowerCase(
                language === "tr"
                  ? "tr"
                  : "en"
              )
              .includes(
                normalizedSearch
              );

          const matchesRegion =
            selectedRegion ===
              "All" ||
            pokemon.region ===
              selectedRegion;

          const matchesOwnership =
            ownershipFilter ===
              "All" ||
            (ownershipFilter ===
              "Owned" &&
              isOwned) ||
            (ownershipFilter ===
              "Missing" &&
              !isOwned);

          return (
            matchesSearch &&
            matchesRegion &&
            matchesOwnership
          );
        }
      );
    }, [
      searchQuery,
      selectedRegion,
      ownershipFilter,
      ownedPokemon,
      language,
    ]);

  const completionPercentage =
    ashPokemon.length > 0
      ? Math.round(
          (ownedCount /
            ashPokemon.length) *
            100
        )
      : 0;

  const filtersActive =
    searchQuery.trim() !== "" ||
    selectedRegion !== "All" ||
    ownershipFilter !== "All";

  function clearFilters() {
    setSearchQuery("");
    setSelectedRegion("All");
    setOwnershipFilter("All");
  }

  return (
    <section
      id="collection"
      className="pokedex-page"
    >
      <div className="pokedex-summary">
        <div className="pokedex-summary-copy">
          <p className="pokedex-eyebrow">
            {isTurkish
              ? "ASH’İN KOLEKSİYONU"
              : "ASH’S COLLECTION"}
          </p>

          <h2 className="pokedex-title">
            {isTurkish
              ? "Pokédex’im"
              : "My Pokédex"}
          </h2>

          <p className="pokedex-description">
            {isTurkish
              ? "Ash’in Pokémon’larını ara, yolculuğu bölgelere göre filtrele ve koleksiyonunu güncelle."
              : "Search Ash’s Pokémon, filter the journey by region and update your collection."}
          </p>
        </div>

        <div className="pokedex-progress-card">
          <strong>
            {completionPercentage}%
          </strong>

          <span>
            {ownedCount}/
            {ashPokemon.length}
          </span>

          <small>
            {isTurkish
              ? "Toplandı"
              : "Collected"}
          </small>
        </div>
      </div>

      <div className="pokedex-progress-track">
        <div
          className="pokedex-progress-fill"
          style={{
            width:
              `${completionPercentage}%`,
          }}
        />
      </div>

      <div className="pokedex-toolbar">
        <label className="pokedex-search-field">
          <span className="pokedex-field-label">
            {isTurkish
              ? "Ara"
              : "Search"}
          </span>

          <div className="pokedex-search-control">
            <span
              className="pokedex-search-icon"
              aria-hidden="true"
            >
              ⌕
            </span>

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder={
                isTurkish
                  ? "Pokémon ara..."
                  : "Search Pokémon..."
              }
              autoComplete="off"
            />

            {searchQuery && (
              <button
                type="button"
                className="pokedex-clear-search"
                onClick={() =>
                  setSearchQuery("")
                }
                aria-label={
                  isTurkish
                    ? "Aramayı temizle"
                    : "Clear search"
                }
              >
                ×
              </button>
            )}
          </div>
        </label>

        <label className="pokedex-filter-field">
          <span className="pokedex-field-label">
            {isTurkish
              ? "Bölge"
              : "Region"}
          </span>

          <select
            value={
              selectedRegion
            }
            onChange={(event) =>
              setSelectedRegion(
                event.target.value
              )
            }
          >
            {regions.map(
              (region) => (
                <option
                  key={region}
                  value={region}
                >
                  {region === "All"
                    ? isTurkish
                      ? "Tüm bölgeler"
                      : "All regions"
                    : region}
                </option>
              )
            )}
          </select>
        </label>

        <label className="pokedex-filter-field">
          <span className="pokedex-field-label">
            {isTurkish
              ? "Koleksiyon"
              : "Collection"}
          </span>

          <select
            value={
              ownershipFilter
            }
            onChange={(event) =>
              setOwnershipFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              {isTurkish
                ? "Tüm kayıtlar"
                : "All entries"}
            </option>

            <option value="Owned">
              {isTurkish
                ? "Sahip olunan"
                : "Owned"}
            </option>

            <option value="Missing">
              {isTurkish
                ? "Eksik"
                : "Missing"}
            </option>
          </select>
        </label>
      </div>

      <div className="pokedex-results-bar">
        <div>
          <strong>
            {
              filteredPokemon.length
            }
          </strong>

          <span>
            {isTurkish
              ? " Pokémon gösteriliyor"
              : " Pokémon shown"}
          </span>
        </div>

        {filtersActive && (
          <button
            type="button"
            className="pokedex-reset-button"
            onClick={clearFilters}
          >
            {isTurkish
              ? "Filtreleri temizle"
              : "Clear filters"}
          </button>
        )}
      </div>

      {filteredPokemon.length >
      0 ? (
        <div className="pokedex-grid">
          {filteredPokemon.map(
            (pokemon) => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                user={user}
                initialOwned={
                  ownedPokemon?.[
                    pokemon.id
                  ] === true
                }
              />
            )
          )}
        </div>
      ) : (
        <div className="pokedex-empty-state">
          <span
            className="pokedex-empty-icon"
            aria-hidden="true"
          >
            ◉
          </span>

          <h3>
            {isTurkish
              ? "Pokémon bulunamadı"
              : "No Pokémon found"}
          </h3>

          <p>
            {isTurkish
              ? "Arama terimini değiştirmeyi veya etkin filtreleri temizlemeyi dene."
              : "Try changing the search term or clearing the active filters."}
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={clearFilters}
          >
            {isTurkish
              ? "Filtreleri temizle"
              : "Clear filters"}
          </button>
        </div>
      )}
    </section>
  );
}

export default Collection;