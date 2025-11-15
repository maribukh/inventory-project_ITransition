import axios from "axios";


const SF_LOGIN_URL = "https://your-domain.my.salesforce.com"; 
const SF_CLIENT_ID = "YOUR_SALESFORCE_CONSUMER_KEY";
const SF_CLIENT_SECRET = "YOUR_SALESFORCE_CONSUMER_SECRET";
const SF_USERNAME = "your-salesforce-dev-username@example.com";
const SF_PASSWORD = "your-salesforce-dev-password-and-token";

async function getSalesforceToken() {

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", SF_CLIENT_ID);
    params.append("client_secret", SF_CLIENT_SECRET);
    params.append("username", SF_USERNAME);
    params.append("password", SF_PASSWORD);

    const response = await axios.post(
      `${SF_LOGIN_URL}/services/oauth2/token`,
      params
    );
    return response.data;
  } catch (error) {
    console.error(
      "Salesforce Auth Error:",
      error.response?.data || error.message
    );
    throw new Error("Could not authenticate with Salesforce.");
  }
}

async function syncWithSalesforce(req, res) {
  try {
    const { email, uid } = req.user;
    const { companyName, phone } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: "Company name is required." });
    }

    const { access_token, instance_url } = await getSalesforceToken();
    const headers = { Authorization: `Bearer ${access_token}` };

    const accountResponse = await axios.post(
      `${instance_url}/services/data/v59.0/sobjects/Account`,
      { Name: companyName },
      { headers }
    );
    const accountId = accountResponse.data.id;

    const lastName = email.split("@")[0] || "Unknown";

    await axios.post(
      `${instance_url}/services/data/v59.0/sobjects/Contact`,
      {
        LastName: lastName,
        Email: email,
        Phone: phone,
        AccountId: accountId,
        External_ID__c: uid, 
      },
      { headers }
    );

    res
      .status(201)
      .json({
        success: true,
        message: "Account and Contact created in Salesforce.",
      });
  } catch (error) {
    console.error(
      "❌ Salesforce Sync Error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to sync data with Salesforce." });
  }
}

export { syncWithSalesforce };
