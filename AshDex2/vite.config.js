import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      /*
       * Manifest dosyan zaten public klasöründe.
       * Eklentinin ikinci bir manifest üretmesini kapatıyoruz.
       */
      manifest: false,

      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "favicon-32.png",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "icon-1024.png",
        "logo-icon.svg",
        "logo.png",
        "logo-dark.png",
      ],

      workbox: {
        cleanupOutdatedCaches: true,

        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,woff,woff2}",
        ],

        navigateFallback: "/index.html",

        runtimeCaching: [
          {
            /*
             * Cloudinary profil fotoğrafları.
             */
            urlPattern:
              /^https:\/\/res\.cloudinary\.com\/.*/i,

            handler: "CacheFirst",

            options: {
              cacheName:
                "ashdex-cloudinary-images",

              expiration: {
                maxEntries: 80,
                maxAgeSeconds:
                  60 * 60 * 24 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          {
            /*
             * Diğer uzaktaki Pokémon görselleri.
             */
            urlPattern: ({
              request,
              url,
            }) =>
              request.destination ===
                "image" &&
              url.origin !==
                self.location.origin,

            handler: "StaleWhileRevalidate",

            options: {
              cacheName:
                "ashdex-external-images",

              expiration: {
                maxEntries: 250,
                maxAgeSeconds:
                  60 * 60 * 24 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      /*
       * Service worker'ı development sırasında
       * açmıyoruz. Gerçek testi preview/build ile
       * yapacağız.
       */
      devOptions: {
        enabled: false,
      },
    }),
  ],
});