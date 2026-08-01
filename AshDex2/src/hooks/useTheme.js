import { useEffect, useState } from "react";

const STORAGE_KEY = "ashdex-theme";

function getInitialTheme() {
  const savedTheme = localStorage.getItem(
    STORAGE_KEY
  );

  if (
    savedTheme === "light" ||
    savedTheme === "dark"
  ) {
    return savedTheme;
  }

  const prefersDark =
    window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;

  return prefersDark ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState(
    getInitialTheme
  );

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme;

    localStorage.setItem(
      STORAGE_KEY,
      theme
    );

    const themeColor =
      theme === "dark"
        ? "#120a0c"
        : "#d92d3c";

    document
      .querySelector(
        'meta[name="theme-color"]'
      )
      ?.setAttribute(
        "content",
        themeColor
      );
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "dark"
        ? "light"
        : "dark"
    );
  }

  return {
    theme,
    toggleTheme,
  };
}