import { useMemo } from "react";

import { ashPokemon } from "../data/ashPokemon";

import {
  useLanguage,
} from "../context/LanguageContext";

import TrainerCardHero from "./TrainerCardHero";
import TrainerCardDownloadButton from "./TrainerCardDownloadButton";

function Dashboard({
  user,
  trainerProfile,
  ownedPokemon,
}) {
  const {
    t,
    language,
  } = useLanguage();

  const stats = useMemo(() => {
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

    const missingCount =
      totalCount - ownedCount;

    const completion =
      totalCount > 0
        ? Math.round(
            (ownedCount / totalCount) *
              100
          )
        : 0;

    const specialForms =
      ownedEntries.filter(
        (pokemon) =>
          pokemon.kind ===
          "Special Form"
      ).length;

    const temporaryPartners =
      ownedEntries.filter(
        (pokemon) =>
          pokemon.kind ===
          "Temporary Partner"
      ).length;

    const companions =
      ownedEntries.filter(
        (pokemon) =>
          pokemon.kind ===
          "Companion"
      ).length;

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

          map[
            pokemon.region
          ].total += 1;

          if (
            safeOwnedPokemon[
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

    const regions =
      Object.values(regionMap).map(
        (region) => ({
          ...region,

          percentage:
            region.total > 0
              ? Math.round(
                  (region.owned /
                    region.total) *
                    100
                )
              : 0,
        })
      );

    const completedRegions =
      regions.filter(
        (region) =>
          region.total > 0 &&
          region.owned ===
            region.total
      );

    const strongestRegion =
      [...regions].sort(
        (a, b) => {
          if (
            b.percentage !==
            a.percentage
          ) {
            return (
              b.percentage -
              a.percentage
            );
          }

          return b.owned - a.owned;
        }
      )[0] || null;

    const weakestRegion =
      [...regions].sort(
        (a, b) => {
          if (
            a.percentage !==
            b.percentage
          ) {
            return (
              a.percentage -
              b.percentage
            );
          }

          return a.owned - b.owned;
        }
      )[0] || null;

    return {
      ownedCount,
      totalCount,
      missingCount,
      completion,
      specialForms,
      temporaryPartners,
      companions,
      regions,
      completedRegions,
      strongestRegion,
      weakestRegion,
    };
  }, [ownedPokemon]);

  const collectedDescription =
    t(
      "dashboard.figuresCollected",
      {
        owned: stats.ownedCount,
        missing:
          stats.missingCount,
      }
    );

  return (
    <>
      <TrainerCardHero
        user={user}
        trainerProfile={
          trainerProfile
        }
        ownedPokemon={
          ownedPokemon
        }
      />

      <TrainerCardDownloadButton
        user={user}
        trainerProfile={
          trainerProfile
        }
        ownedPokemon={
          ownedPokemon
        }
      />

      <section className="dashboard-card">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-eyebrow">
              {t(
                "dashboard.overview"
              )}
            </p>

            <h2 className="dashboard-name">
              {t(
                "dashboard.statistics"
              )}
            </h2>

            <p className="dashboard-title">
              {t(
                "dashboard.description"
              )}
            </p>
          </div>

          <div className="dashboard-completion-card">
            <strong>
              {stats.completion}%
            </strong>

            <span>
              {t(
                "dashboard.collectionComplete"
              )}
            </span>

            <small>
              {stats.ownedCount}/
              {stats.totalCount}
            </small>
          </div>
        </div>

        <div className="dashboard-progress-track">
          <div
            className="dashboard-progress-fill"
            style={{
              width:
                `${stats.completion}%`,
            }}
          />
        </div>

        <p className="dashboard-progress-copy">
          {collectedDescription}
        </p>

        <div className="dashboard-stat-grid dashboard-collection-stat-grid">
          <StatCard
            symbol="✓"
            value={
              stats.ownedCount
            }
            label={t(
              "dashboard.ownedFigures"
            )}
          />

          <StatCard
            symbol="?"
            value={
              stats.missingCount
            }
            label={t(
              "dashboard.missingFigures"
            )}
          />

          <StatCard
            symbol="★"
            value={
              stats.specialForms
            }
            label={t(
              "dashboard.specialForms"
            )}
          />

          <StatCard
            symbol="◆"
            value={
              stats.temporaryPartners
            }
            label={t(
              "dashboard.temporaryPartners"
            )}
          />

          <StatCard
            symbol="●"
            value={
              stats.companions
            }
            label={t(
              "dashboard.companions"
            )}
          />

          <StatCard
            symbol="🏅"
            value={
              stats.completedRegions
                .length
            }
            label={t(
              "dashboard.completedRegions"
            )}
          />
        </div>

        <div className="dashboard-insight-grid">
          <InsightCard
            eyebrow={t(
              "dashboard.strongestRegion"
            )}
            title={
              stats.strongestRegion
                ?.name ||
              t("dashboard.noData")
            }
            value={
              stats.strongestRegion
                ? `${stats.strongestRegion.percentage}%`
                : "0%"
            }
            description={
              stats.strongestRegion
                ? t(
                    "dashboard.regionCollected",
                    {
                      owned:
                        stats
                          .strongestRegion
                          .owned,

                      total:
                        stats
                          .strongestRegion
                          .total,
                    }
                  )
                : language === "tr"
                  ? "Koleksiyonuna figür ekleyerek başla."
                  : "Start adding figures to your collection."
            }
            icon="📈"
          />

          <InsightCard
            eyebrow={t(
              "dashboard.mostToCollect"
            )}
            title={
              stats.weakestRegion
                ?.name ||
              t("dashboard.noData")
            }
            value={
              stats.weakestRegion
                ? t(
                    "dashboard.missing",
                    {
                      count:
                        stats
                          .weakestRegion
                          .total -
                        stats
                          .weakestRegion
                          .owned,
                    }
                  )
                : t(
                    "dashboard.missing",
                    {
                      count: 0,
                    }
                  )
            }
            description={
              stats.weakestRegion
                ? t(
                    "dashboard.regionCollected",
                    {
                      owned:
                        stats
                          .weakestRegion
                          .owned,

                      total:
                        stats
                          .weakestRegion
                          .total,
                    }
                  )
                : language === "tr"
                  ? "Bölge verisi bulunmuyor."
                  : "No region data available."
            }
            icon="🧭"
          />
        </div>

        <div className="dashboard-region-overview">
          <div className="dashboard-region-heading">
            <div>
              <p className="dashboard-eyebrow">
                {t(
                  "dashboard.collectionByRegion"
                )}
              </p>

              <h3>
                {t(
                  "dashboard.regionalOverview"
                )}
              </h3>
            </div>

            <strong>
              {
                stats.completedRegions
                  .length
              }
              /
              {stats.regions.length}
            </strong>
          </div>

          <div className="dashboard-region-grid">
            {stats.regions.map(
              (region) => (
                <article
                  key={region.name}
                  className="dashboard-region-card"
                >
                  <div className="dashboard-region-row">
                    <strong>
                      {region.name}
                    </strong>

                    <span>
                      {
                        region.percentage
                      }
                      %
                    </span>
                  </div>

                  <div className="dashboard-region-track">
                    <div
                      className="dashboard-region-fill"
                      style={{
                        width:
                          `${region.percentage}%`,
                      }}
                    />
                  </div>

                  <small>
                    {t(
                      "dashboard.regionCollected",
                      {
                        owned:
                          region.owned,

                        total:
                          region.total,
                      }
                    )}
                  </small>
                </article>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({
  symbol,
  value,
  label,
}) {
  return (
    <article className="dashboard-stat-card">
      <span className="dashboard-stat-symbol">
        {symbol}
      </span>

      <div>
        <strong className="dashboard-stat-value">
          {value}
        </strong>

        <span className="dashboard-stat-label">
          {label}
        </span>
      </div>
    </article>
  );
}

function InsightCard({
  eyebrow,
  title,
  value,
  description,
  icon,
}) {
  return (
    <article className="dashboard-insight-card">
      <span className="dashboard-insight-icon">
        {icon}
      </span>

      <div className="dashboard-insight-copy">
        <p>{eyebrow}</p>

        <div className="dashboard-insight-title-row">
          <h3>{title}</h3>

          <strong>
            {value}
          </strong>
        </div>

        <span>
          {description}
        </span>
      </div>
    </article>
  );
}

export default Dashboard;