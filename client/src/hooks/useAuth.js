import { useEffect, useState } from "react";
import { auth } from "../utils/firebase.client";
import { onAuthStateChanged } from "firebase/auth";
import { createUserRecordAPI } from "../utils/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        try {
          console.log("🔄 Creating user record for:", user.email);
          await createUserRecordAPI();
          console.log("✅ User record created/verified");
        } catch (error) {
          console.error("❌ Failed to create user record:", error);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
