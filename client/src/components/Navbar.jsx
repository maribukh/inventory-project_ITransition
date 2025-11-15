import React, { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase.client";
import { signOut } from "firebase/auth";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useLanguage, translations } from "../hooks/useLanguage";
import { Menu, Transition, Dialog } from "@headlessui/react";
import toast from "react-hot-toast";
import {
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import SearchBar from "./SearchBar";

const GeneralActions = ({ language, toggleLanguage, theme, toggleTheme }) => (
  <div className="flex items-center space-x-3">
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
        <GlobeAltIcon className="h-5 w-5" />
        <span className="text-sm font-medium uppercase hidden sm:inline">
          {language}
        </span>
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
                    ? "font-medium text-indigo-600 dark:text-indigo-400"
                    : ""
                }`}
              >
                English{" "}
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
                    ? "font-medium text-indigo-600 dark:text-indigo-400"
                    : ""
                }`}
              >
                Русский{" "}
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
  </div>
);

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  return (
    <>
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm transition-colors border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
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
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              {user && <SearchBar />}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <GeneralActions
                language={language}
                toggleLanguage={toggleLanguage}
                theme={theme}
                toggleTheme={toggleTheme}
              />
              {user ? (
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center text-sm rounded-full text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50">
                    <span className="truncate max-w-32">{user.email}</span>
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
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
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white/95 dark:bg-gray-700/95 backdrop-blur-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-600">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? "bg-gray-100 dark:bg-gray-600" : ""
                            } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors`}
                          >
                            <UserCircleIcon className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      {isAdmin && (
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
                <div className="flex items-center space-x-2">
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

            <div className="md:hidden flex items-center space-x-2">
              {user && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        onLogout={onLogout}
        GeneralActions={() => (
          <GeneralActions
            language={language}
            toggleLanguage={toggleLanguage}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        )}
      />
      <SearchModal isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
    </>
  );
}

function SearchModal({ isOpen, setIsOpen }) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-4 text-left align-middle shadow-xl transition-all">
                <SearchBar onResultClick={() => setIsOpen(false)} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function MobileMenu({ isOpen, setIsOpen, onLogout, GeneralActions }) {
  const { user, isAdmin } = useAuth();
  const t = useLanguage().t;
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 md:hidden" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-gray-800 p-6 shadow-xl border-l border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium text-gray-900 dark:text-white"
                >
                  Menu
                </Dialog.Title>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="space-y-2 py-6">
                    <GeneralActions />
                  </div>
                  <div className="py-6 space-y-2">
                    {user ? (
                      <>
                        <div className="px-2 py-2 text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                          {user.email}
                        </div>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 tex"
                          >
                            <CogIcon className="mr-3 h-5 w-5" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={onLogout}
                          className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
                          {t.signOut}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsOpen(false)}
                          className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {t.signIn}
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsOpen(false)}
                          className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md hover:from-indigo-700 hover:to-purple-700 shadow-sm"
                        >
                          {t.getStarted}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
