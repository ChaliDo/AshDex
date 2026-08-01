import { useTheme } from "../hooks/useTheme";

import {
  useLanguage,
} from "../context/LanguageContext";

import LanguageSwitcher from "./LanguageSwitcher";

const navigationItems = [
  {
    id: "dashboard",
    translationKey:
      "navigation.dashboard",
    icon: "⌂",
  },
  {
    id: "pokedex",
    translationKey:
      "navigation.pokedex",
    icon: "◉",
  },
  {
    id: "trainer",
    translationKey:
      "navigation.trainer",
    icon: "♟",
  },
  {
    id: "friends",
    translationKey:
      "navigation.friends",
    icon: "♧",
  },
];

function AppNavigation({
  activePage,
  onPageChange,
}) {
  const {
    theme,
    toggleTheme,
  } = useTheme();

  const {
    language,
    toggleLanguage,
    t,
  } = useLanguage();

  const themeLabel =
    theme === "dark"
      ? t("navigation.lightMode")
      : t("navigation.darkMode");

  const languageLabel =
    language === "en"
      ? t("language.turkish")
      : t("language.english");

  return (
    <>
      <nav className="desktop-navigation">
        <button
          type="button"
          className="navigation-brand"
          onClick={() =>
            onPageChange("dashboard")
          }
          aria-label={t(
            "navigation.dashboard"
          )}
        >
          <span className="navigation-logo">
            <img
              src="/logo-icon.svg"
              alt=""
              className="navigation-logo-image"
            />
          </span>

          <span className="navigation-brand-copy">
            <strong>
              AshDex
            </strong>

            <small>
              {language === "tr"
                ? "Trainer Yolculuğu"
                : "Trainer Journey"}
            </small>
          </span>
        </button>

        <div className="navigation-right">
          <div className="navigation-links">
            {navigationItems.map(
              (item) => {
                const isActive =
                  activePage === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      isActive
                        ? "navigation-link navigation-link-active"
                        : "navigation-link"
                    }
                    onClick={() =>
                      onPageChange(
                        item.id
                      )
                    }
                    aria-current={
                      isActive
                        ? "page"
                        : undefined
                    }
                  >
                    <span className="navigation-link-icon">
                      {item.icon}
                    </span>

                    <span>
                      {t(
                        item.translationKey
                      )}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          <LanguageSwitcher />

          <button
            type="button"
            className="theme-toggle-button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
          >
            <span aria-hidden="true">
              {theme === "dark"
                ? "☀️"
                : "🌙"}
            </span>
          </button>
        </div>
      </nav>

      <nav className="mobile-navigation">
        {navigationItems.map(
          (item) => {
            const isActive =
              activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={
                  isActive
                    ? "mobile-navigation-link mobile-navigation-link-active"
                    : "mobile-navigation-link"
                }
                onClick={() =>
                  onPageChange(item.id)
                }
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
              >
                <span className="mobile-navigation-icon">
                  {item.icon}
                </span>

                <span className="mobile-navigation-label">
                  {t(
                    item.translationKey
                  )}
                </span>
              </button>
            );
          }
        )}

        <button
          type="button"
          className="mobile-navigation-link"
          onClick={toggleLanguage}
          aria-label={languageLabel}
        >
          <span className="mobile-navigation-icon">
            🌐
          </span>

          <span className="mobile-navigation-label">
            {language.toUpperCase()}
          </span>
        </button>

        <button
          type="button"
          className="mobile-navigation-link"
          onClick={toggleTheme}
          aria-label={themeLabel}
        >
          <span className="mobile-navigation-icon">
            {theme === "dark"
              ? "☀️"
              : "🌙"}
          </span>

          <span className="mobile-navigation-label">
            {theme === "dark"
              ? t(
                  "navigation.lightMode"
                )
              : t(
                  "navigation.darkMode"
                )}
          </span>
        </button>
      </nav>
    </>
  );
}

export default AppNavigation;