import { useState } from "react";
import {
  signOut,
} from "firebase/auth";

import {
  auth,
} from "../firebase/firebase";

import {
  useCollection,
} from "../hooks/useCollection";

import {
  useTrainerProfile,
} from "../hooks/useTrainerProfile";

import {
  useLanguage,
} from "../context/LanguageContext";

import Achievements from "./Achievements";
import AppFooter from "./AppFooter";
import AppNavigation from "./AppNavigation";
import Collection from "./Collection";
import Dashboard from "./Dashboard";
import FriendLookup from "./FriendLookup";
import RegionProgress from "./RegionProgress";
import ShareProfile from "./ShareProfile";
import TrainerLevel from "./TrainerLevel";
import TrainerProfileEditor from "./TrainerProfileEditor";

function TrainerCard({ user }) {
  const [
    activePage,
    setActivePage,
  ] = useState("dashboard");

  const [
    error,
    setError,
  ] = useState("");

  const [
    editingProfile,
    setEditingProfile,
  ] = useState(false);

  const {
    t,
    language,
  } = useLanguage();

  const {
    ownedPokemon,
    collectionLoading,
    collectionError,
  } = useCollection(user);

  const {
    trainerProfile,
    profileLoading,
    profileError,
  } = useTrainerProfile(user);

  const loading =
    collectionLoading ||
    profileLoading;

  function handlePageChange(
    pageId
  ) {
    setActivePage(pageId);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleLogout() {
    setError("");

    try {
      await signOut(auth);
    } catch (logoutError) {
      console.error(
        "Sign out failed:",
        logoutError
      );

      setError(
        logoutError.message ||
          t("common.error")
      );
    }
  }

  function renderActivePage() {
    if (activePage === "pokedex") {
      return (
        <>
          <PageHeading
            eyebrow={t(
              "pages.pokedex.eyebrow"
            )}
            title={t(
              "pages.pokedex.title"
            )}
            description={t(
              "pages.pokedex.description"
            )}
          />

          <Collection
            user={user}
            ownedPokemon={
              ownedPokemon
            }
          />
        </>
      );
    }

    if (activePage === "trainer") {
      return (
        <>
          <PageHeading
            eyebrow={t(
              "pages.trainer.eyebrow"
            )}
            title={t(
              "pages.trainer.title"
            )}
            description={t(
              "pages.trainer.description"
            )}
          />

          <Dashboard
            user={user}
            trainerProfile={
              trainerProfile
            }
            ownedPokemon={
              ownedPokemon
            }
          />

          <TrainerLevel
            ownedPokemon={
              ownedPokemon
            }
          />

          <Achievements
            ownedPokemon={
              ownedPokemon
            }
          />

          <ShareProfile
            user={user}
            trainerProfile={
              trainerProfile
            }
            ownedPokemon={
              ownedPokemon
            }
          />
        </>
      );
    }

    if (activePage === "friends") {
      return (
        <>
          <PageHeading
            eyebrow={t(
              "pages.friends.eyebrow"
            )}
            title={t(
              "pages.friends.title"
            )}
            description={t(
              "pages.friends.description"
            )}
          />

          <ShareProfile
            user={user}
            trainerProfile={
              trainerProfile
            }
            ownedPokemon={
              ownedPokemon
            }
          />

          <FriendLookup
            ownTrainerCode={
              trainerProfile
                ?.trainerCode ||
              ""
            }
            ownedPokemon={
              ownedPokemon
            }
          />
        </>
      );
    }

    return (
      <>
        <PageHeading
          eyebrow={t(
            "pages.dashboard.eyebrow"
          )}
          title={
            trainerProfile
              ?.trainerName ||
            user?.displayName ||
            "Eğitmen"
          }
          description={t(
            "pages.dashboard.description"
          )}
          variant="welcome"
        />

        <Dashboard
          user={user}
          trainerProfile={
            trainerProfile
          }
          ownedPokemon={
            ownedPokemon
          }
        />

        <TrainerLevel
          ownedPokemon={
            ownedPokemon
          }
        />

        <RegionProgress
          ownedPokemon={
            ownedPokemon
          }
        />

        <DashboardActions
          onPageChange={
            handlePageChange
          }
          language={language}
        />
      </>
    );
  }

  return (
    <main className="ashdex-app">
      <AppNavigation
        activePage={activePage}
        onPageChange={
          handlePageChange
        }
      />

      <header className="main-page-header">
        <div className="main-page-title-group">
          <p className="main-page-eyebrow">
            {t("header.eyebrow")}
          </p>

          <h1 className="main-page-title">
            {t("header.title")}
          </h1>
        </div>

        <div className="main-page-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              setEditingProfile(true)
            }
          >
            {t(
              "header.editTrainerCard"
            )}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={handleLogout}
          >
            {t("common.signOut")}
          </button>
        </div>
      </header>

      {error && (
        <p className="global-error">
          {error}
        </p>
      )}

      {collectionError && (
        <p className="global-error">
          {collectionError}
        </p>
      )}

      {profileError && (
        <p className="global-error">
          {profileError}
        </p>
      )}

      {loading ? (
        <section className="loading-card">
          <strong>
            {language === "tr"
              ? "Eğitmen verileri yükleniyor..."
              : "Loading trainer data..."}
          </strong>
        </section>
      ) : (
        renderActivePage()
      )}

      <AppFooter />

      {editingProfile &&
        trainerProfile && (
          <TrainerProfileEditor
            user={user}
            trainerProfile={
              trainerProfile
            }
            onClose={() =>
              setEditingProfile(
                false
              )
            }
          />
        )}
    </main>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  variant = "default",
}) {
  const className =
    variant === "welcome"
      ? "page-heading page-heading-welcome"
      : "page-heading";

  return (
    <section className={className}>
      <p className="section-eyebrow">
        {eyebrow}
      </p>

      <h2>{title}</h2>

      <p>{description}</p>
    </section>
  );
}

function DashboardActions({
  onPageChange,
  language,
}) {
  const actions =
    language === "tr"
      ? [
          {
            id: "pokedex",
            icon: "◉",
            title:
              "Pokédex’i Aç",
            description:
              "Koleksiyonunu ara ve güncelle.",
          },
          {
            id: "trainer",
            icon: "♟",
            title:
              "Eğitmen Profili",
            description:
              "Seviyeni, XP’ni ve başarılarını görüntüle.",
          },
          {
            id: "friends",
            icon: "♧",
            title:
              "Arkadaş Bul",
            description:
              "Koleksiyonunu diğer eğitmenlerle karşılaştır.",
          },
        ]
      : [
          {
            id: "pokedex",
            icon: "◉",
            title:
              "Open Pokédex",
            description:
              "Search and update your collection.",
          },
          {
            id: "trainer",
            icon: "♟",
            title:
              "Trainer Profile",
            description:
              "View levels, XP and achievements.",
          },
          {
            id: "friends",
            icon: "♧",
            title:
              "Find Friends",
            description:
              "Compare collections with trainers.",
          },
        ];

  return (
    <section className="navigation-card">
      <p className="section-eyebrow">
        {language === "tr"
          ? "HIZLI İŞLEMLER"
          : "QUICK ACTIONS"}
      </p>

      <h2 className="navigation-card-title">
        {language === "tr"
          ? "Yolculuğuna Devam Et"
          : "Continue Your Journey"}
      </h2>

      <div className="quick-actions-grid">
        {actions.map(
          (action) => (
            <button
              key={action.id}
              type="button"
              className="quick-action-button"
              onClick={() =>
                onPageChange(
                  action.id
                )
              }
            >
              <span className="quick-action-icon">
                {action.icon}
              </span>

              <strong>
                {action.title}
              </strong>

              <small>
                {
                  action.description
                }
              </small>
            </button>
          )
        )}
      </div>
    </section>
  );
}

export default TrainerCard;