import { useEffect, useState } from "react";
import { auth } from "../utils/firebase.client";
import { onAuthStateChanged } from "firebase/auth";
import { createUserRecordAPI } from "../utils/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        try {
          const res = await createUserRecordAPI();
          if (res.isAdmin) {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error("❌ Failed to create user record:", error);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, isAdmin, loading };
}
