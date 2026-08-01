import { forwardRef, useMemo } from "react";

import { ashPokemon } from "../data/ashPokemon";

import {
  useLanguage,
} from "../context/LanguageContext";

const TrainerCardExport = forwardRef(
  function TrainerCardExport(
    {
      user,
      trainerProfile,
      ownedPokemon,
    },
    ref
  ) {
    const {
      t,
      language,
    } = useLanguage();

    const isTurkish =
      language === "tr";

    const stats = useMemo(() => {
      const safeOwned =
        ownedPokemon || {};

      const ownedEntries =
        ashPokemon.filter(
          (pokemon) =>
            safeOwned[
              pokemon.id
            ] === true
        );

      const total =
        ashPokemon.length;

      const owned =
        ownedEntries.length;

      const completion =
        total > 0
          ? Math.round(
              (owned / total) * 100
            )
          : 0;

      const regionMap =
        ashPokemon.reduce(
          (map, pokemon) => {
            if (
              !map[
                pokemon.region
              ]
            ) {
              map[
                pokemon.region
              ] = {
                total: 0,
                owned: 0,
              };
            }

            map[
              pokemon.region
            ].total += 1;

            if (
              safeOwned[
                pokemon.id
              ] === true
            ) {
              map[
                pokemon.region
              ].owned += 1;
            }

            return map;
          },
          {}
        );

      const completedRegions =
        Object.values(
          regionMap
        ).filter(
          (region) =>
            region.total > 0 &&
            region.owned ===
              region.total
        ).length;

      const specialForms =
        ownedEntries.filter(
          (pokemon) =>
            pokemon.kind ===
            "Special Form"
        ).length;

      const companions =
        ownedEntries.filter(
          (pokemon) =>
            pokemon.kind ===
            "Companion"
        ).length;

      const temporaryPartners =
        ownedEntries.filter(
          (pokemon) =>
            pokemon.kind ===
            "Temporary Partner"
        ).length;

      return {
        total,
        owned,
        completion,
        completedRegions,
        totalRegions:
          Object.keys(
            regionMap
          ).length,
        specialForms,
        companions,
        temporaryPartners,
      };
    }, [ownedPokemon]);

    const trainerName =
      trainerProfile
        ?.trainerName ||
      user?.displayName ||
      (isTurkish
        ? "Eğitmen"
        : "Trainer");

    const trainerTitle =
      trainerProfile
        ?.trainerTitle ||
      (isTurkish
        ? "Pokémon Figür Koleksiyoncusu"
        : "Pokémon Figure Collector");

    const trainerCode =
      trainerProfile
        ?.trainerCode ||
      t("common.notAvailable");

    const favoritePokemon =
      ashPokemon.find(
        (pokemon) =>
          pokemon.id ===
          trainerProfile
            ?.favoritePokemonId
      ) || null;

    const profileImage =
      optimizeCloudinaryImage(
        trainerProfile
          ?.profileImageURL ||
          user?.photoURL ||
          ""
      );

    const cardTheme =
      trainerProfile
        ?.cardTheme ||
      "classic";

    return (
      <section
        ref={ref}
        className={`trainer-export-card trainer-export-theme-${cardTheme}`}
      >
        <div className="trainer-export-orb trainer-export-orb-one" />
        <div className="trainer-export-orb trainer-export-orb-two" />

        <header className="trainer-export-header">
          <div className="trainer-export-brand">
            <img
              src="/logo-icon.svg"
              alt=""
            />

            <div>
              <strong>
                ASHDEX
              </strong>

              <span>
                {t("trainerCard.collectorIdentityCard")}
              </span>
            </div>
          </div>

          <div className="trainer-export-edition">
            {t("trainerCard.edition")}
          </div>
        </header>

        <div className="trainer-export-main">
          <div className="trainer-export-profile">
            {profileImage ? (
              <img
                src={profileImage}
                alt={trainerName}
                className="trainer-export-avatar"
              />
            ) : (
              <div className="trainer-export-avatar trainer-export-avatar-placeholder">
                👤
              </div>
            )}

            <div>
              <span className="trainer-export-kicker">
                {t("trainerCard.trainerProfile").toUpperCase()}
              </span>

              <h1>
                {trainerName}
              </h1>

              <p>
                {trainerTitle}
              </p>

              <div className="trainer-export-code">
                <span>
                  {t("trainerCard.collectorId").toUpperCase()}
                </span>

                <strong>
                  {trainerCode}
                </strong>
              </div>
            </div>
          </div>

          <div className="trainer-export-favorite">
            <div>
              <span>
                {t("trainerCard.favoritePokemon").toUpperCase()}
              </span>

              <strong>
                {favoritePokemon
                  ?.name ||
                  t("common.notSelected")}
              </strong>

              <small>
                {trainerProfile
                  ?.favoriteRegion ||
                  t("common.notSelected")}
              </small>
            </div>

            <div className="trainer-export-favorite-image">
              {favoritePokemon ? (
                <img
                  src={
                    favoritePokemon.image
                  }
                  alt={
                    favoritePokemon.name
                  }
                />
              ) : (
                <span>?</span>
              )}
            </div>
          </div>
        </div>

        <section className="trainer-export-progress">
          <div>
            <span>
              {t("trainerCard.collectionCompletion").toUpperCase()}
            </span>

            <strong>
              {stats.completion}%
            </strong>
          </div>

          <small>
            {isTurkish
              ? `${stats.total} figürün ${stats.owned} tanesi`
              : `${stats.owned} of ${stats.total} figures`}
          </small>

          <div className="trainer-export-track">
            <div
              style={{
                width:
                  `${stats.completion}%`,
              }}
            />
          </div>
        </section>

        <div className="trainer-export-stats">
          <ExportStat
            label={t("trainerCard.figures")}
            value={`${stats.owned}/${stats.total}`}
          />

          <ExportStat
            label={t("trainerCard.regions")}
            value={`${stats.completedRegions}/${stats.totalRegions}`}
          />

          <ExportStat
            label={t("trainerCard.specialForms")}
            value={stats.specialForms}
          />

          <ExportStat
            label={t("trainerCard.companions")}
            value={stats.companions}
          />
        </div>

        <section className="trainer-export-showcase">
          <div>
            <span>
              {isTurkish ? "KOLEKSİYON VİTRİNİ" : "COLLECTION SHOWCASE"}
            </span>

            <strong>
              {isTurkish ? "Koleksiyoncu Özeti" : "Collector Summary"}
            </strong>
          </div>

          <div className="trainer-export-showcase-grid">
            <ExportBadge
              icon="🏅"
              label={t("dashboard.completedRegions")}
              value={
                stats.completedRegions
              }
            />

            <ExportBadge
              icon="✦"
              label={t("trainerCard.specialForms")}
              value={
                stats.specialForms
              }
            />

            <ExportBadge
              icon="🤝"
              label={t("trainerCard.companions")}
              value={
                stats.companions
              }
            />

            <ExportBadge
              icon="⌛"
              label={t("trainerCard.temporaryPartners")}
              value={
                stats.temporaryPartners
              }
            />
          </div>
        </section>

        <footer className="trainer-export-footer">
          <div>
            <span>
              {t("trainerCard.collectionStarted").toUpperCase()}
            </span>

            <strong>
              {formatCollectionDate(
                trainerProfile
                  ?.collectionStartDate,
                language,
                t(
                  "common.notSpecified"
                )
              )}
            </strong>
          </div>

          <div>
            <span>
              {t("trainerCard.collectionScale").toUpperCase()}
            </span>

            <strong>
              1:12
            </strong>
          </div>
        </footer>
      </section>
    );
  }
);

function ExportStat({
  label,
  value,
}) {
  return (
    <article className="trainer-export-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ExportBadge({
  icon,
  label,
  value,
}) {
  return (
    <article className="trainer-export-badge">
      <span>{icon}</span>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function optimizeCloudinaryImage(
  url
) {
  if (!url) {
    return "";
  }

  if (
    !url.includes(
      "res.cloudinary.com"
    )
  ) {
    return url;
  }

  if (
    url.includes(
      "/upload/f_auto,q_auto"
    )
  ) {
    return url;
  }

  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto,c_fill,g_face,w_400,h_400/"
  );
}

function formatCollectionDate(
  value,
  language,
  fallback
) {
  if (!value) {
    return fallback;
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    language === "tr"
      ? "tr-TR"
      : "en-US",
    {
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

export default TrainerCardExport;