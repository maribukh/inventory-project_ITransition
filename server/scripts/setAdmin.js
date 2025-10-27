// [file name]: scripts/setAdmin.js
// Admin setup script for ES modules

import { admin } from "../admin.config.js";

async function setUserAsAdmin(userUid) {
  try {
    // Получаем информацию о пользователе
    const user = await admin.auth().getUser(userUid);

    console.log("👤 Найден пользователь:");
    console.log(`   Email: ${user.email}`);
    console.log(`   UID: ${user.uid}`);

    // Создаем/обновляем запись в Firestore с правами админа
    await admin.firestore().collection("users").doc(userUid).set(
      {
        email: user.email,
        isAdmin: true,
        isBlocked: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log("✅ Пользователь успешно назначен администратором!");
    console.log(
      "🎉 Теперь он может зайти в админ-панель через меню пользователя"
    );
  } catch (error) {
    console.error("❌ Ошибка назначения админа:", error);

    if (error.code === "auth/user-not-found") {
      console.log(
        "⚠️  Пользователь с таким UID не найден в Firebase Authentication"
      );
    } else if (error.code === 5) {
      console.log(
        "⚠️  Ошибка доступа к Firestore. Проверьте настройки Firebase Admin SDK"
      );
    }
  }
}

// Запуск: node scripts/setAdmin.js xoOAVu44AlOwJYU4wDTQ53K3ZTk1
const userUid = process.argv[2];
if (userUid) {
  setUserAsAdmin(userUid);
} else {
  console.log("❌ Укажите UID пользователя: node setAdmin.js USER_UID");
  console.log("   Пример: node setAdmin.js xoOAVu44AlOwJYU4wDTQ53K3ZTk1");
}
