import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  CloudArrowUpIcon,
  EnvelopeIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import SalesforceConnectModal from "../components/SalesforceConnectModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSalesforceConnect = async (formData) => {
    try {
      localStorage.setItem("salesforce_form_data", JSON.stringify(formData));

      const codeVerifier = generateRandomString(128);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      localStorage.setItem("salesforce_code_verifier", codeVerifier);

      const SALESFORCE_CLIENT_ID =
        "3MVG9dAEux2v1sLsC3_r8mis.ioHYWnO8668jsbOPHXAFjSe.9sUGh5E.m0UQWQEOeWSUIuMpVPw6f3kSddtB";
      const REDIRECT_URI = process.env.CLIENT_URL
        ? `${process.env.CLIENT_URL}/salesforce/callback`
        : "http://localhost:3000/salesforce/callback";
      const authUrl = `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${SALESFORCE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to initiate Salesforce connection:", error);
      alert("Could not start Salesforce connection. See console for details.");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex-shrink-0 h-24 w-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg text-white text-4xl font-bold">
            {user.email[0].toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Profile
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
            Integrations
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Connect your account with external services like Salesforce CRM.
          </p>
          <div className="mt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-sky-600 transition-all transform hover:scale-105"
            >
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Connect to Salesforce
            </button>
          </div>
        </div>
      </div>

      <SalesforceConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleSalesforceConnect}
      />
    </>
  );
}
