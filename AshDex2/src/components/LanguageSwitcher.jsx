import {
  useLanguage,
} from "../context/LanguageContext";

function LanguageSwitcher() {
  const {
    language,
    changeLanguage,
    t,
  } = useLanguage();

  return (
    <div
      className="language-switcher"
      aria-label={t(
        "navigation.changeLanguage"
      )}
    >
      <button
        type="button"
        className={
          language === "en"
            ? "language-option language-option-active"
            : "language-option"
        }
        onClick={() =>
          changeLanguage("en")
        }
        aria-pressed={
          language === "en"
        }
      >
        EN
      </button>

      <button
        type="button"
        className={
          language === "tr"
            ? "language-option language-option-active"
            : "language-option"
        }
        onClick={() =>
          changeLanguage("tr")
        }
        aria-pressed={
          language === "tr"
        }
      >
        TR
      </button>
    </div>
  );
}

export default LanguageSwitcher;