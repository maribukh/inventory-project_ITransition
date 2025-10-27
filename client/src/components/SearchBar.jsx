import React, { useState, useRef, useEffect } from "react";
import { useGlobalSearch } from "../hooks/useSearch";
import { Link } from "react-router-dom";
import { useLanguage, translations } from "../hooks/useLanguage";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useGlobalSearch(query);
  const { language } = useLanguage();
  const t = translations[language];
  const searchRef = useRef(null);


  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length >= 2);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
  };

  const results = data?.results || [];

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={
            language === "en"
              ? "Search across all inventories..."
              : "Поиск по всем инвентарям..."
          }
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {t.loading}
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((item) => (
                <Link
                  key={`${item.inventoryId}-${item.id}`}
                  to={`/inventory/${item.inventoryId}`}
                  className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.customId || `Item #${item.id.slice(-4)}`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.inventoryName}
                      </div>
                      {item.searchText && (
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {item.searchText.length > 100
                            ? `${item.searchText.substring(0, 100)}...`
                            : item.searchText}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {language === "en" ? "No results found" : "Ничего не найдено"}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
