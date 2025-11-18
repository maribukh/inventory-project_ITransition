// --- Файл: /server/src/controllers/userController.js ---

import axios from "axios";
import pool from "../utils/db.js";

const SF_LOGIN_URL = process.env.SF_LOGIN_URL;
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const REDIRECT_URI = process.env.CLIENT_URL
  ? `${process.env.CLIENT_URL}/salesforce/callback`
  : "http://localhost:3000/salesforce/callback";

// НОВАЯ ФУНКЦИЯ для проверки статуса
async function getSalesforceStatus(req, res) {
  try {
    const { uid } = req.user;
    const result = await pool.query(
      "SELECT is_salesforce_connected FROM users WHERE uid = $1",
      [uid]
    );

    if (result.rows.length === 0) {
      return res.json({ isConnected: false });
    }

    res.json({ isConnected: result.rows[0].is_salesforce_connected || false });
  } catch (error) {
    console.error("Error getting Salesforce status:", error);
    res.status(500).json({ error: "Failed to get status" });
  }
}

async function handleSalesforceCallback(req, res) {
  try {
    const { code, codeVerifier } = req.body;
    const { email, uid } = req.user;

    if (!code || !codeVerifier) {
      return res
        .status(400)
        .json({ error: "Authorization code or verifier is missing." });
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("client_id", SF_CLIENT_ID);
    params.append("client_secret", SF_CLIENT_SECRET);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("code_verifier", codeVerifier);

    const tokenResponse = await axios.post(
      `${SF_LOGIN_URL}/services/oauth2/token`,
      params
    );

    const { access_token, instance_url } = tokenResponse.data;
    const headers = { Authorization: `Bearer ${access_token}` };

    const contactCheckQuery = `SELECT Id FROM Contact WHERE External_ID__c = '${uid}' LIMIT 1`;
    const contactQueryUrl = `${instance_url}/services/data/v59.0/query?q=${encodeURIComponent(
      contactCheckQuery
    )}`;
    const existingContactResponse = await axios.get(contactQueryUrl, {
      headers,
    });

    if (existingContactResponse.data.totalSize === 0) {
      const userInfoResponse = await axios.get(
        `${instance_url}/services/oauth2/userinfo`,
        { headers }
      );
      const sfUser = userInfoResponse.data;

      let accountId;
      const accountName =
        sfUser.name && sfUser.name.trim() !== ""
          ? `${sfUser.name}'s Organization`
          : `${email}'s Organization`;

      const accountSearchQuery = `SELECT Id FROM Account WHERE Name = '${accountName}' LIMIT 1`;
      const accountSearchUrl = `${instance_url}/services/data/v59.0/query?q=${encodeURIComponent(
        accountSearchQuery
      )}`;
      const existingAccountResponse = await axios.get(accountSearchUrl, {
        headers,
      });

      if (existingAccountResponse.data.totalSize > 0) {
        accountId = existingAccountResponse.data.records[0].Id;
      } else {
        const accountResponse = await axios.post(
          `${instance_url}/services/data/v59.0/sobjects/Account`,
          { Name: accountName },
          { headers }
        );
        accountId = accountResponse.data.id;
      }

      if (!accountId) {
        throw new Error(
          "Не удалось получить или создать Account в Salesforce."
        );
      }

      await axios.post(
        `${instance_url}/services/data/v59.0/sobjects/Contact`,
        {
          LastName: sfUser.family_name || email.split("@")[0],
          FirstName: sfUser.given_name || "User",
          Email: email,
          AccountId: accountId,
          External_ID__c: uid,
        },
        { headers }
      );
    }

    // ОБНОВЛЯЕМ СТАТУС В НАШЕЙ БД
    await pool.query(
      "UPDATE users SET is_salesforce_connected = TRUE WHERE uid = $1",
      [uid]
    );

    return res.status(200).json({
      success: true,
      message: "Аккаунт Salesforce успешно подключен!",
    });
  } catch (error) {
    const errorMessage =
      error.response?.data?.[0]?.message ||
      error.response?.data?.error_description ||
      error.message ||
      "Failed to process Salesforce callback.";

    console.error(
      "❌ Salesforce Callback Error:",
      errorMessage,
      error.response?.data || error
    );

    return res.status(500).json({ error: errorMessage });
  }
}

export { handleSalesforceCallback, getSalesforceStatus };
