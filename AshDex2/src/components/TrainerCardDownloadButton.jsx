import {
  useRef,
  useState,
} from "react";

import { toPng } from "html-to-image";

import {
  useToast,
} from "../context/ToastContext";

import TrainerCardExport from "./TrainerCardExport";

function TrainerCardDownloadButton({
  user,
  trainerProfile,
  ownedPokemon,
}) {
  const exportRef =
    useRef(null);

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const { showToast } =
    useToast();

  async function handleDownload() {
    if (
      downloading ||
      !exportRef.current
    ) {
      return;
    }

    setDownloading(true);

    try {
      await waitForImages(
        exportRef.current
      );

      await nextFrame();
      await nextFrame();

      const dataUrl =
        await toPng(
          exportRef.current,
          {
            cacheBust: true,
            pixelRatio: 1,
            width: 1080,
            height: 1080,
            canvasWidth: 1080,
            canvasHeight: 1080,
            backgroundColor:
              "transparent",
          }
        );

      const link =
        document.createElement(
          "a"
        );

      link.download =
        `ashdex-${safeFileName(
          trainerProfile
            ?.trainerName ||
            user?.displayName ||
            "trainer"
        )}.png`;

      link.href = dataUrl;

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      showToast({
        title:
          "Trainer Card downloaded",
        message:
          "Your square collector card is ready.",
        type: "success",
      });
    } catch (error) {
      console.error(
        "Trainer Card export failed:",
        error
      );

      showToast({
        title:
          "Download failed",
        message:
          error.message ||
          "Trainer Card could not be exported.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <div className="trainer-card-download-row">
        <button
          type="button"
          className="trainer-card-download-button"
          onClick={
            handleDownload
          }
          disabled={
            downloading
          }
        >
          {downloading
            ? "Preparing PNG..."
            : "⬇ Download Trainer Card"}
        </button>

        <p>
          Export a fixed 1080×1080
          collector card.
        </p>
      </div>

      <div
        className="trainer-export-stage"
        aria-hidden="true"
      >
        <TrainerCardExport
          ref={exportRef}
          user={user}
          trainerProfile={
            trainerProfile
          }
          ownedPokemon={
            ownedPokemon
          }
        />
      </div>
    </>
  );
}

function safeFileName(value) {
  return String(
    value || "trainer"
  )
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    ) || "trainer";
}

async function waitForImages(
  element
) {
  const images =
    Array.from(
      element.querySelectorAll(
        "img"
      )
    );

  await Promise.all(
    images.map((image) => {
      if (
        image.complete &&
        image.naturalWidth > 0
      ) {
        return Promise.resolve();
      }

      return new Promise(
        (resolve) => {
          const finish = () =>
            resolve();

          image.addEventListener(
            "load",
            finish,
            {
              once: true,
            }
          );

          image.addEventListener(
            "error",
            finish,
            {
              once: true,
            }
          );

          window.setTimeout(
            finish,
            5000
          );
        }
      );
    })
  );

  if (
    document.fonts?.ready
  ) {
    await document.fonts.ready;
  }
}

function nextFrame() {
  return new Promise(
    (resolve) => {
      requestAnimationFrame(
        resolve
      );
    }
  );
}

export default TrainerCardDownloadButton;