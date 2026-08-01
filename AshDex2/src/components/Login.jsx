import { useState } from "react";
import { signInWithPopup } from "firebase/auth";

import {
  auth,
  googleProvider,
} from "../firebase/firebase";

function Login() {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleGoogleLogin() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithPopup(
        auth,
        googleProvider
      );
    } catch (loginError) {
      console.error(
        "Google login failed:",
        loginError
      );

      setError(
        loginError.message ||
          "Google login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <img
          src="/logo.svg"
          alt="AshDex"
          className="login-brand-logo"
        />

        <p className="login-eyebrow">
          ASH&apos;S POKÉMON JOURNEY
        </p>

        <h1 className="login-title">
          Welcome, Trainer
        </h1>

        <p className="login-description">
          Track your Ash Pokémon collection,
          unlock achievements and compare your
          journey with friends.
        </p>

        <button
          type="button"
          className="login-button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading
            ? "Connecting..."
            : "Continue with Google"}
        </button>

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}

export default Login;