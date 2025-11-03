import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage, translations } from "../hooks/useLanguage";
import {
  getAdminUsers,
  updateAdminUser,
  getAdminInventories,
  getAdminStats,
} from "../utils/api";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  UsersIcon,
  CubeIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ListBulletIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

const COLORS = ["#00C49F", "#8884D8", "#FF8042"];

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
const AdminIcon = () => (
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

export default function AdminPage() {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [page, setPage] = useState(1);

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["adminUsers", page],
    queryFn: () => getAdminUsers(page),
    keepPreviousData: true,
  });
  const { data: inventoriesData, isLoading: inventoriesLoading } = useQuery({
    queryKey: ["adminInventories"],
    queryFn: getAdminInventories,
  });
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ uid, data }) => updateAdminUser(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers", page] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast.success(
        language === "en"
          ? "User updated successfully"
          : "Пользователь обновлен"
      );
    },
    onError: (error) => toast.error(error.message),
  });

  const handleToggleAdmin = (user) =>
    updateUserMutation.mutate({
      uid: user.uid,
      data: { isAdmin: !user.is_admin },
    });
  const handleToggleBlock = (user) =>
    updateUserMutation.mutate({
      uid: user.uid,
      data: { isBlocked: !user.is_blocked },
    });

  const totalUsers = usersData?.total || 0;
  const totalInventories = inventoriesData?.inventories?.length || 0;
  const adminUsersCount =
    statsData?.userDistribution?.find((d) => d.name === "Admins")?.value || 0;
  const activeUsersCount =
    (statsData?.userDistribution?.find((d) => d.name === "Active")?.value ||
      0) + adminUsersCount;

  if ((usersLoading || inventoriesLoading || statsLoading) && page === 1)
    return <LoadingSpinner />;
  if (usersError) return <ErrorDisplay message={usersError.message} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6 space-y-8">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
              {language === "en"
                ? "Administration Panel"
                : "Панель администратора"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              {language === "en"
                ? "System Management & Analytics"
                : "Управление системой и аналитика"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={language === "en" ? "Total Users" : "Всего пользователей"}
          value={totalUsers}
          change={statsData?.userGrowth}
          icon={<UserGroupIcon className="h-6 w-6" />}
          color="blue"
          language={language}
        />
        <StatCard
          title={language === "en" ? "Active Users" : "Активных"}
          value={activeUsersCount}
          change={statsData?.activeUserRate}
          icon={<UsersIcon className="h-6 w-6" />}
          color="green"
          language={language}
          isRate
        />
        <StatCard
          title={language === "en" ? "Total Inventories" : "Всего инвентарей"}
          value={totalInventories}
          change={statsData?.inventoryGrowth}
          icon={<CubeIcon className="h-6 w-6" />}
          color="purple"
          language={language}
        />
        <StatCard
          title={language === "en" ? "Administrators" : "Администраторов"}
          value={adminUsersCount}
          icon={<ShieldCheckIcon className="h-6 w-6" />}
          color="orange"
          language={language}
        />
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
        <nav className="flex space-x-1 p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/20">
          <TabButton
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
            label={language === "en" ? "Dashboard" : "Обзор"}
            icon={<ChartBarIcon />}
            gradient="from-blue-500 to-cyan-500"
          />
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            label={language === "en" ? "Users" : "Пользователи"}
            icon={<UsersIcon />}
            count={totalUsers}
            gradient="from-green-500 to-emerald-500"
          />
          <TabButton
            active={activeTab === "inventories"}
            onClick={() => setActiveTab("inventories")}
            label={language === "en" ? "Inventories" : "Инвентари"}
            icon={<ListBulletIcon />}
            count={totalInventories}
            gradient="from-purple-500 to-pink-500"
          />
        </nav>
        <div className="p-6">
          {activeTab === "dashboard" && (
            <DashboardTab
              stats={statsData}
              loading={statsLoading}
              language={language}
            />
          )}
          {activeTab === "users" && (
            <UsersTab
              users={usersData?.users || []}
              totalUsers={totalUsers}
              page={page}
              setPage={setPage}
              onToggleAdmin={handleToggleAdmin}
              onToggleBlock={handleToggleBlock}
              loading={
                updateUserMutation.isPending || (usersLoading && page > 1)
              }
              language={language}
            />
          )}
          {activeTab === "inventories" && (
            <InventoriesTab
              inventories={inventoriesData?.inventories || []}
              loading={inventoriesLoading}
              language={language}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);
const ErrorDisplay = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-red-500 text-center">
      <div className="text-2xl mb-2">⚠️</div>
      <div>Error: {message}</div>
    </div>
  </div>
);

const StatCard = ({
  title,
  value,
  change,
  icon,
  color,
  language,
  isRate = false,
}) => {
  const colorConfig = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-indigo-500",
    orange: "from-orange-500 to-red-500",
  };
  const isPositive = change > 0;
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}
            {isRate ? "%" : ""}
          </p>
          {change !== undefined && !isRate && (
            <div
              className={`flex items-center mt-2 text-sm ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}%{" "}
              {language === "en" ? "this month" : "за месяц"}
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${colorConfig[color]} text-white shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl text-white text-sm shadow-2xl">
        <p className="font-bold text-indigo-300">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="mt-1" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function DashboardTab({ stats, loading, language }) {
  if (loading)
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  if (!stats)
    return (
      <div className="text-center py-12 text-gray-500">No data available</div>
    );

  const chartData = stats.userRegistrations || [];
  const popularInventories = stats.popularInventories || [];

  return (
    <div className="space-y-8">
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-500" />
          {language === "en" ? "User Registrations Trend" : "Тренд регистраций"}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="colorRegistrations"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis
              dataKey="date"
              tick={{ fill: "rgb(107 114 128)", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "rgb(107 114 128)", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorRegistrations)"
              name={language === "en" ? "Registrations" : "Регистрации"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CubeIcon className="w-5 h-5 mr-2 text-purple-500" />
          {language === "en"
            ? "Top Public Inventories"
            : "Топ публичных инвентарей"}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === "en" ? "Inventory" : "Инвентарь"}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === "en" ? "Owner" : "Владелец"}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === "en" ? "Items" : "Элементы"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {popularInventories.map((inv, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {inv.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {inv.user_email || "Unknown"}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-right text-indigo-600 dark:text-indigo-400">
                    {inv.items_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {popularInventories.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              {language === "en"
                ? "No public inventories yet"
                : "Пока нет публичных инвентарей"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon, count, gradient }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center space-x-3 py-3 px-6 font-medium text-sm transition-all duration-300 rounded-xl ${
        active
          ? `bg-gradient-to-r ${gradient} text-white shadow-lg transform scale-105`
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
      }`}
    >
      {React.cloneElement(icon, { className: "h-5 w-5" })}
      <span className="font-semibold">{label}</span>
      {count !== undefined && (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
            active
              ? "bg-white/20 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function UsersTab({
  users,
  totalUsers,
  page,
  setPage,
  onToggleAdmin,
  onToggleBlock,
  loading,
  language,
}) {
  const limit = 50;
  const totalPages = Math.ceil(totalUsers / limit);
  return (
    <div className="space-y-6">
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {language === "en" ? "User" : "Пользователь"}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {language === "en" ? "Registration Date" : "Дата регистрации"}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {language === "en" ? "Status" : "Статус"}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {language === "en" ? "Actions" : "Действия"}
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y divide-gray-200/50 dark:divide-gray-700/50 ${
                loading ? "opacity-50" : ""
              }`}
            >
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
          {users.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                👥
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {language === "en"
                  ? "No users found"
                  : "Пользователи не найдены"}
              </p>
            </div>
          )}
        </div>
        {totalUsers > limit && (
          <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {language === "en" ? "Page" : "Стр."}{" "}
                <span className="font-semibold">{page}</span>{" "}
                {language === "en" ? "of" : "из"}{" "}
                <span className="font-semibold">{totalPages}</span>
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || loading}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 shadow-sm"
                >
                  {language === "en" ? "Previous" : "Назад"}
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || loading}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 shadow-sm"
                >
                  {language === "en" ? "Next" : "Вперед"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({ user, onToggleAdmin, onToggleBlock, loading, language }) {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(
      language === "en" ? "en-US" : "ru-RU",
      { year: "numeric", month: "short", day: "numeric" }
    );
  return (
    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-lg">
            {user.email[0].toUpperCase()}
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {user.email}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-1 inline-block">
              {user.uid.substring(0, 8)}...
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <CalendarIcon className="w-4 h-4 mr-2" />
          {formatDate(user.created_at)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-2">
          {user.is_admin && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 dark:from-purple-900/50 dark:to-purple-800/50 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
              <AdminIcon className="w-3 h-3 mr-1" />
              {language === "en" ? "Admin" : "Админ"}
            </span>
          )}
          {user.is_blocked ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-100 to-red-50 text-red-700 dark:from-red-900/50 dark:to-red-800/50 dark:text-red-300 border border-red-200 dark:border-red-700">
              <BlockedIcon className="w-3 h-3 mr-1" />
              {language === "en" ? "Blocked" : "Заблокирован"}
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-green-50 text-green-700 dark:from-green-900/50 dark:to-green-800/50 dark:text-green-300 border border-green-200 dark:border-green-700">
              {language === "en" ? "Active" : "Активен"}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleAdmin(user)}
            disabled={loading}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              user.is_admin
                ? "bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 dark:text-orange-300"
                : "bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300"
            } disabled:opacity-50 shadow-sm`}
          >
            {user.is_admin
              ? language === "en"
                ? "Remove Admin"
                : "Убрать админа"
              : language === "en"
              ? "Make Admin"
              : "Сделать админом"}
          </button>
          <button
            onClick={() => onToggleBlock(user)}
            disabled={loading}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              user.is_blocked
                ? "bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300"
                : "bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300"
            } disabled:opacity-50 shadow-sm`}
          >
            {user.is_blocked
              ? language === "en"
                ? "Unblock"
                : "Разблокировать"
              : language === "en"
              ? "Block"
              : "Заблокировать"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function InventoriesTab({ inventories, loading, language }) {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(
      language === "en" ? "en-US" : "ru-RU",
      { year: "numeric", month: "short", day: "numeric" }
    );
  const countCustomFields = (inv) =>
    ["string", "text", "number", "boolean", "link"].reduce(
      (acc, type) =>
        acc + [1, 2, 3].filter((i) => inv[`custom_${type}${i}_state`]).length,
      0
    );
  return (
    <div className="space-y-6">
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {language === "en" ? "Inventory" : "Инвентарь"}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {language === "en" ? "Owner" : "Владелец"}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {language === "en" ? "Stats" : "Статистика"}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {language === "en" ? "Created" : "Создан"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {inventories.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                        <CubeIcon className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {inv.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-1">
                          {String(inv.id).substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {inv.user_email || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        {inv.items_count || 0}{" "}
                        {language === "en" ? "items" : "эл."}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                        {countCustomFields(inv)}{" "}
                        {language === "en" ? "fields" : "полей"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formatDate(inv.created_at)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inventories.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                📦
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {language === "en"
                  ? "No inventories found"
                  : "Инвентари не найдены"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
