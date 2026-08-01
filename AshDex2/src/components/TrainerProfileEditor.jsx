import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Cropper from "react-easy-crop";

import { ashPokemon } from "../data/ashPokemon";
import { useToast } from "../context/ToastContext";
import {
  useLanguage,
} from "../context/LanguageContext";

import {
  createCroppedImage,
  uploadProfileImage,
} from "../services/profileImageService";

import {
  saveTrainerProfile,
} from "../services/trainerService";

const cardThemes = [
  {
    id: "classic",
    name: {
      en: "Classic Red",
      tr: "Klasik Kırmızı",
    },
    description: {
      en: "AshDex red and black.",
      tr: "AshDex kırmızı ve siyah.",
    },
  },
  {
    id: "midnight",
    name: {
      en: "Midnight",
      tr: "Gece Mavisi",
    },
    description: {
      en: "Dark blue collector card.",
      tr: "Koyu mavi koleksiyoncu kartı.",
    },
  },
  {
    id: "electric",
    name: {
      en: "Electric",
      tr: "Elektrik",
    },
    description: {
      en: "Yellow and charcoal theme.",
      tr: "Sarı ve kömür tonlu tema.",
    },
  },
  {
    id: "forest",
    name: {
      en: "Forest",
      tr: "Orman",
    },
    description: {
      en: "Green regional theme.",
      tr: "Yeşil bölgesel tema.",
    },
  },
];

function TrainerProfileEditor({
  user,
  trainerProfile,
  onClose,
}) {
  const [trainerName, setTrainerName] =
    useState(
      trainerProfile?.trainerName || ""
    );

  const [trainerTitle, setTrainerTitle] =
    useState(
      trainerProfile?.trainerTitle || ""
    );

  const [
    favoritePokemonId,
    setFavoritePokemonId,
  ] = useState(
    trainerProfile?.favoritePokemonId || ""
  );

  const [
    favoriteRegion,
    setFavoriteRegion,
  ] = useState(
    trainerProfile?.favoriteRegion || ""
  );

  const [cardTheme, setCardTheme] =
    useState(
      trainerProfile?.cardTheme ||
        "classic"
    );

  const [
    collectionStartDate,
    setCollectionStartDate,
  ] = useState(
    trainerProfile?.collectionStartDate ||
      ""
  );

  const [imageSource, setImageSource] =
    useState("");

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] =
    useState(1);

  const [
    croppedAreaPixels,
    setCroppedAreaPixels,
  ] = useState(null);

  const [
    croppedPreviewURL,
    setCroppedPreviewURL,
  ] = useState("");

  const [
    removeCustomImage,
    setRemoveCustomImage,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const { showToast } = useToast();

  const {
    t,
    language,
  } = useLanguage();

  const isTurkish =
    language === "tr";

  const regions = useMemo(() => {
    return [
      ...new Set(
        ashPokemon.map(
          (pokemon) =>
            pokemon.region
        )
      ),
    ];
  }, []);

  const currentProfileImage =
    trainerProfile?.profileImageURL || "";

  const googleProfileImage =
    user?.photoURL || "";

  const visibleProfileImage =
    croppedPreviewURL ||
    (!removeCustomImage
      ? currentProfileImage
      : "") ||
    googleProfileImage ||
    "";

  useEffect(() => {
    return () => {
      if (imageSource) {
        URL.revokeObjectURL(
          imageSource
        );
      }

      if (croppedPreviewURL) {
        URL.revokeObjectURL(
          croppedPreviewURL
        );
      }
    };
  }, [
    imageSource,
    croppedPreviewURL,
  ]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        if (imageSource) {
          handleCancelCrop();
          return;
        }

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
  });

  const handleCropComplete =
    useCallback(
      (_, croppedPixels) => {
        setCroppedAreaPixels(
          croppedPixels
        );
      },
      []
    );

  function handleBackdropClick(event) {
    if (
      event.target === event.currentTarget &&
      !saving &&
      !imageSource
    ) {
      onClose();
    }
  }

  function handleImageChange(event) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      showImageError(
        isTurkish
          ? "Yalnızca JPG, PNG ve WEBP görsellerine izin verilir."
          : "Only JPG, PNG and WEBP images are allowed."
      );

      return;
    }

    if (
      file.size >
      3 * 1024 * 1024
    ) {
      showImageError(
        isTurkish
          ? "Profil görseli 3 MB’den küçük olmalıdır."
          : "Profile image must be smaller than 3 MB."
      );

      return;
    }

    if (imageSource) {
      URL.revokeObjectURL(
        imageSource
      );
    }

    setImageSource(
      URL.createObjectURL(file)
    );

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);
    setCroppedAreaPixels(null);
    setRemoveCustomImage(false);
    setError("");
  }

  async function handleConfirmCrop() {
    if (
      !imageSource ||
      !croppedAreaPixels
    ) {
      return;
    }

    try {
      const blob =
        await createCroppedImage(
          imageSource,
          croppedAreaPixels
        );

      if (croppedPreviewURL) {
        URL.revokeObjectURL(
          croppedPreviewURL
        );
      }

      setCroppedPreviewURL(
        URL.createObjectURL(blob)
      );

      setImageSource("");
      setCroppedAreaPixels(null);
      setRemoveCustomImage(false);

      setPendingImageBlob(blob);
    } catch (cropError) {
      showImageError(
        cropError.message ||
          (isTurkish
            ? "Görsel kırpılamadı."
            : "Image could not be cropped.")
      );
    }
  }

  const [
    pendingImageBlob,
    setPendingImageBlob,
  ] = useState(null);

  function handleCancelCrop() {
    if (imageSource) {
      URL.revokeObjectURL(
        imageSource
      );
    }

    setImageSource("");
    setCroppedAreaPixels(null);
    setCrop({
      x: 0,
      y: 0,
    });
    setZoom(1);
  }

  function handleUseGooglePhoto() {
    if (croppedPreviewURL) {
      URL.revokeObjectURL(
        croppedPreviewURL
      );
    }

    setPendingImageBlob(null);
    setCroppedPreviewURL("");
    setRemoveCustomImage(true);
    setError("");
  }

  function handleRestoreCurrentPhoto() {
    if (croppedPreviewURL) {
      URL.revokeObjectURL(
        croppedPreviewURL
      );
    }

    setPendingImageBlob(null);
    setCroppedPreviewURL("");
    setRemoveCustomImage(false);
    setError("");
  }

  function showImageError(message) {
    setError(message);

    showToast({
      title: isTurkish
        ? "Profil görseli hatası"
        : "Profile image error",
      message,
      type: "error",
      duration: 4000,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedName =
      trainerName.trim();

    const normalizedTitle =
      trainerTitle.trim();

    if (!normalizedName) {
      setError(
        isTurkish
          ? "Eğitmen Adı zorunludur."
          : "Trainer Name is required."
      );

      return;
    }

    if (!user?.uid) {
      setError(
        isTurkish
          ? "Kullanıcı hesabına ulaşılamıyor."
          : "User account is not available."
      );

      return;
    }

    setSaving(true);
    setError("");

    try {
      let profileImageURL =
        currentProfileImage;

      let profileImagePublicId =
        trainerProfile
          ?.profileImagePublicId ||
        "";

      if (pendingImageBlob) {
        const uploadedImage =
          await uploadProfileImage(
            user.uid,
            pendingImageBlob
          );

        profileImageURL =
          uploadedImage.url;

        profileImagePublicId =
          uploadedImage.publicId;
      } else if (removeCustomImage) {
        profileImageURL = "";
        profileImagePublicId = "";
      }

      await saveTrainerProfile(
        user.uid,
        {
          trainerName:
            normalizedName,

          trainerTitle:
            normalizedTitle ||
            (isTurkish
              ? "Pokémon Figür Koleksiyoncusu"
              : "Pokémon Figure Collector"),

          favoritePokemonId,
          favoriteRegion,
          cardTheme,
          collectionStartDate,

          featuredBadgeIds:
            trainerProfile
              ?.featuredBadgeIds || [],

          profileImageURL,
          profileImagePublicId,
        }
      );

      showToast({
        title: isTurkish
          ? "Eğitmen Kartı güncellendi"
          : "Trainer Card updated",

        message:
          pendingImageBlob
            ? isTurkish
              ? "Profilin ve kırpılmış fotoğrafın kaydedildi."
              : "Your profile and cropped photo have been saved."
            : removeCustomImage
              ? isTurkish
                ? "Özel fotoğrafın kaldırıldı."
                : "Your custom photo was removed."
              : isTurkish
                ? "Koleksiyoncu profilin kaydedildi."
                : "Your collector profile has been saved.",

        type: "success",
      });

      onClose();
    } catch (saveError) {
      console.error(
        "Trainer profile could not be saved:",
        saveError
      );

      const errorMessage =
        saveError.message ||
        (isTurkish
          ? "Eğitmen profili kaydedilemedi."
          : "Trainer profile could not be saved.");

      setError(errorMessage);

      showToast({
        title: isTurkish
          ? "Profil kaydedilemedi"
          : "Profile save failed",
        message: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="trainer-editor-backdrop"
      onMouseDown={
        handleBackdropClick
      }
      role="presentation"
    >
      <section
        className="trainer-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trainer-editor-title"
      >
        <div className="trainer-editor-header">
          <div>
            <p className="trainer-editor-eyebrow">
              {t(
                "profileEditor.settings"
              ).toUpperCase()}
            </p>

            <h2
              id="trainer-editor-title"
              className="trainer-editor-title"
            >
              {t(
                "profileEditor.title"
              )}
            </h2>

            <p className="trainer-editor-description">
              {t(
                "profileEditor.description"
              )}
            </p>
          </div>

          <button
            type="button"
            className="trainer-editor-close"
            onClick={onClose}
            disabled={saving}
            aria-label={
              isTurkish
                ? "Eğitmen Kartı düzenleyicisini kapat"
                : "Close Trainer Card editor"
            }
          >
            ×
          </button>
        </div>

        <form
          className="trainer-editor-form"
          onSubmit={handleSubmit}
        >
          <section className="trainer-photo-editor">
            <div className="trainer-photo-preview-frame">
              {visibleProfileImage ? (
                <img
                  src={
                    visibleProfileImage
                  }
                  alt={
                    isTurkish
                      ? "Eğitmen profil önizlemesi"
                      : "Trainer profile preview"
                  }
                  className="trainer-photo-preview"
                />
              ) : (
                <div className="trainer-photo-preview trainer-photo-placeholder">
                  👤
                </div>
              )}

              {pendingImageBlob && (
                <span className="trainer-photo-new-label">
                  {isTurkish ? "Yeni" : "New"}
                </span>
              )}
            </div>

            <div className="trainer-photo-copy">
              <p>{t("profileEditor.profilePicture").toUpperCase()}</p>

              <h3>
                {isTurkish
                  ? "Koleksiyoncu fotoğrafını seç"
                  : "Choose your collector photo"}
              </h3>

              <span>
                {isTurkish
                  ? "Bir fotoğraf seç, konumunu ayarla ve yakınlaştırma düzeyini belirle."
                  : "Select a photo, move it into position and adjust the zoom."}
              </span>

              <div className="trainer-photo-actions">
                <label className="trainer-photo-upload-button">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleImageChange
                    }
                    disabled={saving}
                  />

                  <span aria-hidden="true">
                    📷
                  </span>

                  <span>
                    {t("profileEditor.chooseImage")}
                  </span>
                </label>

                {googleProfileImage && (
                  <button
                    type="button"
                    className="trainer-photo-secondary-button"
                    onClick={
                      handleUseGooglePhoto
                    }
                    disabled={saving}
                  >
                    {t("profileEditor.useGooglePhoto")}
                  </button>
                )}

                {(pendingImageBlob ||
                  removeCustomImage) && (
                  <button
                    type="button"
                    className="trainer-photo-secondary-button"
                    onClick={
                      handleRestoreCurrentPhoto
                    }
                    disabled={saving}
                  >
                    {t("profileEditor.undoPhotoChange")}
                  </button>
                )}

                {currentProfileImage &&
                  !removeCustomImage &&
                  !pendingImageBlob && (
                    <button
                      type="button"
                      className="trainer-photo-remove-button"
                      onClick={
                        handleUseGooglePhoto
                      }
                      disabled={saving}
                    >
                      {t("profileEditor.removeCustomPhoto")}
                    </button>
                  )}
              </div>
            </div>
          </section>

          <div className="trainer-editor-grid">
            <label className="trainer-editor-field">
              <span>
                {t("profileEditor.trainerName")}
              </span>

              <input
                type="text"
                value={trainerName}
                onChange={(event) =>
                  setTrainerName(
                    event.target.value
                  )
                }
                maxLength={30}
              />
            </label>

            <label className="trainer-editor-field">
              <span>
                {t("profileEditor.trainerTitle")}
              </span>

              <input
                type="text"
                value={trainerTitle}
                onChange={(event) =>
                  setTrainerTitle(
                    event.target.value
                  )
                }
                maxLength={40}
              />
            </label>

            <label className="trainer-editor-field">
              <span>
                {t("profileEditor.favoritePokemon")}
              </span>

              <select
                value={
                  favoritePokemonId
                }
                onChange={(event) =>
                  setFavoritePokemonId(
                    event.target.value
                  )
                }
              >
                <option value="">
                  {isTurkish ? "Bir Pokémon seç" : "Select a Pokémon"}
                </option>

                {ashPokemon.map(
                  (pokemon) => (
                    <option
                      key={pokemon.id}
                      value={pokemon.id}
                    >
                      {pokemon.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="trainer-editor-field">
              <span>
                {t("profileEditor.favoriteRegion")}
              </span>

              <select
                value={favoriteRegion}
                onChange={(event) =>
                  setFavoriteRegion(
                    event.target.value
                  )
                }
              >
                <option value="">
                  {isTurkish ? "Bir bölge seç" : "Select a region"}
                </option>

                {regions.map(
                  (region) => (
                    <option
                      key={region}
                      value={region}
                    >
                      {region}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="trainer-editor-field trainer-editor-field-wide">
              <span>
                {t("profileEditor.collectionStartDate")}
              </span>

              <input
                type="date"
                value={
                  collectionStartDate
                }
                onChange={(event) =>
                  setCollectionStartDate(
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          <fieldset className="trainer-theme-fieldset">
            <legend>
              {t("profileEditor.cardTheme")}
            </legend>

            <div className="trainer-theme-grid">
              {cardThemes.map(
                (theme) => {
                  const selected =
                    cardTheme ===
                    theme.id;

                  return (
                    <label
                      key={theme.id}
                      className={
                        selected
                          ? `trainer-theme-option trainer-theme-${theme.id} trainer-theme-option-selected`
                          : `trainer-theme-option trainer-theme-${theme.id}`
                      }
                    >
                      <input
                        type="radio"
                        name="cardTheme"
                        value={theme.id}
                        checked={selected}
                        onChange={() =>
                          setCardTheme(
                            theme.id
                          )
                        }
                      />

                      <span className="trainer-theme-preview">
                        <span />
                        <strong>
                          ASHDEX
                        </strong>
                      </span>

                      <span className="trainer-theme-copy">
                        <strong>
                          {theme.name[language]}
                        </strong>

                        <small>
                          {
                            theme.description[language]
                          }
                        </small>
                      </span>

                      <span className="trainer-theme-check">
                        {selected
                          ? "✓"
                          : ""}
                      </span>
                    </label>
                  );
                }
              )}
            </div>
          </fieldset>

          {error && (
            <div className="trainer-editor-error">
              <span aria-hidden="true">
                ⚠️
              </span>

              <span>{error}</span>
            </div>
          )}

          <div className="trainer-editor-actions">
            <button
              type="button"
              className="trainer-editor-cancel"
              onClick={onClose}
              disabled={saving}
            >
              {t("common.cancel")}
            </button>

            <button
              type="submit"
              className="trainer-editor-save"
              disabled={
                saving || imageSource
              }
            >
              {saving
                ? t("profileEditor.saving")
                : t("profileEditor.saveTrainerCard")}
            </button>
          </div>
        </form>
      </section>

      {imageSource && (
        <div
          className="profile-crop-backdrop"
          role="presentation"
        >
          <section
            className="profile-crop-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-crop-title"
          >
            <div className="profile-crop-header">
              <div>
                <p>
                  {t(
                    "profileEditor.profilePicture"
                  ).toUpperCase()}
                </p>

                <h2 id="profile-crop-title">
                  {t("profileEditor.adjustPhoto")}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  handleCancelCrop
                }
                aria-label={
                  isTurkish
                    ? "Görsel kırpmayı iptal et"
                    : "Cancel image crop"
                }
              >
                ×
              </button>
            </div>

            <div className="profile-crop-area">
              <Cropper
                image={imageSource}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={
                  handleCropComplete
                }
                onZoomChange={setZoom}
              />
            </div>

            <label className="profile-crop-zoom">
              <span>{t("profileEditor.zoom")}</span>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(event) =>
                  setZoom(
                    Number(
                      event.target.value
                    )
                  )
                }
              />
            </label>

            <div className="profile-crop-actions">
              <button
                type="button"
                className="trainer-editor-cancel"
                onClick={
                  handleCancelCrop
                }
              >
                {t("common.cancel")}
              </button>

              <button
                type="button"
                className="trainer-editor-save"
                onClick={
                  handleConfirmCrop
                }
                disabled={
                  !croppedAreaPixels
                }
              >
                {t("profileEditor.useCrop")}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default TrainerProfileEditor;