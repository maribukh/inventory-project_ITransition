import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getItems, createItem, deleteItem } from "../utils/api";
import Fuse from "fuse.js";
import toast from "react-hot-toast";
import { useLanguage } from "../hooks/useLanguage";

export default function InventoryPage() {
  const { id: inventoryId } = useParams();
  const [q, setQ] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [newItemValues, setNewItemValues] = useState({});
  const [customId, setCustomId] = useState("");

  const { t } = useLanguage();

  const queryClient = useQueryClient();

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["items", inventoryId],
    queryFn: () => getItems(inventoryId),
    enabled: !!inventoryId,
  });

  const createItemMutation = useMutation({
    mutationFn: ({ inventoryId, data, customId }) =>
      createItem(inventoryId, { ...data, customId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", inventoryId] });
      toast.success(t.itemCreatedSuccess);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || t.itemCreatedError);
    },
  });

  const deleteItemsMutation = useMutation({
    mutationFn: (itemIds) =>
      Promise.all(itemIds.map((itemId) => deleteItem(inventoryId, itemId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", inventoryId] });
      setSelectedIds(new Set());
      toast.success(t.itemsDeletedSuccess);
    },
    onError: (error) => {
      toast.error(error.message || t.itemsDeletedError);
    },
  });

  useEffect(() => {
    if (inventoryData?.items) {
      setFiltered(inventoryData.items);
    }
  }, [inventoryData]);

  useEffect(() => {
    if (!inventoryData?.items || !q) {
      setFiltered(inventoryData?.items || []);
      return;
    }

    const fuse = new Fuse(inventoryData.items, {
      includeScore: true,
      threshold: 0.4,
      keys: ["searchText"],
    });

    const result = fuse.search(q);
    setFiltered(result.map((r) => r.item));
  }, [q, inventoryData]);

  useEffect(() => {
    if (inventoryData?.inventory?.fieldsSchema) {
      const initialValues = {};
      inventoryData.inventory.fieldsSchema.forEach(
        (f) => (initialValues[f.key] = f.type === "boolean" ? false : "")
      );
      setNewItemValues(initialValues);
    }
  }, [inventoryData]);

  function resetForm() {
    setCustomId("");
    if (inventoryData?.inventory?.fieldsSchema) {
      const initialValues = {};
      inventoryData.inventory.fieldsSchema.forEach(
        (f) => (initialValues[f.key] = f.type === "boolean" ? false : "")
      );
      setNewItemValues(initialValues);
    }
  }

  function onCreate(e) {
    e.preventDefault();
    createItemMutation.mutate({
      inventoryId,
      data: newItemValues,
      customId: customId || undefined,
    });
  }

  function toggleSelect(itemId) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedIds(newSelected);
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((it) => it.id)));
    }
  }

  function onDeleteSelected() {
    if (selectedIds.size === 0) return;

    const confirmMsg = t.confirmDeleteItems.replace(
      "{count}",
      selectedIds.size
    );

    if (!window.confirm(confirmMsg)) {
      return;
    }

    deleteItemsMutation.mutate(Array.from(selectedIds));
  }

  function updateNewItemValue(fieldKey, value) {
    setNewItemValues((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
                <div className="text-lg">{t.loadingInventory}</div>     {" "}
      </div>
    );
  }

  if (!inventoryData?.inventory) {
    return <div className="text-red-500">{t.inventoryNotFound}</div>;
  }

  const { inventory, items = [] } = inventoryData;

  return (
    <div className="space-y-6 p-4 md:p-6">
           {" "}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
               {" "}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {inventory.name}       {" "}
        </h2>
               {" "}
        <div className="text-sm text-gray-500 dark:text-gray-400">
                    {items.length} {t.itemsCount}       {" "}
        </div>
             {" "}
      </div>
           {" "}
      {inventory.description && (
        <p className="text-gray-600 dark:text-gray-300">
                    {inventory.description}       {" "}
        </p>
      )}
           {" "}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
               {" "}
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {t.addNewItem}       {" "}
        </h3>
               {" "}
        <form onSubmit={onCreate} className="space-y-4">
                   {" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {" "}
            <div>
                           {" "}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t.customIdOptional}             {" "}
              </label>
                           {" "}
              <input
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder={t.customIdPlaceholder}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
                         {" "}
            </div>
                       {" "}
            {inventory.fieldsSchema.map((field) => (
              <div key={field.key}>
                               {" "}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {field.label}{" "}
                  <span className="text-xs text-gray-500">({field.type})</span> 
                               {" "}
                </label>
                               {" "}
                {field.type === "text" ? (
                  <textarea
                    value={newItemValues[field.key] || ""}
                    onChange={(e) =>
                      updateNewItemValue(field.key, e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition"
                    rows={3}
                  />
                ) : field.type === "boolean" ? (
                  <div className="flex items-center h-10">
                                       {" "}
                    <input
                      id={`checkbox-${field.key}`}
                      type="checkbox"
                      checked={newItemValues[field.key] || false}
                      onChange={(e) =>
                        updateNewItemValue(field.key, e.target.checked)
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                                   {" "}
                    <label
                      htmlFor={`checkbox-${field.key}`}
                      className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                                      {t.yes}             {" "}
                    </label>
                                 {" "}
                  </div>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={newItemValues[field.key] || ""}
                    onChange={(e) =>
                      updateNewItemValue(field.key, e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                )}
                         {" "}
              </div>
            ))}
               {" "}
          </div>
             {" "}
          <div className="flex justify-end pt-2">
               {" "}
            <button
              type="submit"
              disabled={createItemMutation.isPending}
              className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
                  {createItemMutation.isPending ? t.creating : t.createItem}   {" "}
            </button>
               {" "}
          </div>
             {" "}
        </form>
         {" "}
      </div>
       {" "}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm">
           {" "}
          <div className="flex items-center space-x-2 md:space-x-4">
             {" "}
            <span className="text-blue-700 dark:text-blue-300 font-medium text-sm md:text-base">
                {selectedIds.size} {t.itemsSelected} {" "}
            </span>
             {" "}
          </div>
           {" "}
          <div className="flex items-center space-x-1 md:space-x-2">
                     {" "}
            <button
              disabled={selectedIds.size !== 1 || deleteItemsMutation.isPending}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 transition-colors"
            >
                      Редакт.        {" "}
            </button>
             {" "}
            <button
              onClick={onDeleteSelected}
              disabled={deleteItemsMutation.isPending}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
                       {" "}
              {deleteItemsMutation.isPending ? t.deleting : t.deleteSelected}   
                   {" "}
            </button>
                     {" "}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
                      {t.cancel}       {" "}
            </button>
                   {" "}
          </div>
               {" "}
        </div>
      )}
         {" "}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
             {" "}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                 {" "}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                     {" "}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white shrink-0">
                        {t.items}         {" "}
            </h3>
                     {" "}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchItemsPlaceholder}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full md:w-64 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
                 {" "}
          </div>
             {" "}
        </div>
           {" "}
        <div className="overflow-x-auto">
             {" "}
          <table className="w-full min-w-[600px]">
               {" "}
            <thead className="bg-gray-50 dark:bg-gray-700">
                 {" "}
              <tr>
                   {" "}
                <th className="p-3 w-12 border-b border-gray-200 dark:border-gray-600">
                     {" "}
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      selectedIds.size === filtered.length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                     {" "}
                </th>
                   {" "}
                <th className="p-3 w-12 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      #    {" "}
                </th>
                   {" "}
                <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      {t.customId}   {" "}
                </th>
                   {" "}
                {inventory.fieldsSchema.map((f) => (
                  <th
                    key={f.key}
                    className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600"
                  >
                        {f.label}   {" "}
                  </th>
                ))}
                   {" "}
              </tr>
                 {" "}
            </thead>
               {" "}
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                 {" "}
              {filtered.length === 0 && (
                <tr>
                     {" "}
                  <td
                    colSpan={3 + inventory.fieldsSchema.length}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                        {t.noItemsFound}   {" "}
                  </td>
                     {" "}
                </tr>
              )}
                 {" "}
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    selectedIds.has(item.id)
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : ""
                  }`}
                >
                     {" "}
                  <td className="p-3">
                       {" "}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                       {" "}
                  </td>
                     {" "}
                  <td className="p-3 text-sm text-gray-500 dark:text-gray-400">
                        {idx + 1}   {" "}
                  </td>
                     {" "}
                  <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">
                       {" "}
                    {item.customId || <span className="text-gray-400">-</span>} 
                     {" "}
                  </td>
                     {" "}
                  {inventory.fieldsSchema.map((f) => (
                    <td
                      key={f.key}
                      className="p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                          {renderCell(item[f.key], f, t)}   {" "}
                    </td>
                  ))}
                     {" "}
                </tr>
              ))}
                 {" "}
            </tbody>
               {" "}
          </table>
             {" "}
        </div>
         {" "}
      </div>
       {" "}
    </div>
  );
}

function renderCell(value, field, t) {
  if (field.type === "boolean") {
    return value ? (
      <span className="inline-flex items-center px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900 dark:text-green-300">
          {t.yes} {" "}
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full dark:bg-red-900 dark:text-red-300">
          {t.no} {" "}
      </span>
    );
  }

  if (field.type === "link" && value) {
    return (
      <a
        href={value.startsWith("http") ? value : `https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline transition-colors"
      >
          {t.openLink} {" "}
      </a>
    );
  }

  if (value === undefined || value === null || value === "") {
    return <span className="text-gray-400 dark:text-gray-500">-</span>;
  }

  return String(value);
}
