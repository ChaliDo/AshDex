import { useMemo } from "react";

import { ashPokemon } from "../data/ashPokemon";

import {
  useLanguage,
} from "../context/LanguageContext";

function TrainerLevel({
  ownedPokemon,
}) {
  const {
    language,
  } = useLanguage();

  const isTurkish =
    language === "tr";

  const stats = useMemo(() => {
    const ownedCount =
      ashPokemon.filter(
        (pokemon) =>
          ownedPokemon?.[
            pokemon.id
          ] === true
      ).length;

    const unlockedAchievements =
      calculateUnlockedAchievements(
        ownedPokemon || {}
      );

    const pokemonXp =
      ownedCount * 10;

    const achievementXp =
      unlockedAchievements * 50;

    const totalXp =
      pokemonXp +
      achievementXp;

    const xpPerLevel = 100;

    const level =
      Math.floor(
        totalXp / xpPerLevel
      ) + 1;

    const currentLevelXp =
      totalXp % xpPerLevel;

    const nextLevelXp =
      xpPerLevel;

    const progressPercentage =
      Math.round(
        (currentLevelXp /
          nextLevelXp) *
          100
      );

    return {
      ownedCount,
      unlockedAchievements,
      pokemonXp,
      achievementXp,
      totalXp,
      level,
      currentLevelXp,
      nextLevelXp,
      progressPercentage,
    };
  }, [ownedPokemon]);

  const remainingXp =
    stats.nextLevelXp -
    stats.currentLevelXp;

  return (
    <section className="trainer-level-card">
      <div className="trainer-level-header">
        <div className="trainer-level-copy">
          <p className="trainer-level-eyebrow">
            {isTurkish
              ? "EĞİTMEN İLERLEMESİ"
              : "TRAINER PROGRESSION"}
          </p>

          <h2 className="trainer-level-title">
            {isTurkish
              ? "Eğitmen Seviyesi"
              : "Trainer Level"}
          </h2>

          <p className="trainer-level-subtitle">
            {isTurkish
              ? "Ash’in Pokémon’larını toplayarak ve başarıların kilidini açarak XP kazan."
              : "Gain XP by collecting Ash’s Pokémon and unlocking achievements."}
          </p>
        </div>

        <div className="trainer-level-badge">
          <span>
            {isTurkish
              ? "Seviye"
              : "Level"}
          </span>

          <strong>
            {stats.level}
          </strong>
        </div>
      </div>

      <div className="trainer-level-progress-header">
        <span>
          {stats.currentLevelXp} /{" "}
          {stats.nextLevelXp} XP
        </span>

        <strong>
          {stats.progressPercentage}%
        </strong>
      </div>

      <div className="trainer-level-progress-track">
        <div
          className="trainer-level-progress-fill"
          style={{
            width:
              `${stats.progressPercentage}%`,
          }}
        />
      </div>

      <p className="trainer-level-total">
        {isTurkish
          ? "Toplam XP:"
          : "Total XP:"}{" "}

        <strong>
          {stats.totalXp}
        </strong>
      </p>

      <div className="trainer-level-grid">
        <StatCard
          label={
            isTurkish
              ? "Pokémon XP"
              : "Pokémon XP"
          }
          value={
            stats.pokemonXp
          }
          detail={`${stats.ownedCount} × 10 XP`}
          icon="⚡"
        />

        <StatCard
          label={
            isTurkish
              ? "Başarı XP"
              : "Achievement XP"
          }
          value={
            stats.achievementXp
          }
          detail={`${stats.unlockedAchievements} × 50 XP`}
          icon="🏅"
        />

        <StatCard
          label={
            isTurkish
              ? "Sonraki Seviye"
              : "Next Level"
          }
          value={`${remainingXp} XP`}
          detail={
            isTurkish
              ? "Kalan"
              : "Remaining"
          }
          icon="⬆️"
        />
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
}) {
  return (
    <article className="trainer-level-stat-card">
      <span className="trainer-level-stat-icon">
        {icon}
      </span>

      <div>
        <p className="trainer-level-stat-label">
          {label}
        </p>

        <strong className="trainer-level-stat-value">
          {value}
        </strong>

        <small className="trainer-level-stat-detail">
          {detail}
        </small>
      </div>
    </article>
  );
}

function calculateUnlockedAchievements(
  ownedPokemon
) {
  const ownedEntries =
    ashPokemon.filter(
      (pokemon) =>
        ownedPokemon?.[
          pokemon.id
        ] === true
    );

  const ownedCount =
    ownedEntries.length;

  const regionStats =
    ashPokemon.reduce(
      (stats, pokemon) => {
        if (
          !stats[
            pokemon.region
          ]
        ) {
          stats[
            pokemon.region
          ] = {
            total: 0,
            owned: 0,
          };
        }

        stats[
          pokemon.region
        ].total += 1;

        if (
          ownedPokemon?.[
            pokemon.id
          ] === true
        ) {
          stats[
            pokemon.region
          ].owned += 1;
        }

        return stats;
      },
      {}
    );

  const completedRegionCount =
    Object.values(
      regionStats
    ).filter(
      (region) =>
        region.total > 0 &&
        region.owned ===
          region.total
    ).length;

  const ownedSpecialForms =
    ownedEntries.filter(
      (pokemon) =>
        pokemon.kind ===
        "Special Form"
    ).length;

  const totalSpecialForms =
    ashPokemon.filter(
      (pokemon) =>
        pokemon.kind ===
        "Special Form"
    ).length;

  const ownedTemporaryPartners =
    ownedEntries.filter(
      (pokemon) =>
        pokemon.kind ===
        "Temporary Partner"
    ).length;

  const ownedCompanions =
    ownedEntries.filter(
      (pokemon) =>
        pokemon.kind ===
        "Companion"
    ).length;

  const achievements = [
    ownedCount >= 1,
    ownedCount >= 10,
    ownedCount >= 25,
    ownedCount >= 50,
    ownedCount >= 100,
    ownedCount ===
      ashPokemon.length,
    ownedSpecialForms >= 1,
    totalSpecialForms > 0 &&
      ownedSpecialForms ===
        totalSpecialForms,
    ownedTemporaryPartners >= 1,
    ownedCompanions >= 1 ||
      ownedPokemon?.[
        "rotom-dex"
      ] === true,
  ];

  return (
    achievements.filter(Boolean)
      .length +
    completedRegionCount
  );
}

export default TrainerLevel;