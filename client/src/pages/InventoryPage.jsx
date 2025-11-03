import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getItems, createItem, deleteItem, updateItem } from "../utils/api";
import toast from "react-hot-toast";
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../hooks/useAuth";

import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/20/solid";

export default function InventoryPage() {
  const { id: inventoryId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [activeModal, setActiveModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [customId, setCustomId] = useState("");

  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  const {
    data: inventoryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["items", inventoryId],
    queryFn: () => getItems(inventoryId),
    enabled: !!inventoryId,
  });

  const {
    inventory,
    items: allItems = [],
    fieldsSchema = [],
  } = inventoryData || {};

  const isOwner = useMemo(() => {
    if (!inventory || !user) return false;
    return inventory.user_id === user.uid || isAdmin;
  }, [inventory, user, isAdmin]);

  const filteredItems = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    if (!lowerSearch) return allItems;
    return allItems.filter(
      (item) =>
        item.search_text?.toLowerCase().includes(lowerSearch) ||
        item.custom_id?.toLowerCase().includes(lowerSearch)
    );
  }, [allItems, searchTerm]);

  const singleSelectedItem = useMemo(() => {
    if (selectedItems.size !== 1) return null;
    const selectedId = selectedItems.values().next().value;
    return allItems.find((item) => item.id === selectedId);
  }, [selectedItems, allItems]);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", inventoryId] });
      handleCloseModal();
    },
    onError: (err) => {
      toast.error(err.message || t.error);
    },
  };

  const createItemMutation = useMutation({
    ...mutationOptions,
    mutationFn: ({ inventoryId, data, customId }) =>
      createItem(inventoryId, data, customId),
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success(t.itemCreatedSuccess);
    },
  });

  const updateItemMutation = useMutation({
    ...mutationOptions,
    mutationFn: ({ inventoryId, itemId, data, customId }) =>
      updateItem(inventoryId, itemId, data, customId),
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success(t.itemUpdatedSuccess);
    },
  });

  const deleteItemsMutation = useMutation({
    mutationFn: (itemIds) =>
      Promise.all(itemIds.map((id) => deleteItem(inventoryId, id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", inventoryId] });
      setSelectedItems(new Set());
      toast.success(t.itemsDeletedSuccess);
    },
    onError: () => {
      toast.error(t.itemsDeletedError);
    },
  });

  const handleOpenModal = (type, item = null) => {
    if (type === "edit" && item) {
      setEditingItem(item);
      const initialFormData = {};
      fieldsSchema.forEach((field) => {
        initialFormData[field.key] = item[field.key] ?? "";
      });
      setFormData(initialFormData);
      setCustomId(item.custom_id || "");
    } else {
      setEditingItem(null);
      const initialFormData = {};
      fieldsSchema.forEach((field) => {
        initialFormData[field.key] = field.type === "boolean" ? false : "";
      });
      setFormData(initialFormData);
      setCustomId("");
    }
    setActiveModal(type);
  };

  const handleEditOnToolbar = () => {
    if (singleSelectedItem) {
      handleOpenModal("edit", singleSelectedItem);
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setEditingItem(null);
    setFormData({});
    setCustomId("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCustomId = customId.trim() === "" ? null : customId.trim();

    if (activeModal === "edit" && editingItem) {
      updateItemMutation.mutate({
        inventoryId,
        itemId: editingItem.id,
        data: formData,
        customId: finalCustomId,
      });
    } else {
      createItemMutation.mutate({
        inventoryId,
        data: formData,
        customId: finalCustomId,
      });
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (
      filteredItems.length > 0 &&
      selectedItems.size === filteredItems.length
    ) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (
      window.confirm(
        t.confirmDeleteItems.replace("{count}", selectedItems.size)
      )
    ) {
      deleteItemsMutation.mutate(Array.from(selectedItems));
    }
  };

  if (isLoading)
    return <div className="p-8 text-center">{t.loadingInventory}</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">{t.inventoryNotFound}</div>
    );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {inventory?.name}
            <span
              className={`ml-3 text-sm font-medium ${
                inventory?.is_public ? "text-green-500" : "text-gray-400"
              }`}
            >
              {inventory?.is_public ? `(${t.public})` : `(${t.private})`}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {inventory?.description} ( {allItems.length} {t.itemsCount} )
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => handleOpenModal("create")}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {t.addNewItem}
          </button>
        )}
      </div>

      {isOwner && (
        <ItemsToolbar
          selectedCount={selectedItems.size}
          onDelete={handleDeleteSelected}
          onEdit={handleEditOnToolbar}
          editEnabled={selectedItems.size === 1}
          mutationLoading={deleteItemsMutation.isPending}
          t={t}
        />
      )}

      <input
        type="text"
        placeholder={t.searchItemsPlaceholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />

      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {isOwner && (
                      <th
                        scope="col"
                        className="relative w-12 px-6 sm:w-16 sm:px-8"
                      >
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                          checked={
                            filteredItems.length > 0 &&
                            selectedItems.size === filteredItems.length
                          }
                          onChange={toggleSelectAll}
                          indeterminate={
                            selectedItems.size > 0 &&
                            selectedItems.size < filteredItems.length
                          }
                        />
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      {t.customId}
                    </th>
                    {fieldsSchema.map((field) => (
                      <th
                        key={field.key}
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {filteredItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      fieldsSchema={fieldsSchema}
                      isSelected={selectedItems.has(item.id)}
                      onSelect={() => toggleSelectItem(item.id)}
                      isOwner={isOwner}
                    />
                  ))}
                </tbody>
              </table>
              {filteredItems.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    {t.noItemsFound}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(activeModal === "create" || activeModal === "edit") && (
        <ItemModal
          isOpen={!!activeModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          fieldsSchema={fieldsSchema}
          formData={formData}
          setFormData={setFormData}
          customId={customId}
          setCustomId={setCustomId}
          isEditing={activeModal === "edit"}
          t={t}
          loading={createItemMutation.isPending || updateItemMutation.isPending}
        />
      )}
    </div>
  );
}

function ItemsToolbar({
  selectedCount,
  onDelete,
  onEdit,
  editEnabled,
  mutationLoading,
  t,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 p-3 flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {selectedCount} {t.itemsSelected}
      </span>
      <div className="flex space-x-3">
        <button
          onClick={onEdit}
          disabled={!editEnabled || mutationLoading}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <PencilSquareIcon className="w-5 h-5 mr-2" />
          {t.edit}
        </button>

        <button
          onClick={onDelete}
          disabled={mutationLoading}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-500 dark:hover:bg-red-600"
        >
          <TrashIcon className="w-5 h-5 mr-2" />
          {mutationLoading ? t.deleting : t.deleteSelected}
        </button>
      </div>
    </div>
  );
}

function ItemRow({ item, fieldsSchema, isSelected, onSelect, isOwner }) {
  return (
    <tr
      className={`transition-colors duration-150 ${
        isSelected
          ? "bg-indigo-50 dark:bg-indigo-900/50"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
      }`}
    >
      {isOwner && (
        <td className="relative w-12 px-6 sm:w-16 sm:px-8">
          <input
            type="checkbox"
            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
            checked={isSelected}
            onChange={onSelect}
          />
        </td>
      )}
      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
        {item.custom_id || (
          <span className="text-gray-400 dark:text-gray-500">N/A</span>
        )}
      </td>
      {fieldsSchema.map((field) => (
        <td
          key={field.key}
          className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300"
        >
          <RenderFieldValue field={field} value={item[field.key]} />
        </td>
      ))}
    </tr>
  );
}

function ItemModal({
  isOpen,
  onClose,
  onSubmit,
  fieldsSchema,
  formData,
  setFormData,
  customId,
  setCustomId,
  isEditing,
  t,
  loading,
}) {
  if (!isOpen) return null;

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={onSubmit}>
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="w-full">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4"
                  id="modal-title"
                >
                  {isEditing ? t.editItem : t.addNewItem}
                </h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.customIdOptional}
                    </label>
                    <input
                      type="text"
                      value={customId}
                      onChange={(e) => setCustomId(e.target.value)}
                      placeholder={t.customIdPlaceholder}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {fieldsSchema.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                      </label>
                      <DynamicInput
                        field={field}
                        value={formData[field.key]}
                        onChange={(val) => handleInputChange(field.key, val)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? t.saving : isEditing ? t.saveChanges : t.createItem}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function DynamicInput({ field, value, onChange }) {
  const commonProps = {
    className:
      "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
  };

  switch (field.type) {
    case "string":
    case "link":
    case "number":
      return (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          {...commonProps}
        />
      );
    case "text":
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          {...commonProps}
        />
      );
    case "boolean":
      return (
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500"
          />
        </div>
      );
    default:
      return null;
  }
}

function RenderFieldValue({ field, value }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-gray-400 dark:text-gray-500">N/A</span>;
  }

  if (field.type === "boolean") {
    return value ? (
      <CheckIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XMarkIcon className="h-5 w-5 text-red-500" />
    );
  }

  if (field.type === "link" && value) {
    const href = value.startsWith("http") ? value : `https://${value}`;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {value}
      </a>
    );
  }

  return <span className="line-clamp-2 break-words">{String(value)}</span>;
}
