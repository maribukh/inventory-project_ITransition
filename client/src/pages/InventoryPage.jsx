import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getItems, createItem, deleteItem, updateItem } from "../utils/api";
import toast from "react-hot-toast";
import { useLanguage } from "../hooks/useLanguage";

export default function InventoryPage() {
  const { id: inventoryId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [activeModal, setActiveModal] = useState(null); // 'create', 'edit', or null
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const {
    data: inventoryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["items", inventoryId],
    queryFn: () => getItems(inventoryId),
    enabled: !!inventoryId,
  });

  const createItemMutation = useMutation({
    mutationFn: ({ inventoryId, data, customId }) =>
      createItem(inventoryId, data, customId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", inventoryId] });
      toast.success("Item created successfully");
      closeModal();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create item");
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ inventoryId, itemId, data, customId }) =>
      updateItem(inventoryId, itemId, data, customId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", inventoryId] });
      toast.success("Item updated successfully");
      closeModal();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update item");
    },
  });

  const deleteItemsMutation = useMutation({
    mutationFn: (itemIds) =>
      Promise.all(itemIds.map((itemId) => deleteItem(inventoryId, itemId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", inventoryId] });
      setSelectedItems(new Set());
      toast.success("Items deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete items");
    },
  });

  const openCreateModal = () => {
    setActiveModal("create");
    setFormData(initializeFormData());
  };

  const openEditModal = (item) => {
    setActiveModal("edit");
    setEditingItem(item);
    setFormData({
      customId: item.custom_id || "",
      ...inventoryData.inventory.fieldsSchema.reduce((acc, field) => {
        acc[field.key] =
          item[field.key] || (field.type === "boolean" ? false : "");
        return acc;
      }, {}),
    });
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingItem(null);
    setFormData({});
  };

  const initializeFormData = () => {
    const data = { customId: "" };
    inventoryData?.inventory?.fieldsSchema?.forEach((field) => {
      data[field.key] = field.type === "boolean" ? false : "";
    });
    return data;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { customId, ...fieldData } = formData;
    const hasData = Object.values(fieldData).some(
      (value) =>
        value !== "" && value !== false && value !== null && value !== undefined
    );

    if (!hasData && !customId) {
      toast.error("Please fill at least one field or enter a custom ID");
      return;
    }

    if (activeModal === "create") {
      createItemMutation.mutate({
        inventoryId,
        data: fieldData,
        customId: customId || null,
      });
    } else {
      updateItemMutation.mutate({
        inventoryId,
        itemId: editingItem.id,
        data: fieldData,
        customId: customId || null,
      });
    }
  };

  const updateFormField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;

    const confirmMsg = `Delete ${selectedItems.size} selected item(s)?`;
    if (!window.confirm(confirmMsg)) return;

    deleteItemsMutation.mutate(Array.from(selectedItems));
  };

  const handleQuickDelete = (item) => {
    if (!window.confirm(`Delete "${item.custom_id || `Item #${item.id}`}"?`))
      return;
    deleteItemsMutation.mutate([item.id]);
  };

  const filteredItems =
    inventoryData?.items?.filter((item) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        item.custom_id?.toLowerCase().includes(searchLower) ||
        item.search_text?.toLowerCase().includes(searchLower) ||
        inventoryData.inventory.fieldsSchema.some((field) =>
          String(item[field.key] || "")
            .toLowerCase()
            .includes(searchLower)
        )
      );
    }) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error.message || "Inventory not found"}
      </div>
    );
  }

  if (!inventoryData?.inventory) {
    return (
      <div className="text-red-500 text-center p-4">Inventory not found</div>
    );
  }

  const { inventory, items = [] } = inventoryData;
  const hasSelection = selectedItems.size > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {inventory.name}
                </h1>
                {inventory.description && (
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {inventory.description}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {items.length} items
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search items..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {hasSelection && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  {selectedItems.size} item(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkDelete}
                  disabled={deleteItemsMutation.isPending}
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
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
                  {deleteItemsMutation.isPending
                    ? "Deleting..."
                    : "Delete Selected"}
                </button>
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="w-12 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <input
                      type="checkbox"
                      checked={
                        filteredItems.length > 0 &&
                        selectedItems.size === filteredItems.length
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Custom ID
                  </th>
                  {inventory.fieldsSchema.map((field) => (
                    <th
                      key={field.key}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-600"
                    >
                      {field.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3 + inventory.fieldsSchema.length}
                      className="px-6 py-12 text-center"
                    >
                      <div className="text-gray-400 dark:text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                          {searchTerm
                            ? "No items match your search"
                            : "No items yet"}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={openCreateModal}
                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                          >
                            Add your first item
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      item={item}
                      fieldsSchema={inventory.fieldsSchema}
                      isSelected={selectedItems.has(item.id)}
                      onSelect={() => toggleItemSelection(item.id)}
                      onEdit={() => openEditModal(item)}
                      onDelete={() => handleQuickDelete(item)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(activeModal === "create" || activeModal === "edit") && (
        <ItemModal
          mode={activeModal}
          item={editingItem}
          formData={formData}
          fieldsSchema={inventory.fieldsSchema}
          onUpdateField={updateFormField}
          onSubmit={handleSubmit}
          onClose={closeModal}
          isLoading={
            createItemMutation.isPending || updateItemMutation.isPending
          }
        />
      )}
    </div>
  );
}

function TableRow({
  item,
  fieldsSchema,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr
      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
        isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {item.custom_id || <span className="text-gray-400">-</span>}
        </div>
      </td>
      {fieldsSchema.map((field) => (
        <td key={field.key} className="px-6 py-4">
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {renderTableCell(item[field.key], field)}
          </div>
        </td>
      ))}
      <td className="px-6 py-4">
        <div
          className={`flex items-center space-x-2 transition-opacity ${
            showActions ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
            title="Edit item"
          >
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
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete item"
          >
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
          </button>
        </div>
      </td>
    </tr>
  );
}

function ItemModal({
  mode,
  item,
  formData,
  fieldsSchema,
  onUpdateField,
  onSubmit,
  onClose,
  isLoading,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {mode === "create" ? "Add New Item" : "Edit Item"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom ID
              <span className="text-gray-500 text-sm ml-1">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.customId || ""}
              onChange={(e) => onUpdateField("customId", e.target.value)}
              placeholder="Enter custom identifier..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldsSchema.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                </label>

                {field.type === "text" ? (
                  <textarea
                    value={formData[field.key] || ""}
                    onChange={(e) => onUpdateField(field.key, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                ) : field.type === "boolean" ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData[field.key] || false}
                      onChange={(e) =>
                        onUpdateField(field.key, e.target.checked)
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {formData[field.key] ? "Yes" : "No"}
                    </label>
                  </div>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={formData[field.key] || ""}
                    onChange={(e) => onUpdateField(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors font-medium"
            >
              {isLoading
                ? "Saving..."
                : mode === "create"
                ? "Create Item"
                : "Update Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function renderTableCell(value, field) {
  if (field.type === "boolean") {
    return value ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Yes
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        No
      </span>
    );
  }

  if (field.type === "link" && value) {
    return (
      <a
        href={value.startsWith("http") ? value : `https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
      >
        <span>Open</span>
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    );
  }

  if (value === undefined || value === null || value === "") {
    return <span className="text-gray-400 dark:text-gray-500">-</span>;
  }

  const stringValue = String(value);
  if (stringValue.length > 50) {
    return (
      <span title={stringValue} className="truncate block max-w-xs">
        {stringValue.substring(0, 50)}...
      </span>
    );
  }

  return stringValue;
}
