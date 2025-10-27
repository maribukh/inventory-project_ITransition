import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}


export const translations = {
  en: {
    // Navbar
    signIn: "Sign in",
    getStarted: "Get started",
    signOut: "Sign out",
    manage: "Manage",

    // Login
    signInToAccount: "Sign in to your account",
    createNewAccount: "create a new account",
    continueWithGoogle: "Continue with Google",
    orContinueWithEmail: "Or continue with email",
    emailAddress: "Email address",
    password: "Password",
    signingIn: "Signing in...",
    welcomeBack: "Welcome back!",
    dontHaveAccount: "Don't have an account?",

    // Register
    joinInventoro: "Join Inventoro",
    alreadyHaveAccount: "Already have an account?",
    signInHere: "Sign in here",
    orSignUpWithEmail: "Or sign up with email",
    confirmPassword: "Confirm Password",
    creatingAccount: "Creating account...",
    createAccount: "Create Account",
    byCreatingAccount: "By creating an account, you agree to our",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",

    // Dashboard
    myInventories: "My Inventories",
    newInventory: "New Inventory",
    cancel: "Cancel",
    createNewInventory: "Create New Inventory",
    inventoryName: "Inventory Name",
    description: "Description",
    addCustomFields: "Add Custom Fields",
    fieldConfiguration: "Field Configuration",
    dragToReorder: "Drag to reorder",
    createInventory: "Create Inventory",
    creating: "Creating...",
    yourInventories: "Your Inventories",
    noInventories: "No inventories yet",
    createFirstInventory: "Create your first inventory to get started",
    fields: "fields",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    required: "is required",
    invalidEmail: "Email is invalid",
  },
  ru: {
    // Navbar
    signIn: "Войти",
    getStarted: "Начать",
    signOut: "Выйти",
    manage: "Управлять",

    // Login
    signInToAccount: "Войдите в свой аккаунт",
    createNewAccount: "создать новый аккаунт",
    continueWithGoogle: "Продолжить с Google",
    orContinueWithEmail: "Или войти с email",
    emailAddress: "Email адрес",
    password: "Пароль",
    signingIn: "Вход...",
    welcomeBack: "С возвращением!",
    dontHaveAccount: "Нет аккаунта?",

    // Register
    joinInventoro: "Присоединяйтесь к Inventoro",
    alreadyHaveAccount: "Уже есть аккаунт?",
    signInHere: "Войдите здесь",
    orSignUpWithEmail: "Или зарегистрируйтесь с email",
    confirmPassword: "Подтвердите пароль",
    creatingAccount: "Создание аккаунта...",
    createAccount: "Создать аккаунт",
    byCreatingAccount: "Создавая аккаунт, вы соглашаетесь с нашими",
    termsOfService: "Условиями обслуживания",
    and: "и",
    privacyPolicy: "Политикой конфиденциальности",

    // Dashboard
    myInventories: "Мои инвентари",
    newInventory: "Новый инвентарь",
    cancel: "Отмена",
    createNewInventory: "Создать новый инвентарь",
    inventoryName: "Название инвентаря",
    description: "Описание",
    addCustomFields: "Добавить поля",
    fieldConfiguration: "Настройка полей",
    dragToReorder: "Перетащите для изменения порядка",
    createInventory: "Создать инвентарь",
    creating: "Создание...",
    yourInventories: "Ваши инвентари",
    noInventories: "Инвентарей пока нет",
    createFirstInventory: "Создайте первый инвентарь чтобы начать",
    fields: "поля",

    // Common
    loading: "Загрузка...",
    error: "Ошибка",
    success: "Успех",
    required: "обязателен",
    invalidEmail: "Неверный email",
  },
};
