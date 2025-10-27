// [file name]: server/middlewares/authMiddleware.js
import { admin } from "../admin.config.js";

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer (.+)$/);

  if (!match) {
    return res.status(401).json({ error: "No token provided" });
  }

  const idToken = match[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
    };
    next();
  } catch (err) {
    console.error("Token verify error", err);
    res.status(401).json({ error: "Invalid token" });
  }
}

export default authMiddleware;
