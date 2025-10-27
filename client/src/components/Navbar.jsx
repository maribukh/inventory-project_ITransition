import React, { Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase.client";
import { signOut } from "firebase/auth";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useLanguage, translations } from "../hooks/useLanguage";
import { useAdmin } from "../hooks/useAdmin"; 
import { Menu, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import {
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  CogIcon, 
} from "@heroicons/react/20/solid";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  async function onLogout() {
    try {
      await signOut(auth);
      toast.success(
        language === "en" ? "Signed out successfully" : "Вы успешно вышли"
      );
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(t.error);
    }
  }

  if (authLoading) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-sm h-16 transition-colors"></nav>
    );
  }

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm transition-colors border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              Inventoro
            </Link>
          </div>

          <div className="flex-1 max-w-2xl mx-8">{user && <SearchBar />}</div>

          <div className="flex items-center space-x-3">
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <GlobeAltIcon className="h-4 w-4" />
                <span className="text-sm font-medium uppercase">
                  {language}
                </span>
                <ChevronDownIcon className="h-3 w-3" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-20 mt-2 w-32 origin-top-right rounded-md bg-white dark:bg-gray-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-600">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => toggleLanguage("en")}
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-600" : ""
                        } w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-between ${
                          language === "en"
                            ? "text-indigo-600 dark:text-indigo-400 font-medium"
                            : ""
                        }`}
                      >
                        English
                        {language === "en" && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        )}
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => toggleLanguage("ru")}
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-600" : ""
                        } w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-between ${
                          language === "ru"
                            ? "text-indigo-600 dark:text-indigo-400 font-medium"
                            : ""
                        }`}
                      >
                        Русский
                        {language === "ru" && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        )}
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </button>

            {user ? (
              <Menu as="div" className="relative">
                <div>
                  <Menu.Button className="flex items-center text-sm rounded-full text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                    <span className="sr-only">Open user menu</span>
                    <span className="truncate max-w-32">{user.email}</span>
                    <ChevronDownIcon
                      className="ml-1 h-4 w-4"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white/95 dark:bg-gray-700/95 backdrop-blur-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-600">
                    {!adminLoading && isAdmin && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/admin"
                            className={`${
                              active ? "bg-gray-100 dark:bg-gray-600" : ""
                            } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors`}
                          >
                            <CogIcon className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onLogout}
                          className={`${
                            active ? "bg-gray-100 dark:bg-gray-600" : ""
                          } w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors`}
                        >
                          <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4" />
                          {t.signOut}
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t.signIn}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-sm"
                >
                  {t.getStarted}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
