import { useState, useEffect } from "react";
import { auth } from "../utils/firebase.client";
import { getAdminUsers } from "../utils/api";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const user = auth.currentUser;
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const data = await getAdminUsers();

        const currentUser = data.users?.find((u) => u.uid === user.uid);
        setIsAdmin(currentUser?.isAdmin || false);
      } catch (error) {
        console.error("Admin check error:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, []);

  return { isAdmin, loading };
}
