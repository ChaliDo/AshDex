import { useMemo } from "react";

import { ashPokemon } from "../data/ashPokemon";

import {
  useLanguage,
} from "../context/LanguageContext";

function Achievements({
  ownedPokemon,
}) {
  const {
    language,
  } = useLanguage();

  const isTurkish =
    language === "tr";

  const achievements =
    useMemo(() => {
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
              safeOwnedPokemon[
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

      const completedRegions =
        Object.entries(
          regionStats
        )
          .filter(
            ([, stats]) =>
              stats.total > 0 &&
              stats.owned ===
                stats.total
          )
          .map(
            ([region]) =>
              region
          );

      const specialFormEntries =
        ashPokemon.filter(
          (pokemon) =>
            pokemon.kind ===
            "Special Form"
        );

      const ownedSpecialForms =
        ownedEntries.filter(
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

      const baseAchievements = [
        {
          id: "first-entry",
          title: isTurkish
            ? "Yolculuk Başlıyor"
            : "Journey Begins",
          description: isTurkish
            ? "İlk AshDex kaydını koleksiyonuna ekle."
            : "Collect your first AshDex entry.",
          icon: "⚡",
          unlocked:
            ownedCount >= 1,
          progress:
            Math.min(
              ownedCount,
              1
            ),
          target: 1,
        },
        {
          id: "ten-entries",
          title: isTurkish
            ? "Yükselen Eğitmen"
            : "Rising Trainer",
          description: isTurkish
            ? "10 AshDex kaydı topla."
            : "Collect 10 AshDex entries.",
          icon: "🎒",
          unlocked:
            ownedCount >= 10,
          progress:
            Math.min(
              ownedCount,
              10
            ),
          target: 10,
        },
        {
          id:
            "twenty-five-entries",
          title: isTurkish
            ? "Pokémon Araştırmacısı"
            : "Pokémon Researcher",
          description: isTurkish
            ? "25 AshDex kaydı topla."
            : "Collect 25 AshDex entries.",
          icon: "🔎",
          unlocked:
            ownedCount >= 25,
          progress:
            Math.min(
              ownedCount,
              25
            ),
          target: 25,
        },
        {
          id: "fifty-entries",
          title: isTurkish
            ? "Kıdemli Eğitmen"
            : "Veteran Trainer",
          description: isTurkish
            ? "50 AshDex kaydı topla."
            : "Collect 50 AshDex entries.",
          icon: "🏆",
          unlocked:
            ownedCount >= 50,
          progress:
            Math.min(
              ownedCount,
              50
            ),
          target: 50,
        },
        {
          id:
            "one-hundred-entries",
          title: isTurkish
            ? "Dünya Hükümdarı"
            : "World Monarch",
          description: isTurkish
            ? "100 AshDex kaydı topla."
            : "Collect 100 AshDex entries.",
          icon: "👑",
          unlocked:
            ownedCount >= 100,
          progress:
            Math.min(
              ownedCount,
              100
            ),
          target: 100,
        },
        {
          id:
            "complete-collection",
          title: isTurkish
            ? "AshDex Ustası"
            : "AshDex Master",
          description: isTurkish
            ? "Tüm AshDex kayıtlarını tamamla."
            : "Complete all AshDex entries.",
          icon: "🌟",
          unlocked:
            ownedCount ===
            ashPokemon.length,
          progress:
            ownedCount,
          target:
            ashPokemon.length,
        },
        {
          id: "special-form",
          title: isTurkish
            ? "Form Uzmanı"
            : "Form Specialist",
          description: isTurkish
            ? "İlk Özel Formunu topla."
            : "Collect your first Special Form.",
          icon: "✨",
          unlocked:
            ownedSpecialForms >= 1,
          progress:
            Math.min(
              ownedSpecialForms,
              1
            ),
          target: 1,
        },
        {
          id:
            "all-special-forms",
          title: isTurkish
            ? "Bağ Fenomeni"
            : "Bond Phenomenon",
          description: isTurkish
            ? "Tüm Özel Formları topla."
            : "Collect every Special Form.",
          icon: "💫",
          unlocked:
            specialFormEntries
              .length > 0 &&
            ownedSpecialForms ===
              specialFormEntries
                .length,
          progress:
            ownedSpecialForms,
          target:
            specialFormEntries
              .length,
        },
        {
          id:
            "temporary-partner",
          title: isTurkish
            ? "Güvenilir Koruyucu"
            : "Trusted Guardian",
          description: isTurkish
            ? "Bir Geçici Partner topla."
            : "Collect a Temporary Partner.",
          icon: "🤝",
          unlocked:
            ownedTemporaryPartners >=
            1,
          progress:
            Math.min(
              ownedTemporaryPartners,
              1
            ),
          target: 1,
        },
        {
          id: "rotom-dex",
          title: isTurkish
            ? "Alola Yoldaşı"
            : "Alola Companion",
          description: isTurkish
            ? "Rotom Dex’i koleksiyonuna ekle."
            : "Add Rotom Dex to your collection.",
          icon: "📱",
          unlocked:
            ownedCompanions >= 1 ||
            safeOwnedPokemon[
              "rotom-dex"
            ] === true,
          progress:
            ownedCompanions >= 1 ||
            safeOwnedPokemon[
              "rotom-dex"
            ] === true
              ? 1
              : 0,
          target: 1,
        },
      ];

      const regionAchievements =
        Object.entries(
          regionStats
        ).map(
          ([region, stats]) => ({
            id:
              `region-${region
                .toLowerCase()
                .replaceAll(
                  " ",
                  "-"
                )}`,

            title: isTurkish
              ? `${region} Ustası`
              : `${region} Master`,

            description:
              isTurkish
                ? `${region} koleksiyonunu tamamla.`
                : `Complete the ${region} collection.`,

            icon:
              completedRegions.includes(
                region
              )
                ? "🏅"
                : "🗺️",

            unlocked:
              stats.total > 0 &&
              stats.owned ===
                stats.total,

            progress:
              stats.owned,

            target:
              stats.total,
          })
        );

      return [
        ...baseAchievements,
        ...regionAchievements,
      ];
    }, [
      ownedPokemon,
      isTurkish,
    ]);

  const unlockedCount =
    achievements.filter(
      (achievement) =>
        achievement.unlocked
    ).length;

  return (
    <section className="achievements-card">
      <div className="achievements-header">
        <div>
          <p className="achievements-eyebrow">
            {isTurkish
              ? "EĞİTMEN KAYITLARI"
              : "TRAINER RECORDS"}
          </p>

          <h2 className="achievements-title">
            {isTurkish
              ? "Başarılar"
              : "Achievements"}
          </h2>

          <p className="achievements-subtitle">
            {isTurkish
              ? "Koleksiyonun bu başarıların kilidini otomatik olarak açar."
              : "Your collection unlocks these automatically."}
          </p>
        </div>

        <strong className="achievements-counter">
          {unlockedCount} /{" "}
          {achievements.length}
        </strong>
      </div>

      <div className="achievements-grid">
        {achievements.map(
          (achievement) => {
            const target =
              achievement.target ||
              1;

            const percentage =
              Math.min(
                Math.round(
                  (achievement
                    .progress /
                    target) *
                    100
                ),
                100
              );

            return (
              <article
                key={
                  achievement.id
                }
                className={
                  achievement.unlocked
                    ? "achievement-item achievement-item-unlocked"
                    : "achievement-item achievement-item-locked"
                }
              >
                <div className="achievement-item-header">
                  <span
                    className={
                      achievement.unlocked
                        ? "achievement-icon achievement-icon-unlocked"
                        : "achievement-icon"
                    }
                  >
                    {achievement.unlocked
                      ? achievement.icon
                      : "🔒"}
                  </span>

                  <span
                    className={
                      achievement.unlocked
                        ? "achievement-status achievement-status-unlocked"
                        : "achievement-status"
                    }
                  >
                    {achievement.unlocked
                      ? isTurkish
                        ? "Açıldı"
                        : "Unlocked"
                      : isTurkish
                        ? "Kilitli"
                        : "Locked"}
                  </span>
                </div>

                <h3 className="achievement-name">
                  {
                    achievement.title
                  }
                </h3>

                <p className="achievement-description">
                  {
                    achievement.description
                  }
                </p>

                <div className="achievement-progress-header">
                  <span>
                    {
                      achievement.progress
                    }{" "}
                    / {target}
                  </span>

                  <strong>
                    {percentage}%
                  </strong>
                </div>

                <div className="achievement-progress-track">
                  <div
                    className="achievement-progress-fill"
                    style={{
                      width:
                        `${percentage}%`,
                    }}
                  />
                </div>
              </article>
            );
          }
        )}
      </div>
    </section>
  );
}

export default Achievements;