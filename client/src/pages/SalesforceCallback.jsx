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
    const formDataString = localStorage.getItem("salesforce_form_data");
    const formData = formDataString ? JSON.parse(formDataString) : {};

    localStorage.removeItem("salesforce_code_verifier");
    localStorage.removeItem("salesforce_form_data");

    if (code && codeVerifier) {
      toast.loading("Завершаем подключение к Salesforce...");
      completeSalesforceSync(code, codeVerifier, formData)
        .then((response) => {
          toast.dismiss();
          toast.success(response.message || "Успешно подключено!");
          navigate("/profile", { replace: true });
        })
        .catch((err) => {
          toast.dismiss();
          toast.error(err.error || "Ошибка подключения.");
          navigate("/profile", { replace: true });
        });
    } else {
      const error = searchParams.get("error_description");
      toast.error(
        error ||
          "Аутентификация Salesforce не удалась. Отсутствует код или верификатор."
      );
      navigate("/profile", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="text-center p-12">
      <h1 className="text-xl font-semibold">Подключение к Salesforce...</h1>
      <p className="text-gray-500">
        Пожалуйста, подождите, вы будете перенаправлены.
      </p>
    </div>
  );
}
