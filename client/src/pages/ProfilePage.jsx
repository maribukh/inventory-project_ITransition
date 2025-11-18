import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  CloudArrowUpIcon,
  EnvelopeIcon,
  KeyIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { getSalesforceStatus } from "../utils/api";
import toast from "react-hot-toast";

const generateRandomString = (length) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getSalesforceStatus()
        .then((data) => {
          setIsConnected(data.isConnected);
        })
        .catch((err) => {
          console.error("Failed to fetch Salesforce status:", err);
          setIsConnected(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user]);

  const handleSalesforceConnect = async () => {
    try {
      const codeVerifier = generateRandomString(128);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      localStorage.setItem("salesforce_code_verifier", codeVerifier);

      const SALESFORCE_CLIENT_ID = import.meta.env.VITE_SALESFORCE_CLIENT_ID;
      const REDIRECT_URI = `${
        import.meta.env.VITE_CLIENT_URL
      }/salesforce/callback`;

      if (!SALESFORCE_CLIENT_ID) {
        toast.error(
          "Salesforce Client ID не найден в переменных окружения клиента."
        );
        return;
      }

      const authUrl = `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${SALESFORCE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to initiate Salesforce connection:", error);
      toast.error("Не удалось начать подключение к Salesforce. См. консоль.");
    }
  };

  if (!user || isLoading) {
    return (
      <div className="text-center p-12">
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="flex-shrink-0 h-24 w-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg text-white text-4xl font-bold">
          {user.email[0].toUpperCase()}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Профиль пользователя
          </h1>
          <div className="mt-2 space-y-1">
            <p className="flex items-center text-gray-600 dark:text-gray-400">
              <EnvelopeIcon className="h-4 w-4 mr-2" /> {user.email}
            </p>
            <p className="flex items-center text-gray-500 dark:text-gray-500 text-xs font-mono">
              <KeyIcon className="h-4 w-4 mr-2" /> {user.uid}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Интеграции
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Подключите ваш аккаунт к внешним сервисам, таким как Salesforce CRM.
        </p>
        <div className="mt-4">
          {isConnected ? (
            <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg shadow-md">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Salesforce подключен
            </div>
          ) : (
            <button
              onClick={handleSalesforceConnect}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-sky-600 transition-all transform hover:scale-105"
            >
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Подключить к Salesforce
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
