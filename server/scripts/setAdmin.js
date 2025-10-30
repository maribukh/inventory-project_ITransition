import pool from "../utils/db.js";
import { admin } from "../admin.config.js";

async function setUserAsAdmin(userUid) {
  try {
    const user = await admin.auth().getUser(userUid);
    console.log("👤 User found in Firebase Auth:");
    console.log(`   Email: ${user.email}`);
    console.log(`   UID: ${user.uid}`);

    const checkResult = await pool.query("SELECT * FROM users WHERE uid = $1", [
      userUid,
    ]);

    if (checkResult.rows.length === 0) {
      console.log(
        "❌ Error: User EXISTS in Firebase, but NOT in our PostgreSQL database."
      );
      console.log(
        "   Solution: Ask the user to log in to the application at least once."
      );
      return;
    }

    await pool.query("UPDATE users SET is_admin = true WHERE uid = $1", [
      userUid,
    ]);

    console.log("✅ User successfully set as administrator in PostgreSQL!");
    console.log(
      "🎉 Now they can access the admin panel (after token refresh/re-login)."
    );
  } catch (error) {
    console.error("❌ Error setting admin:", error);
    if (error.code === "auth/user-not-found") {
      console.log(
        "⚠️   User with this UID not found in Firebase Authentication"
      );
    }
  } finally {
    await pool.end();
  }
}

const userUid = process.argv[2];
if (userUid) {
  setUserAsAdmin(userUid);
} else {
  console.log("❌ Provide the user UID: node setAdmin.js USER_UID");
  console.log("   Example: node setAdmin.js xoOAVu44AlOwJYU4wDTQ53K3ZTk1");
}
