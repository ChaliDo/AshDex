import "./App.css";

import Login from "./components/Login";
import TrainerCard from "./components/TrainerCard";

import { useAuth } from "./hooks/useAuth";

import {
  useLanguage,
} from "./context/LanguageContext";

function App() {
  const {
    user,
    authLoading,
    authError,
  } = useAuth();

  const {
    language,
  } = useLanguage();

  const isTurkish =
    language === "tr";

  if (authLoading) {
    return (
      <main className="app-status-page">
        <section className="app-status-card">
          <div className="app-status-logo">
            ⚡
          </div>

          <h1>AshDex 2.0</h1>

          <p>
            {isTurkish
              ? "Pokémon Depolama Sistemine bağlanılıyor..."
              : "Connecting to the Pokémon Storage System..."}
          </p>
        </section>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="app-status-page">
        <section className="app-status-card app-error-card">
          <h1>
            {isTurkish
              ? "Bağlantı başarısız"
              : "Connection failed"}
          </h1>

          <p>{authError}</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <TrainerCard
      user={user}
    />
  );
}

export default App;