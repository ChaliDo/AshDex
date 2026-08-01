import {
  useMemo,
  useState,
} from "react";

import { ashPokemon } from "../data/ashPokemon";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  findPublicProfile,
} from "../services/publicProfileService";

function FriendLookup({
  ownTrainerCode,
  ownedPokemon,
}) {
  const [
    trainerCode,
    setTrainerCode,
  ] = useState("");

  const [
    friendProfile,
    setFriendProfile,
  ] = useState(null);

  const [
    searching,
    setSearching,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const {
    t,
    language,
  } = useLanguage();

  const isTurkish =
    language === "tr";

  const favoritePokemon =
    useMemo(() => {
      if (
        !friendProfile
          ?.favoritePokemonId
      ) {
        return null;
      }

      return (
        ashPokemon.find(
          (pokemon) =>
            pokemon.id ===
            friendProfile
              .favoritePokemonId
        ) || null
      );
    }, [friendProfile]);

  const comparison =
    useMemo(() => {
      if (!friendProfile) {
        return {
          common: [],
          onlyYou: [],
          onlyFriend: [],
        };
      }

      const ownIds =
        new Set(
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
            )
        );

      const friendIds =
        new Set(
          friendProfile
            .ownedPokemon || []
        );

      const common = [];
      const onlyYou = [];
      const onlyFriend = [];

      ashPokemon.forEach(
        (pokemon) => {
          const youOwn =
            ownIds.has(
              pokemon.id
            );

          const friendOwns =
            friendIds.has(
              pokemon.id
            );

          if (
            youOwn &&
            friendOwns
          ) {
            common.push(
              pokemon
            );

            return;
          }

          if (youOwn) {
            onlyYou.push(
              pokemon
            );

            return;
          }

          if (friendOwns) {
            onlyFriend.push(
              pokemon
            );
          }
        }
      );

      return {
        common,
        onlyYou,
        onlyFriend,
      };
    }, [
      friendProfile,
      ownedPokemon,
    ]);

  const friendStats =
    useMemo(() => {
      if (!friendProfile) {
        return null;
      }

      const totalPokemon =
        friendProfile
          .totalPokemon ||
        ashPokemon.length;

      const ownedCount =
        friendProfile
          .ownedCount ??
        friendProfile
          .ownedPokemon
          ?.length ??
        0;

      const completion =
        totalPokemon > 0
          ? Math.round(
              (ownedCount /
                totalPokemon) *
                100
            )
          : 0;

      const matchRate =
        ownedCount > 0
          ? Math.round(
              (comparison
                .common.length /
                ownedCount) *
                100
            )
          : 0;

      return {
        totalPokemon,
        ownedCount,
        completion,
        matchRate,
      };
    }, [
      friendProfile,
      comparison.common.length,
    ]);

  async function handleSearch(
    event
  ) {
    event.preventDefault();

    const normalizedCode =
      trainerCode
        .trim()
        .toUpperCase();

    setError("");
    setFriendProfile(null);

    if (!normalizedCode) {
      setError(
        t(
          "friends.enterCode"
        )
      );

      return;
    }

    if (
      ownTrainerCode &&
      normalizedCode ===
        ownTrainerCode
    ) {
      setError(
        t(
          "friends.ownCode"
        )
      );

      return;
    }

    setSearching(true);

    try {
      const result =
        await findPublicProfile(
          normalizedCode
        );

      if (!result) {
        setError(
          t(
            "friends.trainerNotFound"
          )
        );

        return;
      }

      setFriendProfile(result);
    } catch (searchError) {
      console.error(
        "Trainer lookup failed:",
        searchError
      );

      setError(
        searchError.message ||
          (isTurkish
            ? "Eğitmen araması başarısız oldu."
            : "Trainer lookup failed.")
      );
    } finally {
      setSearching(false);
    }
  }

  function handleClear() {
    setTrainerCode("");
    setFriendProfile(null);
    setError("");
  }

  return (
    <section className="friends-lookup-card">
      <div className="friends-section-heading">
        <div>
          <p className="friends-eyebrow">
            {t(
              "friends.network"
            ).toUpperCase()}
          </p>

          <h2 className="friends-title">
            {t(
              "friends.findFriend"
            )}
          </h2>

          <p className="friends-description">
            {t(
              "friends.description"
            )}
          </p>
        </div>

        <div className="friends-search-status">
          <span>
            {isTurkish
              ? "Eğitmen Kodu"
              : "Trainer Code"}
          </span>

          <strong>
            ASH-XXXXXXXX
          </strong>
        </div>
      </div>

      <form
        className="friends-search-form"
        onSubmit={handleSearch}
      >
        <label className="friends-search-field">
          <span className="friends-field-label">
            {t(
              "friends.friendTrainerCode"
            )}
          </span>

          <div className="friends-search-control">
            <span
              className="friends-search-icon"
              aria-hidden="true"
            >
              ⌕
            </span>

            <input
              type="text"
              value={
                trainerCode
              }
              onChange={(
                event
              ) =>
                setTrainerCode(
                  event.target.value
                    .toUpperCase()
                )
              }
              placeholder="ASH-XXXXXXXX"
              autoComplete="off"
              maxLength={20}
            />

            {trainerCode && (
              <button
                type="button"
                className="friends-clear-input"
                onClick={
                  handleClear
                }
                aria-label={
                  isTurkish
                    ? "Eğitmen Kodunu temizle"
                    : "Clear Trainer Code"
                }
              >
                ×
              </button>
            )}
          </div>
        </label>

        <button
          type="submit"
          disabled={
            searching
          }
          className="friends-search-button"
        >
          {searching
            ? t(
                "friends.searching"
              )
            : t(
                "friends.findTrainer"
              )}
        </button>
      </form>

      {error && (
        <div className="friends-error-message">
          <span
            aria-hidden="true"
          >
            ⚠️
          </span>

          <span>
            {error}
          </span>
        </div>
      )}

      {!friendProfile &&
        !error && (
          <div className="friends-empty-state">
            <div className="friends-empty-icon">
              👥
            </div>

            <div>
              <h3>
                {isTurkish
                  ? "Koleksiyonları karşılaştır"
                  : "Compare collections"}
              </h3>

              <p>
                {isTurkish
                  ? "Ortak Pokémon’ları, yalnızca sende olanları ve yalnızca arkadaşında bulunanları görmek için arkadaşının Eğitmen Kodunu gir."
                  : "Enter a friend’s Trainer Code to see your shared Pokémon, what only you own and what only your friend owns."}
              </p>
            </div>
          </div>
        )}

      {friendProfile &&
        friendStats && (
          <article className="friend-result-card">
            <div className="friend-result-hero">
              <div className="friend-result-identity">
                {friendProfile
                  .photoURL ? (
                  <img
                    src={
                      friendProfile
                        .photoURL
                    }
                    alt={
                      friendProfile
                        .trainerName ||
                      (isTurkish
                        ? "Eğitmen"
                        : "Trainer")
                    }
                    className="friend-result-avatar"
                  />
                ) : (
                  <div className="friend-result-avatar friend-result-avatar-placeholder">
                    👤
                  </div>
                )}

                <div className="friend-result-copy">
                  <p className="friends-eyebrow">
                    {t(
                      "friends.trainerFound"
                    ).toUpperCase()}
                  </p>

                  <h3 className="friend-result-name">
                    {friendProfile
                      .trainerName ||
                      (isTurkish
                        ? "Eğitmen"
                        : "Trainer")}
                  </h3>

                  <p className="friend-result-title">
                    {friendProfile
                      .trainerTitle ||
                      (isTurkish
                        ? "Pokémon Koleksiyoncusu"
                        : "Pokémon Collector")}
                  </p>
                </div>
              </div>

              <div className="friend-result-progress">
                <strong>
                  {
                    friendStats
                      .completion
                  }
                  %
                </strong>

                <span>
                  {
                    friendStats
                      .ownedCount
                  }
                  /
                  {
                    friendStats
                      .totalPokemon
                  }
                </span>

                <small>
                  {isTurkish
                    ? "Koleksiyon"
                    : "Collection"}
                </small>
              </div>
            </div>

            <div className="friend-result-detail-grid">
              <DetailCard
                icon="⭐"
                label={
                  isTurkish
                    ? "Favori Pokémon"
                    : "Favorite Pokémon"
                }
                value={
                  favoritePokemon
                    ?.name ||
                  t(
                    "common.notSelected"
                  )
                }
              />

              <DetailCard
                icon="🌍"
                label={
                  isTurkish
                    ? "Favori Bölge"
                    : "Favorite Region"
                }
                value={
                  friendProfile
                    .favoriteRegion ||
                  t(
                    "common.notSelected"
                  )
                }
              />

              <DetailCard
                icon="🪪"
                label={
                  isTurkish
                    ? "Eğitmen Kodu"
                    : "Trainer Code"
                }
                value={
                  friendProfile
                    .trainerCode ||
                  trainerCode
                }
              />

              <DetailCard
                icon="🤝"
                label={t(
                  "friends.collectionMatch"
                )}
                value={`${friendStats.matchRate}%`}
              />
            </div>

            <div className="friend-matchup-heading">
              <div>
                <p className="friends-eyebrow">
                  {isTurkish
                    ? "KOLEKSİYON EŞLEŞMESİ"
                    : "COLLECTION MATCHUP"}
                </p>

                <h3>
                  {t(
                    "friends.compareCollections"
                  )}
                </h3>

                <p>
                  {isTurkish
                    ? "İki koleksiyonun nerelerde kesiştiğini hızlıca gör."
                    : "A quick map of where your two journeys overlap."}
                </p>
              </div>
            </div>

            <div className="friend-matchup-summary">
              <SummaryCard
                symbol="🤝"
                value={
                  comparison
                    .common.length
                }
                label={t(
                  "friends.bothHave"
                )}
                description={
                  isTurkish
                    ? "Ortak kayıtlar"
                    : "Shared entries"
                }
                className="friend-summary-common"
              />

              <SummaryCard
                symbol="⚡"
                value={
                  comparison
                    .onlyYou.length
                }
                label={t(
                  "friends.onlyYou"
                )}
                description={
                  isTurkish
                    ? "Sana özel kayıtlar"
                    : "Your unique entries"
                }
                className="friend-summary-you"
              />

              <SummaryCard
                symbol="🎒"
                value={
                  comparison
                    .onlyFriend
                    .length
                }
                label={t(
                  "friends.onlyFriend"
                )}
                description={t(
                  "friends.missingFromYours"
                )}
                className="friend-summary-them"
              />
            </div>

            <ComparisonGroup
              title={t(
                "friends.bothHave"
              )}
              subtitle={
                isTurkish
                  ? "Her iki eğitmenin de sahip olduğu kayıtlar."
                  : "Entries shared by both trainers."
              }
              pokemon={
                comparison.common
              }
              emptyMessage={
                isTurkish
                  ? "Henüz ortak topladığınız bir kayıt yok."
                  : "You do not share any collected entries yet."
              }
            />

            <ComparisonGroup
              title={t(
                "friends.onlyYou"
              )}
              subtitle={
                isTurkish
                  ? "Arkadaşının hâlâ ihtiyaç duyabileceği kayıtlar."
                  : "Your friend may still need these."
              }
              pokemon={
                comparison.onlyYou
              }
              emptyMessage={
                isTurkish
                  ? "Arkadaşın, sahip olduğun her şeye zaten sahip."
                  : "Your friend already has everything you own."
              }
            />

            <ComparisonGroup
              title={t(
                "friends.onlyFriend"
              )}
              subtitle={
                isTurkish
                  ? "Senin koleksiyonunda eksik olan kayıtlar."
                  : "Entries missing from your collection."
              }
              pokemon={
                comparison
                  .onlyFriend
              }
              emptyMessage={
                isTurkish
                  ? "Koleksiyonun, arkadaşının sahip olduğu tüm kayıtları kapsıyor."
                  : "Your collection already covers every entry your friend owns."
              }
            />
          </article>
        )}
    </section>
  );
}

function DetailCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="friend-result-detail-card">
      <span className="friend-detail-icon">
        {icon}
      </span>

      <div>
        <span className="friend-detail-label">
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>
    </div>
  );
}

function SummaryCard({
  symbol,
  value,
  label,
  description,
  className,
}) {
  return (
    <div
      className={`friend-summary-card ${className}`}
    >
      <span className="friend-summary-symbol">
        {symbol}
      </span>

      <strong>
        {value}
      </strong>

      <span>
        {label}
      </span>

      <small>
        {description}
      </small>
    </div>
  );
}

function ComparisonGroup({
  title,
  subtitle,
  pokemon,
  emptyMessage,
}) {
  return (
    <section className="friend-comparison-group">
      <div className="friend-comparison-header">
        <div>
          <h4>
            {title}
          </h4>

          <p>
            {subtitle}
          </p>
        </div>

        <strong className="friend-comparison-count">
          {pokemon.length}
        </strong>
      </div>

      {pokemon.length > 0 ? (
        <div className="friend-pokemon-grid">
          {pokemon.map(
            (entry) => (
              <article
                key={entry.id}
                className="friend-pokemon-card"
              >
                <img
                  src={
                    entry.image
                  }
                  alt={
                    entry.name
                  }
                  loading="lazy"
                />

                <span>
                  #{entry.dex}
                </span>

                <strong>
                  {entry.name}
                </strong>
              </article>
            )
          )}
        </div>
      ) : (
        <p className="friend-comparison-empty">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

export default FriendLookup;