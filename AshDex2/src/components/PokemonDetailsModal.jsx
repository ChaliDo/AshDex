import { useEffect } from "react";

import {
  useLanguage,
} from "../context/LanguageContext";

function PokemonDetailsModal({
  pokemon,
  owned,
  saving,
  onToggleOwned,
  onClose,
}) {
  const {
    language,
  } = useLanguage();

  const isTurkish =
    language === "tr";

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  function handleBackdropClick(
    event
  ) {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose();
    }
  }

  const description =
    pokemon.description ||
    pokemon.note ||
    (isTurkish
      ? `${pokemon.name}, Ash’in Pokémon yolculuğunun bir parçasıdır.`
      : `${pokemon.name} is part of Ash’s Pokémon journey.`);

  return (
    <div
      className="pokemon-modal-backdrop"
      onMouseDown={
        handleBackdropClick
      }
      role="presentation"
    >
      <section
        className="pokemon-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`pokemon-modal-title-${pokemon.id}`}
      >
        <button
          type="button"
          className="pokemon-modal-close"
          onClick={onClose}
          aria-label={
            isTurkish
              ? "Pokémon ayrıntılarını kapat"
              : "Close Pokémon details"
          }
        >
          ×
        </button>

        <div className="pokemon-modal-visual">
          <div className="pokemon-modal-number">
            #{pokemon.dex}
          </div>

          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="pokemon-modal-image"
          />

          <div className="pokemon-modal-region">
            {pokemon.region}
          </div>
        </div>

        <div className="pokemon-modal-content">
          <p className="pokemon-modal-eyebrow">
            {isTurkish
              ? "ASHDEX KAYDI"
              : "ASHDEX ENTRY"}
          </p>

          <h2
            id={`pokemon-modal-title-${pokemon.id}`}
            className="pokemon-modal-title"
          >
            {pokemon.name}
          </h2>

          <p className="pokemon-modal-description">
            {description}
          </p>

          <div className="pokemon-modal-badges">
            {pokemon.kind && (
              <span className="pokemon-modal-badge">
                ✦{" "}
                {translateEntryValue(
                  pokemon.kind,
                  isTurkish
                )}
              </span>
            )}

            {pokemon.note &&
              pokemon.note !==
                pokemon.description && (
                <span className="pokemon-modal-badge pokemon-modal-badge-note">
                  {translateEntryValue(
                    pokemon.note,
                    isTurkish
                  )}
                </span>
              )}

            {owned && (
              <span className="pokemon-modal-badge pokemon-modal-badge-owned">
                ✓{" "}
                {isTurkish
                  ? "Sahip Olunan"
                  : "Owned"}
              </span>
            )}
          </div>

          <div className="pokemon-modal-details">
            <Detail
              label={
                isTurkish
                  ? "Pokédex Numarası"
                  : "Pokédex Number"
              }
              value={`#${pokemon.dex}`}
            />

            <Detail
              label={
                isTurkish
                  ? "Bölge"
                  : "Region"
              }
              value={pokemon.region}
            />

            {pokemon.type && (
              <Detail
                label={
                  isTurkish
                    ? "Tür"
                    : "Type"
                }
                value={
                  Array.isArray(
                    pokemon.type
                  )
                    ? pokemon.type.join(
                        " / "
                      )
                    : pokemon.type
                }
              />
            )}

            {pokemon.season && (
              <Detail
                label={
                  isTurkish
                    ? "Sezon"
                    : "Season"
                }
                value={
                  pokemon.season
                }
              />
            )}

            {pokemon.episode && (
              <Detail
                label={
                  isTurkish
                    ? "İlk Bölüm"
                    : "First Episode"
                }
                value={
                  pokemon.episode
                }
              />
            )}

            {pokemon.kind && (
              <Detail
                label={
                  isTurkish
                    ? "Kayıt Türü"
                    : "Entry Type"
                }
                value={translateEntryValue(
                  pokemon.kind,
                  isTurkish
                )}
              />
            )}
          </div>

          <button
            type="button"
            className={
              owned
                ? "pokemon-modal-collection-button is-owned"
                : "pokemon-modal-collection-button"
            }
            onClick={
              onToggleOwned
            }
            disabled={saving}
          >
            {saving
              ? isTurkish
                ? "Kaydediliyor..."
                : "Saving..."
              : owned
                ? isTurkish
                  ? "Koleksiyondan Çıkar"
                  : "Remove from Collection"
                : isTurkish
                  ? "Koleksiyona Ekle"
                  : "Add to Collection"}
          </button>
        </div>
      </section>
    </div>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div className="pokemon-modal-detail">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function translateEntryValue(
  value,
  isTurkish
) {
  if (
    !isTurkish ||
    !value
  ) {
    return value;
  }

  const normalized =
    String(value).toLowerCase();

  if (
    normalized.includes(
      "special form"
    )
  ) {
    return "Özel Form";
  }

  if (
    normalized.includes(
      "temporary partner"
    )
  ) {
    return "Geçici Partner";
  }

  if (
    normalized.includes(
      "companion"
    )
  ) {
    return "Yoldaş";
  }

  if (
    normalized.includes(
      "legendary"
    )
  ) {
    return "Efsanevi";
  }

  if (
    normalized.includes(
      "mythical"
    )
  ) {
    return "Mitolojik";
  }

  if (
    normalized.includes(
      "regional"
    ) ||
    normalized.includes(
      "alolan"
    ) ||
    normalized.includes(
      "hisuian"
    )
  ) {
    return "Bölgesel Form";
  }

  if (
    normalized.includes(
      "shiny"
    )
  ) {
    return "Parlak";
  }

  return value;
}

export default PokemonDetailsModal;