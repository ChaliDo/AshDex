import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  savePokemon,
} from "../services/pokemonService";

import {
  useToast,
} from "../context/ToastContext";

import {
  useLanguage,
} from "../context/LanguageContext";

import PokemonDetailsModal from "./PokemonDetailsModal";

function PokemonCard({
  pokemon,
  user,
  initialOwned = false,
}) {
  const [
    owned,
    setOwned,
  ] = useState(initialOwned);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const { showToast } =
    useToast();

  const {
    language,
  } = useLanguage();

  const isTurkish =
    language === "tr";

  useEffect(() => {
    setOwned(initialOwned);
  }, [initialOwned]);

  const badges = useMemo(() => {
    return [
      createBadge(
        pokemon.kind,
        isTurkish
      ),

      createBadge(
        pokemon.note,
        isTurkish
      ),
    ].filter(Boolean);
  }, [
    pokemon.kind,
    pokemon.note,
    isTurkish,
  ]);

  async function handleToggle() {
    if (!user || saving) {
      return;
    }

    const previousOwned =
      owned;

    const nextOwned =
      !previousOwned;

    setOwned(nextOwned);
    setSaving(true);
    setError("");

    try {
      await savePokemon(
        user.uid,
        pokemon,
        nextOwned
      );

      showToast({
        title: nextOwned
          ? isTurkish
            ? "Pokémon koleksiyona eklendi"
            : "Pokémon collected"
          : isTurkish
            ? "Pokémon koleksiyondan kaldırıldı"
            : "Pokémon removed",

        message: nextOwned
          ? isTurkish
            ? `${pokemon.name}, AshDex koleksiyonuna eklendi.`
            : `${pokemon.name} was added to your AshDex.`
          : isTurkish
            ? `${pokemon.name}, koleksiyonundan kaldırıldı.`
            : `${pokemon.name} was removed from your collection.`,

        type: nextOwned
          ? "success"
          : "info",
      });
    } catch (saveError) {
      console.error(
        "Pokémon could not be saved:",
        saveError
      );

      setOwned(previousOwned);

      const errorMessage =
        saveError.message ||
        (isTurkish
          ? "Pokémon kaydedilemedi."
          : "Pokémon could not be saved.");

      setError(errorMessage);

      showToast({
        title: isTurkish
          ? "Kaydetme başarısız"
          : "Save failed",

        message:
          errorMessage,

        type: "error",
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <article
        className={
          owned
            ? "pokemon-card pokemon-card-owned"
            : "pokemon-card"
        }
      >
        <button
          type="button"
          className={
            owned
              ? "pokemon-card-check pokemon-card-check-owned"
              : "pokemon-card-check"
          }
          onClick={
            handleToggle
          }
          disabled={saving}
          aria-pressed={owned}
          aria-label={
            owned
              ? isTurkish
                ? `${pokemon.name} koleksiyondan çıkar`
                : `Remove ${pokemon.name} from collection`
              : isTurkish
                ? `${pokemon.name} koleksiyona ekle`
                : `Add ${pokemon.name} to collection`
          }
        >
          {saving
            ? "…"
            : owned
              ? "✓"
              : ""}
        </button>

        <button
          type="button"
          className="pokemon-card-button"
          onClick={() =>
            setDetailsOpen(true)
          }
          aria-label={
            isTurkish
              ? `${pokemon.name} ayrıntılarını görüntüle`
              : `View ${pokemon.name} details`
          }
        >
          <div className="pokemon-card-badge-row">
            {badges.map(
              (badge) => (
                <span
                  key={`${badge.label}-${badge.className}`}
                  className={`pokemon-form-badge ${badge.className}`}
                >
                  <span>
                    {badge.icon}
                  </span>

                  <span>
                    {badge.label}
                  </span>
                </span>
              )
            )}
          </div>

          <div className="pokemon-card-image-frame">
            <img
              src={pokemon.image}
              alt={pokemon.name}
              className="pokemon-card-image"
              loading="lazy"
            />
          </div>

          <div className="pokemon-card-meta">
            <span>
              #{pokemon.dex}
            </span>

            <span>
              {pokemon.region}
            </span>
          </div>

          <h3 className="pokemon-card-name">
            {pokemon.name}
          </h3>

          {owned && (
            <span className="pokemon-card-owned-tag">
              ●{" "}
              {isTurkish
                ? "Sahip Olunan"
                : "Owned"}
            </span>
          )}

          <span className="pokemon-card-action">
            {isTurkish
              ? "Ayrıntıları görüntüle"
              : "View details"}
          </span>
        </button>

        {error && (
          <p className="pokemon-card-error">
            {error}
          </p>
        )}
      </article>

      {detailsOpen && (
        <PokemonDetailsModal
          pokemon={pokemon}
          owned={owned}
          saving={saving}
          onToggleOwned={
            handleToggle
          }
          onClose={() =>
            setDetailsOpen(false)
          }
        />
      )}
    </>
  );
}

function createBadge(
  value,
  isTurkish
) {
  if (!value) {
    return null;
  }

  const rawLabel =
    String(value);

  const normalized =
    rawLabel.toLowerCase();

  if (
    normalized.includes(
      "shiny"
    )
  ) {
    return {
      label: isTurkish
        ? "Parlak"
        : rawLabel,
      icon: "✨",
      className:
        "badge-shiny",
    };
  }

  if (
    normalized.includes(
      "gigantamax"
    )
  ) {
    return {
      label: "Gigantamax",
      icon: "🔴",
      className:
        "badge-gigantamax",
    };
  }

  if (
    normalized.includes(
      "mega"
    )
  ) {
    return {
      label: "Mega",
      icon: "💠",
      className:
        "badge-mega",
    };
  }

  if (
    normalized.includes(
      "alolan"
    ) ||
    normalized.includes(
      "hisuian"
    ) ||
    normalized.includes(
      "regional"
    )
  ) {
    return {
      label: isTurkish
        ? "Bölgesel Form"
        : rawLabel,
      icon: "🌍",
      className:
        "badge-regional",
    };
  }

  if (
    normalized.includes(
      "legendary"
    )
  ) {
    return {
      label: isTurkish
        ? "Efsanevi"
        : rawLabel,
      icon: "👑",
      className:
        "badge-legendary",
    };
  }

  if (
    normalized.includes(
      "mythical"
    )
  ) {
    return {
      label: isTurkish
        ? "Mitolojik"
        : rawLabel,
      icon: "🌟",
      className:
        "badge-mythical",
    };
  }

  if (
    normalized.includes(
      "companion"
    )
  ) {
    return {
      label: isTurkish
        ? "Yoldaş"
        : rawLabel,
      icon: "🤝",
      className:
        "badge-companion",
    };
  }

  if (
    normalized.includes(
      "temporary"
    )
  ) {
    return {
      label: isTurkish
        ? "Geçici Partner"
        : rawLabel,
      icon: "⏳",
      className:
        "badge-temporary",
    };
  }

  if (
    normalized.includes(
      "special form"
    )
  ) {
    return {
      label: isTurkish
        ? "Özel Form"
        : rawLabel,
      icon: "✦",
      className:
        "badge-special",
    };
  }

  return {
    label: rawLabel,
    icon: "•",
    className:
      "badge-default",
  };
}

export default PokemonCard;