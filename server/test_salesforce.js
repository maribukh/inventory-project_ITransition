// test_salesforce.js
import axios from "axios";
import dotenv from "dotenv";

// Загружаем переменные из .env файла
dotenv.config();

// Читаем переменные, как это делает ваш основной код
const SF_LOGIN_URL = process.env.SF_LOGIN_URL;
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_USERNAME = process.env.SF_USERNAME;
const SF_PASSWORD = process.env.SF_PASSWORD;

async function testSalesforceAuth() {
  console.log("--- Начинаем тест подключения к Salesforce ---");
  console.log("Используем логин:", SF_USERNAME);

  if (!SF_CLIENT_ID || !SF_CLIENT_SECRET || !SF_USERNAME || !SF_PASSWORD) {
    console.error(
      "\n❌ ОШИБКА: Одна или несколько переменных (SF_CLIENT_ID, SF_CLIENT_SECRET, SF_USERNAME, SF_PASSWORD) не найдены в .env файле. Проверьте файл."
    );
    return;
  }

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

    console.log("\n✅ УСПЕХ! Учетные данные верны!");
    console.log(
      "Получен access_token:",
      response.data.access_token.substring(0, 15) + "..."
    );
    console.log("Теперь можно запускать основной сервер, все должно работать.");
  } catch (error) {
    console.error("\n❌ ПРОВАЛ! Salesforce отклонил учетные данные.");
    console.error(
      "Причина (ответ от Salesforce):",
      error.response?.data || error.message
    );
    console.error("\nЧто делать:");
    console.error(
      "1. Перепроверьте еще раз SF_PASSWORD в .env файле. Убедитесь, что пароль и САМЫЙ ПОСЛЕДНИЙ токен склеены правильно."
    );
    console.error("2. Убедитесь, что SF_USERNAME указан без опечаток.");
    console.error(
      "3. Если не уверены в токене, сбросьте его в Salesforce еще раз и обновите .env файл."
    );
  }
}

testSalesforceAuth();
