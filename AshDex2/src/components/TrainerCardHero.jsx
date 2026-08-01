import { useMemo } from "react";

import { ashPokemon } from "../data/ashPokemon";

import {
  useLanguage,
} from "../context/LanguageContext";

const themeLabels = {
  en: {
    classic: "Classic Red",
    midnight: "Midnight",
    electric: "Electric",
    forest: "Forest",
  },

  tr: {
    classic: "Klasik Kırmızı",
    midnight: "Gece Mavisi",
    electric: "Elektrik",
    forest: "Orman",
  },
};

function TrainerCardHero({
  user,
  trainerProfile,
  ownedPokemon,
}) {
  const {
    t,
    language,
  } = useLanguage();

  const isTurkish =
    language === "tr";

  const cardData = useMemo(() => {
    const safeOwnedPokemon =
      ownedPokemon || {};

    const ownedEntries =
      ashPokemon.filter(
        (pokemon) =>
          safeOwnedPokemon[
            pokemon.id
          ] === true
      );

    const ownedCount =
      ownedEntries.length;

    const totalCount =
      ashPokemon.length;

    const completion =
      totalCount > 0
        ? Math.round(
            (ownedCount / totalCount) *
              100
          )
        : 0;

    const regionMap =
      ashPokemon.reduce(
        (map, pokemon) => {
          if (!map[pokemon.region]) {
            map[pokemon.region] = {
              name: pokemon.region,
              total: 0,
              owned: 0,
            };
          }

          map[pokemon.region].total += 1;

          if (
            safeOwnedPokemon[
              pokemon.id
            ] === true
          ) {
            map[pokemon.region].owned += 1;
          }

          return map;
        },
        {}
      );

    const regions =
      Object.values(regionMap);

    const completedRegions =
      regions.filter(
        (region) =>
          region.total > 0 &&
          region.owned === region.total
      );

    const specialForms =
      ownedEntries.filter(
        (pokemon) =>
          pokemon.kind ===
          "Special Form"
      );

    const totalSpecialForms =
      ashPokemon.filter(
        (pokemon) =>
          pokemon.kind ===
          "Special Form"
      ).length;

    const companions =
      ownedEntries.filter(
        (pokemon) =>
          pokemon.kind ===
          "Companion"
      );

    const totalCompanions =
      ashPokemon.filter(
        (pokemon) =>
          pokemon.kind ===
          "Companion"
      ).length;

    const temporaryPartners =
      ownedEntries.filter(
        (pokemon) =>
          pokemon.kind ===
          "Temporary Partner"
      );

    const totalTemporaryPartners =
      ashPokemon.filter(
        (pokemon) =>
          pokemon.kind ===
          "Temporary Partner"
      ).length;

    const badges =
      buildCollectorBadges({
        language,
        completion,
        completedRegions,
        specialForms:
          specialForms.length,
        totalSpecialForms,
        companions:
          companions.length,
        totalCompanions,
        temporaryPartners:
          temporaryPartners.length,
        totalTemporaryPartners,
      });

    return {
      ownedCount,
      totalCount,
      completion,
      completedRegions,
      totalRegions: regions.length,
      specialForms:
        specialForms.length,
      companions:
        companions.length,
      temporaryPartners:
        temporaryPartners.length,
      badges,
    };
  }, [ownedPokemon, language]);

  const trainerName =
    trainerProfile?.trainerName ||
    user?.displayName ||
    "Trainer";

  const trainerTitle =
    trainerProfile?.trainerTitle ||
    (isTurkish
      ? "Pokémon Figür Koleksiyoncusu"
      : "Pokémon Figure Collector");

  const trainerCode =
    trainerProfile?.trainerCode ||
    t("common.notAvailable");

  const favoritePokemon =
    ashPokemon.find(
      (pokemon) =>
        pokemon.id ===
        trainerProfile
          ?.favoritePokemonId
    ) || null;

  const cardTheme =
    trainerProfile?.cardTheme ||
    "classic";

  const collectionStartDate =
    formatCollectionDate(
      trainerProfile
        ?.collectionStartDate,
      language,
      t("common.notSpecified")
    );

  const rawProfileImageURL =
    trainerProfile
      ?.profileImageURL ||
    user?.photoURL ||
    "";

  const profileImageURL =
    optimizeCloudinaryImage(
      rawProfileImageURL
    );

  const unlockedBadges =
    cardData.badges.filter(
      (badge) => badge.unlocked
    );

  const featuredBadges =
    unlockedBadges.slice(0, 4);

  return (
    <section
      className={`trainer-card-hero trainer-card-theme-${cardTheme}`}
    >
      <div className="trainer-card-shine" />

      <div className="trainer-card-decoration trainer-card-decoration-one" />

      <div className="trainer-card-decoration trainer-card-decoration-two" />

      <div className="trainer-card-topbar">
        <div className="trainer-card-brand">
          <img
            src="/logo-icon.svg"
            alt=""
            className="trainer-card-brand-icon"
          />

          <div>
            <strong>ASHDEX</strong>

            <span>
              {t(
                "trainerCard.collectorIdentityCard"
              )}
            </span>
          </div>
        </div>

        <div className="trainer-card-topbar-actions">
          <span className="trainer-card-theme-label">
            {themeLabels[
              language
            ]?.[cardTheme] ||
              themeLabels.en.classic}
          </span>

          <span className="trainer-card-edition">
            {t(
              "trainerCard.edition"
            )}
          </span>
        </div>
      </div>

      <div className="trainer-card-main">
        <div className="trainer-card-profile">
          <div className="trainer-card-avatar-frame">
            {profileImageURL ? (
              <img
                src={profileImageURL}
                alt={trainerName}
                className="trainer-card-avatar"
              />
            ) : (
              <div className="trainer-card-avatar trainer-card-avatar-placeholder">
                👤
              </div>
            )}

            <span className="trainer-card-avatar-status">
              {t(
                "trainerCard.collector"
              )}
            </span>
          </div>

          <div className="trainer-card-identity">
            <p className="trainer-card-eyebrow">
              {t(
                "trainerCard.trainerProfile"
              ).toUpperCase()}
            </p>

            <h2>{trainerName}</h2>

            <p className="trainer-card-title">
              {trainerTitle}
            </p>

            <div className="trainer-card-code">
              <span>
                {t(
                  "trainerCard.collectorId"
                )}
              </span>

              <strong>
                {trainerCode}
              </strong>
            </div>
          </div>
        </div>

        <div className="trainer-card-favorite">
          <div className="trainer-card-favorite-copy">
            <span>
              {t(
                "trainerCard.favoritePokemon"
              )}
            </span>

            <strong>
              {favoritePokemon?.name ||
                t(
                  "common.notSelected"
                )}
            </strong>

            <small>
              {trainerProfile
                ?.favoriteRegion ||
                t(
                  "common.notSelected"
                )}
            </small>
          </div>

          <div className="trainer-card-favorite-visual">
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

      <div className="trainer-card-progress-section">
        <div className="trainer-card-progress-copy">
          <div>
            <span>
              {t(
                "trainerCard.collectionCompletion"
              )}
            </span>

            <strong>
              {cardData.completion}%
            </strong>
          </div>

          <small>
            {isTurkish
              ? `${cardData.totalCount} figürün ${cardData.ownedCount} tanesi`
              : `${cardData.ownedCount} of ${cardData.totalCount} figures`}
          </small>
        </div>

        <div className="trainer-card-progress-track">
          <div
            className="trainer-card-progress-fill"
            style={{
              width:
                `${cardData.completion}%`,
            }}
          />
        </div>
      </div>

      <div className="trainer-card-stat-grid">
        <CardStat
          label={t("trainerCard.figures")}
          value={`${cardData.ownedCount}/${cardData.totalCount}`}
        />

        <CardStat
          label={t("trainerCard.regions")}
          value={`${cardData.completedRegions.length}/${cardData.totalRegions}`}
        />

        <CardStat
          label={t("trainerCard.specialForms")}
          value={cardData.specialForms}
        />

        <CardStat
          label={t("trainerCard.companions")}
          value={cardData.companions}
        />
      </div>

      <div className="trainer-card-badge-showcase">
        <div className="trainer-card-badge-heading">
          <div>
            <span>
              {t(
                "trainerCard.collectionBadges"
              ).toUpperCase()}
            </span>

            <strong>
              {t(
                "trainerCard.collectorShowcase"
              )}
            </strong>
          </div>

          <small>
            {unlockedBadges.length}/
            {cardData.badges.length}{" "}
            {isTurkish
              ? "açıldı"
              : "unlocked"}
          </small>
        </div>

        {featuredBadges.length > 0 ? (
          <div className="trainer-card-badge-grid">
            {featuredBadges.map(
              (badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                />
              )
            )}
          </div>
        ) : (
          <div className="trainer-card-badge-empty">
            <span>◇</span>

            <p>
              {t(
                "trainerCard.completeMilestones"
              )}
            </p>
          </div>
        )}
      </div>

      <div className="trainer-card-footer">
        <div>
          <span>
            {t(
              "trainerCard.collectionStarted"
            )}
          </span>

          <strong>
            {collectionStartDate}
          </strong>
        </div>

        <div>
          <span>
            {t(
              "trainerCard.temporaryPartners"
            )}
          </span>

          <strong>
            {cardData.temporaryPartners}
          </strong>
        </div>

        <div className="trainer-card-scale">
          <span>
            {t(
              "trainerCard.collectionScale"
            )}
          </span>

          <strong>1:12</strong>
        </div>
      </div>
    </section>
  );
}

function CardStat({
  label,
  value,
}) {
  return (
    <article className="trainer-card-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function BadgeCard({ badge }) {
  return (
    <article className="trainer-card-badge">
      <span className="trainer-card-badge-icon">
        {badge.icon}
      </span>

      <div>
        <strong>
          {badge.name}
        </strong>

        <small>
          {badge.description}
        </small>
      </div>
    </article>
  );
}

function buildCollectorBadges({
  language,
  completion,
  completedRegions,
  specialForms,
  totalSpecialForms,
  companions,
  totalCompanions,
  temporaryPartners,
  totalTemporaryPartners,
}) {
  const isTurkish =
    language === "tr";

  const regionBadges =
    completedRegions.map(
      (region) => ({
        id: `region-${region.name}`,
        icon: "🏅",
        name: isTurkish
          ? `${region.name} Ustası`
          : `${region.name} Master`,
        description: isTurkish
          ? `${region.total}/${region.total} figür`
          : `${region.total}/${region.total} figures`,
        unlocked: true,
      })
    );

  const collectionBadges = [
    {
      id: "collection-25",
      icon: "◈",
      name: isTurkish
        ? "Yükselen Koleksiyon"
        : "Collection Rising",
      description: isTurkish
        ? "AshDex koleksiyonunun %25’i tamamlandı"
        : "25% of AshDex collected",
      unlocked: completion >= 25,
    },
    {
      id: "collection-50",
      icon: "◆",
      name: isTurkish
        ? "Yarı Yol Koleksiyoncusu"
        : "Halfway Collector",
      description: isTurkish
        ? "AshDex koleksiyonunun %50’si tamamlandı"
        : "50% of AshDex collected",
      unlocked: completion >= 50,
    },
    {
      id: "collection-75",
      icon: "★",
      name: isTurkish
        ? "Seçkin Koleksiyoncu"
        : "Elite Collector",
      description: isTurkish
        ? "AshDex koleksiyonunun %75’i tamamlandı"
        : "75% of AshDex collected",
      unlocked: completion >= 75,
    },
    {
      id: "collection-100",
      icon: "👑",
      name: isTurkish
        ? "AshDex Tamamlandı"
        : "AshDex Complete",
      description: isTurkish
        ? "Tüm figürler toplandı"
        : "Every figure collected",
      unlocked: completion === 100,
    },
    {
      id: "special-forms",
      icon: "✦",
      name: isTurkish
        ? "Form Uzmanı"
        : "Form Specialist",
      description: isTurkish
        ? `${specialForms}/${totalSpecialForms} özel form`
        : `${specialForms}/${totalSpecialForms} special forms`,
      unlocked:
        totalSpecialForms > 0 &&
        specialForms ===
          totalSpecialForms,
    },
    {
      id: "companions",
      icon: "🤝",
      name: isTurkish
        ? "Yoldaş Arşivi"
        : "Companion Archive",
      description: isTurkish
        ? `${companions}/${totalCompanions} yoldaş`
        : `${companions}/${totalCompanions} companions`,
      unlocked:
        totalCompanions > 0 &&
        companions ===
          totalCompanions,
    },
    {
      id: "temporary",
      icon: "⌛",
      name: isTurkish
        ? "Geçici Partner Arşivi"
        : "Temporary Partner Archive",
      description: isTurkish
        ? `${temporaryPartners}/${totalTemporaryPartners} partner`
        : `${temporaryPartners}/${totalTemporaryPartners} partners`,
      unlocked:
        totalTemporaryPartners > 0 &&
        temporaryPartners ===
          totalTemporaryPartners,
    },
  ];

  return [
    ...regionBadges,
    ...collectionBadges,
  ];
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

function optimizeCloudinaryImage(url) {
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

export default TrainerCardHero;