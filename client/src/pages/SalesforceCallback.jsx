import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { completeSalesforceSync } from "../utils/api";
import toast from "react-hot-toast";

export default function SalesforceCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false); 

  useEffect(() => {
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;

    const code = searchParams.get("code");
    const codeVerifier = localStorage.getItem("salesforce_code_verifier");

    localStorage.removeItem("salesforce_code_verifier");

    if (code && codeVerifier) {
      toast.loading("Finalizing Salesforce connection...");
      completeSalesforceSync(code, codeVerifier)
        .then((response) => {
          toast.dismiss();
          toast.success(response.message || "Successfully connected!");
          navigate("/profile", { replace: true });
        })
        .catch((err) => {
          toast.dismiss();
          toast.error(err.message || "Connection failed.");
          navigate("/profile", { replace: true });
        });
    } else {
      const error = searchParams.get("error_description");
      toast.error(
        error ||
          "Salesforce authentication failed. Code or verifier was missing on callback."
      );
      navigate("/profile", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="text-center p-12">
      <h1 className="text-xl font-semibold">Connecting to Salesforce...</h1>
      <p className="text-gray-500">
        Please wait, you will be redirected shortly.
      </p>
    </div>
  );
}
