import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase/firebase";
import { saveUserProfile } from "../firebase/userservice";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        // Önce uygulamanın açılmasına izin ver.
        setUser(currentUser);
        setAuthLoading(false);
        setAuthError("");

        // Profil kaydını arka planda yap.
        if (currentUser) {
          saveUserProfile(currentUser).catch((error) => {
            console.error(
              "User profile could not be saved:",
              error
            );

            setAuthError(error.message);
          });
        }
      },
      (error) => {
        console.error(
          "Authentication listener failed:",
          error
        );

        setAuthError(error.message);
        setAuthLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return {
    user,
    authLoading,
    authError,
  };
}