import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getInventories, createInventory, deleteInventory } from "../utils/api";
import { Link } from "react-router-dom";
import { useLanguage, translations } from "../hooks/useLanguage";
import toast from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/outline";

const TextFieldIcon = () => (
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
      d="M4 6h16M4 12h16M4 18h7"
    />
  </svg>
);

const TextAreaIcon = () => (
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
      d="M4 6h16M4 10h16M4 14h16M4 18h7"
    />
  </svg>
);

const NumberIcon = () => (
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
      d="M9 1C4.523 1 1 4.523 1 9s3.523 8 8 8 8-3.523 8-8-3.523-8-8-8zm0 13c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5zM8 5h2v6H8V5zm0 7h2v2H8v-2z"
      transform="translate(3 3)"
    />
  </svg>
);

const BooleanIcon = () => (
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
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const LinkIcon = () => (
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
      d="M13.828 10.172a4 4 0 01-5.656 0l-4-4a4 4 0 115.656-5.656l1.102 1.101m-1.102-1.101l5.656 5.656a4 4 0 010 5.656l-1.101 1.102"
    />
  </svg>
);

const PlusIcon = () => (
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
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const fieldTypes = [
  { type: "string", icon: <TextFieldIcon />, name: "Single-line text" },
  { type: "text", icon: <TextAreaIcon />, name: "Multi-line text" },
  { type: "number", icon: <NumberIcon />, name: "Number" },
  { type: "boolean", icon: <BooleanIcon />, name: "Checkbox (Yes/No)" },
  { type: "link", icon: <LinkIcon />, name: "Link" },
];

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language, t } = useLanguage();

  const {
    data: inventories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inventories"],
    queryFn: getInventories,
  });

  if (isLoading) return <div>{t.loading}</div>;
  if (error) return <div>{t.error}</div>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.yourInventories}
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
        >
          <PlusIcon />
          <span className="ml-2">{t.newInventory}</span>
        </button>
      </div>

      {inventories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventories.map((inventory) => (
            <InventoryCard
              key={inventory.id}
              inventory={inventory}
              language={language}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            {t.noInventories}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.createFirstInventory}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              <PlusIcon />
              <span className="ml-2">{t.newInventory}</span>
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <CreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          t={t}
          language={language}
        />
      )}
    </div>
  );
}

function useCreateInventory(onClose, t) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      toast.success(t.inventoryCreatedSuccess || "Inventory created!");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || t.error);
    },
  });
}

function CreateModal({ isOpen, onClose, t, language }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [isPublic, setIsPublic] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = (type) => {
    const typeCount = fields.filter((f) => f.type === type).length;
    if (typeCount >= 3) {
      toast.error(
        language === "en"
          ? `You can only add up to 3 fields of type '${type}'.`
          : `Вы можете добавить не более 3 полей типа '${type}'.`
      );
      return;
    }
    setFields((prev) => [
      ...prev,
      { id: Date.now(), type, label: `New ${type} field` },
    ]);
  };

  const removeField = (id) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const updateFieldLabel = (id, newLabel) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, label: newLabel } : field
      )
    );
  };

  const mutation = useCreateInventory(onClose, t);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalSchema = fields.map((f, i) => ({ ...f, order: i }));
    mutation.mutate({
      name,
      description,
      fieldsSchema: finalSchema,
      is_public: isPublic,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-full max-w-3xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {t.createNewInventory}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.inventoryName}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.description}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.visibility}
              </label>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`${
                  isPublic ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    isPublic ? "translate-x-5" : "translate-x-0"
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
              <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                {isPublic ? t.visibilityPublic : t.visibilityPrivate}
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t.fieldConfiguration}
              </h3>
              <div className="flex space-x-2 mt-2 mb-4 overflow-x-auto py-2">
                {fieldTypes.map((ft) => (
                  <button
                    type="button"
                    key={ft.type}
                    onClick={() => addField(ft.type)}
                    className="flex-shrink-0 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {ft.icon}
                    <span className="ml-2">{ft.name}</span>
                  </button>
                ))}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields}
                    strategy={verticalListSortingStrategy}
                  >
                    {fields.map((field) => (
                      <SortableField
                        key={field.id}
                        field={field}
                        onRemove={removeField}
                        onUpdate={updateFieldLabel}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-sm disabled:opacity-50"
              >
                {mutation.isPending ? t.creating : t.createInventory}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SortableField({ field, onRemove, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = fieldTypes.find((ft) => ft.type === field.type)?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm"
    >
      <button
        type="button"
        {...listeners}
        className="cursor-grab p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      >
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <span className="ml-2 text-gray-500 dark:text-gray-400">{Icon}</span>
      <input
        type="text"
        value={field.label}
        onChange={(e) => onUpdate(field.id, e.target.value)}
        className="mx-3 flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />
      <button
        type="button"
        onClick={() => onRemove(field.id)}
        className="p-1 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
      >
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}

function InventoryCard({ inventory, t }) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      toast.success(t.inventoryDeletedSuccess);
    },
    onError: (error) => {
      toast.error(error.message || t.error);
    },
  });

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(t.confirmDeleteInventory)) {
      deleteMutation.mutate(inventory.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl group">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
          <Link
            to={`/inventory/${inventory.id}`}
            className="flex-1 min-w-0 mr-4"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate">
              {inventory.name}
            </h3>
          </Link>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                inventory.is_public
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {inventory.is_public ? t.public : t.private}
            </span>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="p-1 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              aria-label="Delete inventory"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {inventory.description}
        </p>

        {inventory.fieldsSchema && inventory.fieldsSchema.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {inventory.fieldsSchema.slice(0, 4).map((field) => (
              <span
                key={field.key}
                className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
              >
                {field.label}
              </span>
            ))}
            {inventory.fieldsSchema.length > 4 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs">
                +{inventory.fieldsSchema.length - 4} {t.more}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {inventory.fieldsSchema?.length || 0} {t.fields}
        </span>
        <Link
          to={`/inventory/${inventory.id}`}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
        >
          {t.open}
        </Link>
      </div>
    </div>
  );
}
