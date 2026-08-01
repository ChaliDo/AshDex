import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

import "./index.css";
import "./App.css";

import {
  ToastProvider,
} from "./context/ToastContext.jsx";

import {
  LanguageProvider,
} from "./context/LanguageContext.jsx";

const rootElement =
  document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Root element bulunamadı. index.html içinde <div id="root"></div> olmalı.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <LanguageProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </LanguageProvider>
  </StrictMode>
);