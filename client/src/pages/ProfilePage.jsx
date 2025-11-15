import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { syncSalesforce } from "../utils/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName) {
      toast.error("Company name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await syncSalesforce({ companyName, phone });
      toast.success(result.message || "Successfully synced with Salesforce!");
      setIsModalOpen(false);
      setCompanyName("");
      setPhone("");
    } catch (error) {
      toast.error(error.message || "Failed to sync with Salesforce.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Profile
        </h1>
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>UID:</strong> {user.uid}
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-sky-600 transition-all"
          >
            Sync with CRM
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center">
          <div className="relative w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Sync with Salesforce
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Company Name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number (Optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {t.cancel || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
