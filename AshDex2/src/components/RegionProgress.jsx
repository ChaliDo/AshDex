import { useMemo } from "react";

import { ashPokemon } from "../data/ashPokemon";

import {
  useLanguage,
} from "../context/LanguageContext";

function RegionProgress({
  ownedPokemon,
}) {
  const {
    language,
  } = useLanguage();

  const isTurkish =
    language === "tr";

  const regions = useMemo(() => {
    const safeOwnedPokemon =
      ownedPokemon || {};

    const regionMap = {};

    ashPokemon.forEach(
      (pokemon) => {
        if (
          !regionMap[
            pokemon.region
          ]
        ) {
          regionMap[
            pokemon.region
          ] = {
            name:
              pokemon.region,
            total: 0,
            owned: 0,
          };
        }

        regionMap[
          pokemon.region
        ].total += 1;

        if (
          safeOwnedPokemon[
            pokemon.id
          ] === true
        ) {
          regionMap[
            pokemon.region
          ].owned += 1;
        }
      }
    );

    return Object.values(
      regionMap
    );
  }, [ownedPokemon]);

  return (
    <section className="region-progress-card">
      <div className="region-progress-header">
        <div>
          <p className="region-progress-eyebrow">
            {isTurkish
              ? "DÜNYA YOLCULUĞU"
              : "WORLD JOURNEY"}
          </p>

          <h2 className="region-progress-title">
            {isTurkish
              ? "Bölge İlerlemesi"
              : "Region Progress"}
          </h2>

          <p className="region-progress-subtitle">
            {isTurkish
              ? "Ash’in yolculuğundaki her bölgede ne kadar ilerlediğini takip et."
              : "Track how far you have travelled through every region in Ash’s journey."}
          </p>
        </div>
      </div>

      <div className="region-progress-grid">
        {regions.map(
          (region) => {
            const percent =
              region.total > 0
                ? Math.round(
                    (region.owned /
                      region.total) *
                      100
                  )
                : 0;

            const rank =
              getRegionRank(
                percent,
                isTurkish
              );

            return (
              <article
                key={
                  region.name
                }
                className="region-progress-item"
              >
                <div className="region-progress-item-header">
                  <div>
                    <h3 className="region-progress-name">
                      {
                        region.name
                      }
                    </h3>

                    <p className="region-progress-count">
                      {isTurkish
                        ? `${region.total} kaydın ${region.owned} tanesi toplandı`
                        : `${region.owned} of ${region.total} collected`}
                    </p>
                  </div>

                  <span
                    className={`region-progress-rank ${rank.className}`}
                  >
                    {rank.icon}{" "}
                    {rank.label}
                  </span>
                </div>

                <div className="region-progress-meta">
                  <span>
                    {region.owned}/
                    {region.total}
                  </span>

                  <strong>
                    {percent}%
                  </strong>
                </div>

                <div className="region-progress-track">
                  <div
                    className={`region-progress-fill ${rank.fillClassName}`}
                    style={{
                      width:
                        `${percent}%`,
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

function getRegionRank(
  percent,
  isTurkish
) {
  if (percent >= 100) {
    return {
      label: isTurkish
        ? "Usta"
        : "Master",
      icon: "👑",
      className:
        "region-progress-rank-master",
      fillClassName:
        "region-progress-fill-master",
    };
  }

  if (percent >= 75) {
    return {
      label: isTurkish
        ? "Altın"
        : "Gold",
      icon: "🥇",
      className:
        "region-progress-rank-gold",
      fillClassName:
        "region-progress-fill-gold",
    };
  }

  if (percent >= 50) {
    return {
      label: isTurkish
        ? "Gümüş"
        : "Silver",
      icon: "🥈",
      className:
        "region-progress-rank-silver",
      fillClassName:
        "region-progress-fill-silver",
    };
  }

  if (percent >= 25) {
    return {
      label: isTurkish
        ? "Bronz"
        : "Bronze",
      icon: "🥉",
      className:
        "region-progress-rank-bronze",
      fillClassName:
        "region-progress-fill-bronze",
    };
  }

  return {
    label: isTurkish
      ? "Başlangıç"
      : "Beginner",
    icon: "🗺️",
    className:
      "region-progress-rank-beginner",
    fillClassName:
      "region-progress-fill-beginner",
  };
}

export default RegionProgress;