import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage, translations } from "../hooks/useLanguage";
import { getAdminUsers, updateAdminUser } from "../utils/api";
import toast from "react-hot-toast";

export default function AdminPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: getAdminUsers,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ uid, data }) => updateAdminUser(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success(
        language === "en" ? "User updated" : "Пользователь обновлен"
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleToggleAdmin = (user) => {
    updateUserMutation.mutate({
      uid: user.uid,
      data: { isAdmin: !user.isAdmin },
    });
  };

  const handleToggleBlock = (user) => {
    updateUserMutation.mutate({
      uid: user.uid,
      data: { isBlocked: !user.isBlocked },
    });
  };

  if (isLoading) return <div className="p-8">{t.loading}</div>;
  if (error)
    return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        {language === "en" ? "User Management" : "Управление пользователями"}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "en" ? "User" : "Пользователь"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "en" ? "Status" : "Статус"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "en" ? "Actions" : "Действия"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data?.users?.map((user) => (
              <tr key={user.uid}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.email}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    UID: {user.uid}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {user.isAdmin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Admin
                      </span>
                    )}
                    {user.isBlocked && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Blocked
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleToggleAdmin(user)}
                    disabled={updateUserMutation.isPending}
                    className={`mr-3 ${
                      user.isAdmin
                        ? "text-orange-600 hover:text-orange-900"
                        : "text-green-600 hover:text-green-900"
                    } disabled:opacity-50`}
                  >
                    {user.isAdmin ? "Remove Admin" : "Make Admin"}
                  </button>
                  <button
                    onClick={() => handleToggleBlock(user)}
                    disabled={updateUserMutation.isPending}
                    className={`${
                      user.isBlocked
                        ? "text-green-600 hover:text-green-900"
                        : "text-red-600 hover:text-red-900"
                    } disabled:opacity-50`}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!data?.users || data.users.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {language === "en" ? "No users found" : "Пользователи не найдены"}
          </div>
        )}
      </div>
    </div>
  );
}
