import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Registrazione del service worker: usiamo import.meta.env.BASE_URL per
// costruire correttamente il percorso anche quando l'app è pubblicata
// sotto https://utente.github.io/nome-repository/.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {
      // Se la registrazione fallisce (es. http non sicuro in sviluppo),
      // l'app continua a funzionare normalmente, solo senza offline.
    });
  });
}
