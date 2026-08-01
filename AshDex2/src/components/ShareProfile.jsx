import {
  useMemo,
  useState,
} from "react";

import { ashPokemon } from "../data/ashPokemon";

import {
  useToast,
} from "../context/ToastContext";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  publishPublicProfile,
} from "../services/publicProfileService";

function ShareProfile({
  user,
  trainerProfile,
  ownedPokemon,
}) {
  const [
    publishing,
    setPublishing,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const { showToast } =
    useToast();

  const {
    t,
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

    const completion =
      ashPokemon.length > 0
        ? Math.round(
            (ownedCount /
              ashPokemon.length) *
              100
          )
        : 0;

    return {
      ownedCount,
      totalCount:
        ashPokemon.length,
      completion,
    };
  }, [ownedPokemon]);

  async function handlePublish() {
    if (publishing) {
      return;
    }

    setPublishing(true);
    setMessage("");
    setError("");

    try {
      const trainerCode =
        await publishPublicProfile({
          user,
          trainerProfile,
          ownedPokemon,
          totalPokemon:
            ashPokemon.length,
        });

      const successMessage =
        isTurkish
          ? `Profil başarıyla yayınlandı. Eğitmen Kodu: ${trainerCode}`
          : `Profile published successfully. Trainer Code: ${trainerCode}`;

      setMessage(
        successMessage
      );

      showToast({
        title: isTurkish
          ? "Profil yayınlandı"
          : "Profile published",

        message: isTurkish
          ? `Eğitmen Kodu: ${trainerCode}`
          : `Trainer Code: ${trainerCode}`,

        type: "success",
      });
    } catch (publishError) {
      console.error(
        "Public profile could not be shared:",
        publishError
      );

      const fallbackMessage =
        isTurkish
          ? "Profil yayınlanamadı."
          : "Profile could not be published.";

      const errorMessage =
        publishError.message ||
        fallbackMessage;

      setError(
        errorMessage
      );

      showToast({
        title: isTurkish
          ? "Yayınlama başarısız"
          : "Publish failed",

        message:
          errorMessage,

        type: "error",
        duration: 4000,
      });
    } finally {
      setPublishing(false);
    }
  }

  async function handleCopy() {
    const trainerCode =
      trainerProfile
        ?.trainerCode;

    if (!trainerCode) {
      const errorMessage =
        isTurkish
          ? "Eğitmen Kodu mevcut değil."
          : "Trainer Code is not available.";

      setMessage("");
      setError(
        errorMessage
      );

      showToast({
        title: isTurkish
          ? "Kod mevcut değil"
          : "Code unavailable",

        message:
          errorMessage,

        type: "error",
      });

      return;
    }

    try {
      await navigator.clipboard
        .writeText(
          trainerCode
        );

      const copiedMessage =
        isTurkish
          ? "Eğitmen Kodu kopyalandı."
          : "Trainer Code copied.";

      setError("");
      setMessage(
        copiedMessage
      );

      showToast({
        title: isTurkish
          ? "Eğitmen Kodu kopyalandı"
          : "Trainer Code copied",

        message:
          trainerCode,

        type: "success",
      });
    } catch (copyError) {
      console.error(
        "Trainer Code could not be copied:",
        copyError
      );

      const errorMessage =
        isTurkish
          ? "Eğitmen Kodu kopyalanamadı."
          : "Trainer Code could not be copied.";

      setMessage("");
      setError(
        errorMessage
      );

      showToast({
        title: isTurkish
          ? "Kopyalama başarısız"
          : "Copy failed",

        message:
          errorMessage,

        type: "error",
      });
    }
  }

  return (
    <section className="share-profile-panel">
      <div className="share-profile-header">
        <div>
          <p className="share-profile-eyebrow">
            {isTurkish
              ? "EĞİTMEN AĞI"
              : "TRAINER NETWORK"}
          </p>

          <h2 className="share-profile-title">
            {t(
              "share.title"
            )}
          </h2>

          <p className="share-profile-description">
            {t(
              "share.description"
            )}
          </p>
        </div>

        <div className="share-profile-summary">
          <strong>
            {stats.completion}%
          </strong>

          <span>
            {stats.ownedCount}/
            {stats.totalCount}
          </span>

          <small>
            {isTurkish
              ? "Toplandı"
              : "Collected"}
          </small>
        </div>
      </div>

      <div className="share-profile-code-card">
        <div className="share-profile-code-icon">
          🪪
        </div>

        <div className="share-profile-code-copy">
          <span>
            {t(
              "share.trainerCode"
            )}
          </span>

          <strong>
            {trainerProfile
              ?.trainerCode ||
              t(
                "common.notAvailable"
              )}
          </strong>

          <small>
            {isTurkish
              ? "Arkadaşlarının koleksiyonları karşılaştırabilmesi için bu kodu paylaş."
              : "Share this code with a friend so they can compare collections."}
          </small>
        </div>
      </div>

      <div className="share-profile-actions">
        <button
          type="button"
          className="share-profile-primary-button"
          onClick={
            handlePublish
          }
          disabled={
            publishing ||
            !trainerProfile
          }
        >
          <span aria-hidden="true">
            {publishing
              ? "⏳"
              : "🌐"}
          </span>

          <span>
            {publishing
              ? t(
                  "share.sharing"
                )
              : t(
                  "share.shareProfile"
                )}
          </span>
        </button>

        <button
          type="button"
          className="share-profile-secondary-button"
          onClick={
            handleCopy
          }
          disabled={
            !trainerProfile
              ?.trainerCode
          }
        >
          <span aria-hidden="true">
            📋
          </span>

          <span>
            {t(
              "share.copyCode"
            )}
          </span>
        </button>
      </div>

      {message && (
        <div className="share-profile-message share-profile-success">
          <span aria-hidden="true">
            ✅
          </span>

          <span>
            {message}
          </span>
        </div>
      )}

      {error && (
        <div className="share-profile-message share-profile-error">
          <span aria-hidden="true">
            ⚠️
          </span>

          <span>
            {error}
          </span>
        </div>
      )}
    </section>
  );
}

export default ShareProfile;