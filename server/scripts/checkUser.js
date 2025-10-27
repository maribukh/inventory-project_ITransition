const { admin } = require("../admin.config");

async function checkUser(userUid) {
  try {
    console.log("🔍 Проверяем пользователя...");

    const authUser = await admin.auth().getUser(userUid);
    console.log("✅ Пользователь найден в Authentication:");
    console.log(`   Email: ${authUser.email}`);
    console.log(`   UID: ${authUser.uid}`);

    const firestoreUser = await admin
      .firestore()
      .collection("users")
      .doc(userUid)
      .get();

    if (firestoreUser.exists) {
      console.log("✅ Пользователь найден в Firestore:");
      console.log("   Данные:", firestoreUser.data());
    } else {
      console.log("❌ Пользователь НЕ найден в Firestore коллекции users");
    }
  } catch (error) {
    console.error("Ошибка проверки:", error);
  }
}

checkUser("xoOAVu44AlOwJYU4wDTQ53K3ZTk1");
