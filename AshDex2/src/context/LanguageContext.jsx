import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import en from "../locales/en";
import tr from "../locales/tr";

const translations = {
  en,
  tr,
};

const LanguageContext =
  createContext(null);

function getInitialLanguage() {
  const savedLanguage =
    window.localStorage.getItem(
      "ashdex-language"
    );

  if (
    savedLanguage === "en" ||
    savedLanguage === "tr"
  ) {
    return savedLanguage;
  }

  const browserLanguage =
    navigator.language
      ?.toLowerCase()
      .slice(0, 2);

  return browserLanguage === "tr"
    ? "tr"
    : "en";
}

export function LanguageProvider({
  children,
}) {
  const [language, setLanguage] =
    useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(
      "ashdex-language",
      language
    );

    document.documentElement.lang =
      language;
  }, [language]);

  const value = useMemo(() => {
    function changeLanguage(
      nextLanguage
    ) {
      if (
        nextLanguage !== "en" &&
        nextLanguage !== "tr"
      ) {
        return;
      }

      setLanguage(nextLanguage);
    }

    function toggleLanguage() {
      setLanguage(
        (currentLanguage) =>
          currentLanguage === "en"
            ? "tr"
            : "en"
      );
    }

    function t(key, replacements = {}) {
      const keys = key.split(".");

      let translatedValue =
        translations[language];

      for (const currentKey of keys) {
        translatedValue =
          translatedValue?.[currentKey];
      }

      if (
        typeof translatedValue !==
        "string"
      ) {
        console.warn(
          `Missing translation: ${language}.${key}`
        );

        return key;
      }

      return Object.entries(
        replacements
      ).reduce(
        (
          result,
          [replacementKey, value]
        ) =>
          result.replaceAll(
            `{${replacementKey}}`,
            String(value)
          ),
        translatedValue
      );
    }

    return {
      language,
      changeLanguage,
      toggleLanguage,
      t,
    };
  }, [language]);

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider."
    );
  }

  return context;
}

export default LanguageContext;