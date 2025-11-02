import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage, translations } from "../hooks/useLanguage";
import {
  getAdminUsers,
  updateAdminUser,
  getAdminInventories,
} from "../utils/api";
import toast from "react-hot-toast";

const UsersIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

const ActiveUsersIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AdminIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const InventoryIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const BlockedIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export default function AdminPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: getAdminUsers,
  });

  // -------------------------------------------------------------------------------------
  // ИСПРАВЛЕНИЕ №2: Используем 'getAdminInventories'
  // -------------------------------------------------------------------------------------
  const { data: inventoriesData, isLoading: inventoriesLoading } = useQuery({
    queryKey: ["adminInventories"],
    queryFn: getAdminInventories,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ uid, data }) => updateAdminUser(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success(
        language === "en"
          ? "User updated successfully"
          : "Пользователь обновлен"
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleToggleAdmin = (user) => {
    updateUserMutation.mutate({
      uid: user.uid,
      data: { isAdmin: !user.is_admin }, // исправил 'isAdmin' на 'is_admin'
    });
  };

  const handleToggleBlock = (user) => {
    updateUserMutation.mutate({
      uid: user.uid,
      data: { isBlocked: !user.is_blocked }, // исправил 'isBlocked' на 'is_blocked'
    });
  };

  const getStats = () => {
    const users = usersData?.users || [];
    // -------------------------------------------------------------------------------------
    // ИСПРАВЛЕНИЕ №3: Достаем массив из 'inventoriesData.inventories'
    // -------------------------------------------------------------------------------------
    const inventories = inventoriesData?.inventories || [];

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => !u.is_blocked).length,
      blockedUsers: users.filter((u) => u.is_blocked).length,
      adminUsers: users.filter((u) => u.is_admin).length,
      totalInventories: inventories.length,
      publicInventories: inventories.filter((inv) => inv.is_public).length,
    };
  };

  const stats = getStats();

  if (usersLoading) return <div className="p-8">{t.loading}</div>;
  if (usersError)
    return <div className="p-8 text-red-500">Error: {usersError.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {language === "en"
                ? "Administration Panel"
                : "Панель администратора"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {language === "en" ? "System Management" : "Управление системой"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={language === "en" ? "Total Users" : "Всего пользователей"}
          value={stats.totalUsers}
          icon={<UsersIcon />}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title={language === "en" ? "Active Users" : "Активных пользователей"}
          value={stats.activeUsers}
          icon={<ActiveUsersIcon />}
          color="green"
          trend="+8%"
        />
        <StatCard
          title={language === "en" ? "Admin Users" : "Администраторов"}
          value={stats.adminUsers}
          icon={<AdminIcon />}
          color="purple"
          trend="+2"
        />
        <StatCard
          title={language === "en" ? "Inventories" : "Инвентарей"}
          value={stats.totalInventories}
          icon={<InventoryIcon />}
          color="indigo"
          trend="+15%"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8 px-6">
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            label={
              language === "en"
                ? "User Management"
                : "Управление пользователями"
            }
            count={stats.totalUsers}
          />
          <TabButton
            active={activeTab === "inventories"}
            onClick={() => setActiveTab("inventories")}
            label={
              language === "en" ? "System Inventories" : "Системные инвентари"
            }
            count={stats.totalInventories}
          />
          <TabButton
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
            label={language === "en" ? "Analytics" : "Аналитика"}
          />
        </nav>
      </div>

      <div>
        {activeTab === "users" && (
          <UsersTab
            users={usersData?.users || []}
            onToggleAdmin={handleToggleAdmin}
            onToggleBlock={handleToggleBlock}
            loading={updateUserMutation.isPending}
            language={language}
          />
        )}
        {activeTab === "inventories" && (
          // -------------------------------------------------------------------------------------
          // ИСПРАВЛЕНИЕ №4: Достаем массив из 'inventoriesData.inventories'
          // -------------------------------------------------------------------------------------
          <InventoriesTab
            inventories={inventoriesData?.inventories || []}
            loading={inventoriesLoading}
            language={language}
          />
        )}
        {activeTab === "analytics" && (
          <AnalyticsTab stats={stats} language={language} />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }) {
  const colorConfig = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      text: "text-blue-600 dark:text-blue-400",
      trend: "text-blue-600 dark:text-blue-400",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      iconBg: "bg-green-100 dark:bg-green-900/40",
      text: "text-green-600 dark:text-green-400",
      trend: "text-green-600 dark:text-green-400",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      iconBg: "bg-purple-100 dark:bg-purple-900/40",
      text: "text-purple-600 dark:text-purple-400",
      trend: "text-purple-600 dark:text-purple-400",
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
      text: "text-indigo-600 dark:text-indigo-400",
      trend: "text-indigo-600 dark:text-indigo-400",
    },
  };

  const config = colorConfig[color];

  return (
    <div className={`p-6 rounded-xl border border-transparent ${config.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <span className={`text-sm font-medium ${config.trend}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${config.iconBg} ${config.text}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
  const baseClasses =
    "relative py-4 px-1 font-medium text-sm transition-colors duration-200";
  const activeClasses = "text-indigo-600 dark:text-indigo-400";
  const inactiveClasses =
    "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      <span className="flex items-center space-x-2">
        <span>{label}</span>
        {count !== undefined && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            {count}
          </span>
        )}
      </span>
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t"></div>
      )}
    </button>
  );
}

function UsersTab({ users, onToggleAdmin, onToggleBlock, loading, language }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === "en"
                ? "Registered Users"
                : "Зарегистрированные пользователи"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {language === "en"
                ? "Manage user permissions and access"
                : "Управление правами и доступом пользователей"}
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {users.length} {language === "en" ? "users" : "пользователей"}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {language === "en" ? "User" : "Пользователь"}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {language === "en" ? "Registration Date" : "Дата регистрации"}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {language === "en" ? "Status" : "Статус"}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {language === "en" ? "Actions" : "Действия"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <UserRow
                key={user.uid}
                user={user}
                onToggleAdmin={onToggleAdmin}
                onToggleBlock={onToggleBlock}
                loading={loading}
                language={language}
              />
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-300 dark:text-gray-600 mb-4">
              <UsersIcon />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              {language === "en" ? "No users found" : "Пользователи не найдены"}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {language === "en"
                ? "Users will appear here once they register"
                : "Пользователи появятся здесь после регистрации"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({ user, onToggleAdmin, onToggleBlock, loading, language }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(
      language === "en" ? "en-US" : "ru-RU",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-medium text-sm">
                {user.email[0].toUpperCase()}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user.email}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {user.uid.substring(0, 10)}...
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <CalendarIcon />
          <span className="ml-2">{formatDate(user.created_at)}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {user.is_admin && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 dark:from-purple-900 dark:to-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
              <AdminIcon />
              <span className="ml-1.5">
                {language === "en" ? "Admin" : "Админ"}
              </span>
            </span>
          )}
          {user.is_blocked ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-red-50 text-red-700 dark:from-red-900 dark:to-red-800 dark:text-red-300 border border-red-200 dark:border-red-700">
              <BlockedIcon />
              <span className="ml-1.5">
                {language === "en" ? "Blocked" : "Заблокирован"}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-50 text-green-700 dark:from-green-900 dark:to-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="ml-1.5">
                {language === "en" ? "Active" : "Активен"}
              </span>
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onToggleAdmin(user)}
            disabled={loading}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              user.is_admin
                ? "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-700"
                : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <EditIcon />
            <span className="ml-1.5">
              {user.is_admin
                ? language === "en"
                  ? "Remove Admin"
                  : "Убрать админа"
                : language === "en"
                ? "Make Admin"
                : "Сделать админом"}
            </span>
          </button>
          <button
            onClick={() => onToggleBlock(user)}
            disabled={loading}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              user.is_blocked
                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-700"
                : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {user.is_blocked ? <EditIcon /> : <BlockedIcon />}
            <span className="ml-1.5">
              {user.is_blocked
                ? language === "en"
                  ? "Unblock"
                  : "Разблокировать"
                : language === "en"
                ? "Block"
                : "Заблокировать"}
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
}

function InventoriesTab({ inventories, loading, language }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === "en" ? "System Inventories" : "Системные инвентари"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {language === "en"
                ? "Overview of all inventories in the system"
                : "Обзор всех инвентарей в системе"}
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {inventories.length}{" "}
            {language === "en" ? "inventories" : "инвентарей"}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {language === "en" ? "Inventory" : "Инвентарь"}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {language === "en" ? "Owner" : "Владелец"}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {language === "en" ? "Items" : "Элементы"}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {language === "en" ? "Custom Fields" : "Поля"}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {language === "en" ? "Created" : "Создан"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {inventories.map((inventory) => (
              <InventoryRow
                key={inventory.id}
                inventory={inventory}
                language={language}
              />
            ))}
          </tbody>
        </table>

        {inventories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-300 dark:text-gray-600 mb-4">
              <InventoryIcon />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              {language === "en"
                ? "No inventories found"
                : "Инвентари не найдены"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryRow({ inventory, language }) {
  const countCustomFields = (inv) => {
    let count = 0;
    const types = ["string", "text", "number", "boolean", "link"];
    types.forEach((type) => {
      for (let i = 1; i <= 3; i++) {
        if (inv[`custom_${type}${i}_state`]) count++;
      }
    });
    return count;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(
      language === "en" ? "en-US" : "ru-RU"
    );
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-sm">
              <InventoryIcon />
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {inventory.name}
            </div>
            {inventory.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                {inventory.description}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
        {inventory.user_email || "Unknown"} {/* <-- ТЕПЕРЬ ЭТО СРАБОТАЕТ */}
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
          {inventory.items_count || 0} {language === "en" ? "items" : "эл."}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
          {countCustomFields(inventory)}{" "}
          {language === "en" ? "fields" : "полей"}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <CalendarIcon />
          <span className="ml-2">{formatDate(inventory.created_at)}</span>
        </div>
      </td>
    </tr>
  );
}

function AnalyticsTab({ stats, language }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {language === "en"
            ? "User Distribution"
            : "Распределение пользователей"}
        </h3>
        <div className="space-y-6">
          <ProgressBar
            label={language === "en" ? "Active Users" : "Активные пользователи"}
            value={stats.activeUsers}
            total={stats.totalUsers}
            color="green"
          />
          <ProgressBar
            label={language === "en" ? "Admin Users" : "Администраторы"}
            value={stats.adminUsers}
            total={stats.totalUsers}
            color="purple"
          />
          <ProgressBar
            label={language === "en" ? "Blocked Users" : "Заблокированные"}
            value={stats.blockedUsers}
            total={stats.totalUsers}
            color="red"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {language === "en" ? "System Overview" : "Обзор системы"}
        </h3>
        <div className="space-y-4">
          <StatItem
            label={language === "en" ? "Total Users" : "Всего пользователей"}
            value={stats.totalUsers}
            color="blue"
          />
          <StatItem
            label={
              language === "en" ? "Active Users" : "Активных пользователей"
            }
            value={stats.activeUsers}
            color="green"
          />
          <StatItem
            label={language === "en" ? "Administrators" : "Администраторов"}
            value={stats.adminUsers}
            color="purple"
          />
          <StatItem
            label={language === "en" ? "Total Inventories" : "Всего инвентарей"}
            value={stats.totalInventories}
            color="indigo"
          />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colorClasses = {
    green: "bg-green-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
  };

  return (
    <div>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
        <span className="font-medium">{label}</span>
        <span className="font-semibold">
          {value} / {total} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full ${colorClasses[color]} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function StatItem({ label, value, color }) {
  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    purple: "text-purple-600 dark:text-purple-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
  };

  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <span className="text-gray-600 dark:text-gray-400 font-medium">
        {label}
      </span>
      <span className={`text-lg font-bold ${colorClasses[color]}`}>
        {value}
      </span>
    </div>
  );
}
