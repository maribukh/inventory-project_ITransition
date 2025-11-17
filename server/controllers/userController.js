import axios from "axios";

const SF_LOGIN_URL = process.env.SF_LOGIN_URL;
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const REDIRECT_URI = process.env.CLIENT_URL
  ? `${process.env.CLIENT_URL}/salesforce/callback`
  : "http://localhost:3000/salesforce/callback";
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

    const soqlQuery = `SELECT Id FROM Contact WHERE External_ID__c = '${uid}' LIMIT 1`;
    const queryUrl = `${instance_url}/services/data/v59.0/query?q=${encodeURIComponent(
      soqlQuery
    )}`;

    const existingContactResponse = await axios.get(queryUrl, { headers });

    if (existingContactResponse.data.totalSize > 0) {
      console.log(
        `Contact for user ${uid} already exists in Salesforce. Skipping creation.`
      );
      return res.status(200).json({
        success: true,
        message: "Salesforce account was already connected.",
      });
    }

    console.log(
      `Contact for user ${uid} not found. Creating new records in Salesforce.`
    );

    const userInfoResponse = await axios.get(
      `${instance_url}/services/oauth2/userinfo`,
      { headers }
    );
    const sfUser = userInfoResponse.data;

    const accountResponse = await axios.post(
      `${instance_url}/services/data/v59.0/sobjects/Account`,
      { Name: sfUser.organization_id || `${email}'s Organization` },
      { headers }
    );
    const accountId = accountResponse.data.id;

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

    return res.status(200).json({
      success: true,
      message: "Salesforce account connected successfully!",
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

export { handleSalesforceCallback };
