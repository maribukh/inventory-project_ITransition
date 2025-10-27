import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getItems, createItem, deleteItem } from "../utils/api";
import Fuse from "fuse.js";
import toast from "react-hot-toast";

export default function InventoryPage() {
  const { id: inventoryId } = useParams();
  const [q, setQ] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [newItemValues, setNewItemValues] = useState({});
  const [customId, setCustomId] = useState("");

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
      toast.success("Item created successfully!");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create item");
    },
  });

  const deleteItemsMutation = useMutation({
    mutationFn: (itemIds) =>
      Promise.all(itemIds.map((itemId) => deleteItem(inventoryId, itemId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", inventoryId] });
      setSelectedIds(new Set());
      toast.success("Items deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete items");
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

    if (
      !confirm(`Are you sure you want to delete ${selectedIds.size} item(s)?`)
    ) {
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
        <div className="text-lg">Loading inventory...</div>
      </div>
    );
  }

  if (!inventoryData?.inventory) {
    return <div className="text-red-500">Inventory not found</div>;
  }

  const { inventory, items = [] } = inventoryData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {inventory.name}
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {items.length} items
        </div>
      </div>

      {inventory.description && (
        <p className="text-gray-600 dark:text-gray-300">
          {inventory.description}
        </p>
      )}

      {/* Create Item Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Add New Item
        </h3>
        <form onSubmit={onCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom ID (optional)
            </label>
            <input
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="Enter custom ID..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {inventory.fieldsSchema.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label} ({field.type})
              </label>
              {field.type === "text" ? (
                <textarea
                  value={newItemValues[field.key] || ""}
                  onChange={(e) =>
                    updateNewItemValue(field.key, e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              ) : field.type === "boolean" ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newItemValues[field.key] || false}
                    onChange={(e) =>
                      updateNewItemValue(field.key, e.target.checked)
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    Yes
                  </span>
                </div>
              ) : (
                <input
                  type={field.type === "number" ? "number" : "text"}
                  value={newItemValues[field.key] || ""}
                  onChange={(e) =>
                    updateNewItemValue(field.key, e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={createItemMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {createItemMutation.isPending ? "Creating..." : "Create Item"}
          </button>
        </form>
      </div>

      {/* Contextual Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              {selectedIds.size} item(s) selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onDeleteSelected}
              disabled={deleteItemsMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleteItemsMutation.isPending
                ? "Deleting..."
                : "Delete Selected"}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Items
            </h3>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search items..."
              className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="p-3 border-b border-gray-200 dark:border-gray-600">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      selectedIds.size === filtered.length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                  #
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                  Custom ID
                </th>
                {inventory.fieldsSchema.map((f) => (
                  <th
                    key={f.key}
                    className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600"
                  >
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedIds.has(item.id)
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="p-3 text-sm text-gray-900 dark:text-white">
                    {idx + 1}
                  </td>
                  <td className="p-3 text-sm text-gray-900 dark:text-white">
                    {item.customId || "-"}
                  </td>
                  {inventory.fieldsSchema.map((f) => (
                    <td
                      key={f.key}
                      className="p-3 text-sm text-gray-900 dark:text-white"
                    >
                      {renderCell(item[f.key], f)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No items found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderCell(value, field) {
  if (field.type === "boolean") {
    return value ? (
      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
        Yes
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
        No
      </span>
    );
  }

  if (field.type === "link" && value) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline transition-colors"
      >
        Open Link
      </a>
    );
  }

  if (value === undefined || value === null || value === "") {
    return <span className="text-gray-400">-</span>;
  }

  return String(value);
}
