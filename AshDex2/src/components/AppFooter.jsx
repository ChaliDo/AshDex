import {
  useLanguage,
} from "../context/LanguageContext";

const YOUTUBE_URL =
  "https://www.youtube.com/@ChaliDo";

function AppFooter() {
  const { t } = useLanguage();

  return (
    <footer className="app-footer">
      <div className="app-footer-brand">
        <div className="app-footer-logo">
          <img
            src="/logo-icon.svg"
            alt=""
          />
        </div>

        <div>
          <strong>
            AshDex
          </strong>

          <span>
            {t(
              "footer.collectorCompanion"
            )}
          </span>
        </div>
      </div>

      <div className="app-footer-meta">
        <strong>
          {t("footer.createdBy")}
        </strong>

        <span>
          {t("footer.version")}
        </span>

        <span>
          {t("footer.technologies")}
        </span>
      </div>

      <a
        className="app-footer-youtube"
        href={YOUTUBE_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="ChaliDo YouTube"
      >
        <span aria-hidden="true">
          ▶
        </span>

        <span>
          {t("footer.youtube")}
        </span>
      </a>

      <p className="app-footer-copyright">
        {t("footer.copyright")}
      </p>
    </footer>
  );
}

export default AppFooter;