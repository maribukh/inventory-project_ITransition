// [file name]: scripts/createUserRecord.js
// Script to manually create a user record

import { admin } from "../admin.config.js";

async function createUserRecordManually(userUid, userEmail) {
  try {
    console.log("📝 Creating user record manually for:", {
      userUid,
      userEmail,
    });

    const authUser = await admin.auth().getUser(userUid);
    console.log("✅ User found in Firebase Auth:", authUser.email);

    const existingUser = await admin
      .firestore()
      .collection("users")
      .doc(userUid)
      .get();

    if (existingUser.exists) {
      console.log("ℹ️ User record already exists:", existingUser.data());
      return;
    }

    const usersSnapshot = await admin.firestore().collection("users").get();
    const isFirstUser = usersSnapshot.empty;
    const isAdmin = isFirstUser;

    console.log("👑 Admin status:", { isFirstUser, isAdmin });

    await admin.firestore().collection("users").doc(userUid).set({
      email: userEmail,
      isAdmin: isAdmin,
      isBlocked: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ User record created successfully!");
    console.log("🎉 User is admin:", isAdmin);
  } catch (error) {
    console.error("❌ Error creating user record:", error);
  }
}

const userUid = process.argv[2];
const userEmail = process.argv[3];

if (userUid && userEmail) {
  createUserRecordManually(userUid, userEmail);
} else {
  console.log("❌ Usage: node createUserRecord.js USER_UID USER_EMAIL");
  console.log(
    "   Example: node createUserRecord.js xoOAVu44AlOwJYU4wDTQ53K3ZTk1 user@example.com"
  );
}
