import admin from "firebase-admin";
import { serviceAccount } from "./config/firebaseServiceAccount.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin };
