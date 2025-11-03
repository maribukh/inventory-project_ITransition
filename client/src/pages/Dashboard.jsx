import React, { useState, useMemo } from "react";
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
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../hooks/useAuth"; // <-- ИМПОРТ
import toast from "react-hot-toast";
import {
  TrashIcon,
  PlusIcon,
  ListBulletIcon,
  CubeIcon,
  UserCircleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

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

const fieldTypes = [
  { type: "string", icon: <TextFieldIcon />, name: "Single-line text" },
  { type: "text", icon: <TextAreaIcon />, name: "Multi-line text" },
  { type: "number", icon: <NumberIcon />, name: "Number" },
  { type: "boolean", icon: <BooleanIcon />, name: "Checkbox (Yes/No)" },
  { type: "link", icon: <LinkIcon />, name: "Link" },
];

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth(); // Получаем текущего пользователя

  const {
    data: inventories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inventories"],
    queryFn: getInventories,
  });

  // Логика разделения инвентарей
  const { myInventories, publicInventories } = useMemo(() => {
    if (!user || inventories.length === 0) {
      return { myInventories: [], publicInventories: [] };
    }
    const my = inventories.filter((inv) => inv.user_id === user.uid);
    const pub = inventories.filter((inv) => inv.user_id !== user.uid);
    return { myInventories: my, publicInventories: pub };
  }, [inventories, user]);

  if (isLoading) return <div className="text-center p-8">{t.loading}</div>;
  if (error)
    return <div className="text-center p-8 text-red-500">{t.error}</div>;

  return (
    <div className="w-full">
      {/* Секция "Мои инвентари" */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.myInventories}
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="ml-2 font-medium">{t.newInventory}</span>
        </button>
      </div>
      {myInventories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myInventories.map((inventory) => (
            <InventoryCard
              key={inventory.id}
              inventory={inventory}
              t={t}
              isOwner={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <CubeIcon className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {t.noInventories}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{t.createFirstInventory}</p>
        </div>
      )}

      {/* Секция "Публичные инвентари" */}
      <div className="mt-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t.publicInventories || "Public Inventories"}
        </h1>
        {publicInventories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicInventories.map((inventory) => (
              <InventoryCard
                key={inventory.id}
                inventory={inventory}
                t={t}
                isOwner={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <CubeIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {t.noPublicInventories || "No Public Inventories Found"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t.checkBackLater || "Check back later or create your own!"}
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          t={t}
        />
      )}
    </div>
  );
}

function InventoryCard({ inventory, t, isOwner }) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      toast.success(t.inventoryDeletedSuccess);
    },
    onError: (error) => toast.error(error.message || t.error),
  });

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(t.confirmDeleteInventory)) {
      deleteMutation.mutate(inventory.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
      <div className="p-5 flex justify-between items-start">
        <div className="flex-1 min-w-0 mr-4">
          <span
            className={`inline-flex items-center mb-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              inventory.is_public
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {inventory.is_public ? t.public : t.private}
          </span>
          <Link to={`/inventory/${inventory.id}`}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {inventory.name}
            </h3>
          </Link>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-1.5 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-5 pb-5 flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[40px]">
          {inventory.description || (
            <span className="italic">No description</span>
          )}
        </p>
      </div>

      <div className="px-5 pb-5 mt-auto border-t border-gray-100 dark:border-gray-700/50 pt-4">
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            <ListBulletIcon className="h-5 w-5" />
            <span>
              {inventory.fieldsSchema?.length || 0} {t.fields}
            </span>
          </div>
          {!isOwner && (
            <div
              className="flex items-center space-x-3"
              title={inventory.user_email}
            >
              <UserCircleIcon className="h-5 w-5" />
              <span className="truncate max-w-[120px]">
                {inventory.user_email}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="p-2">
        <Link
          to={`/inventory/${inventory.id}`}
          className="w-full text-center block px-4 py-2 bg-indigo-50 dark:bg-gray-700/50 text-indigo-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-700 transition-all duration-300"
        >
          {t.open}
        </Link>
      </div>
    </div>
  );
}

// МОДАЛЬНОЕ ОКНО СОЗДАНИЯ (возвращено из вашей версии)
function CreateModal({ isOpen, onClose, t }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const { language } = useLanguage();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      toast.success(t.inventoryCreatedSuccess);
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

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
    if (fields.filter((f) => f.type === type).length >= 3) {
      toast.error(
        language === "en"
          ? `Max 3 fields of type '${type}'.`
          : `Максимум 3 поля типа '${type}'.`
      );
      return;
    }
    setFields((prev) => [...prev, { id: Date.now(), type, label: "" }]);
  };
  const removeField = (id) =>
    setFields((prev) => prev.filter((field) => field.id !== id));
  const updateFieldLabel = (id, newLabel) =>
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, label: newLabel } : field
      )
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalSchema = fields.map((f, i) => ({
      ...f,
      order: i,
      label: f.label || `Custom ${f.type} #${i + 1}`,
    }));
    mutation.mutate({
      name,
      description,
      fieldsSchema: finalSchema,
      is_public: isPublic,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60">
      <div className="flex items-center justify-center min-h-screen p-4">
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
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t.inventoryName}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={t.description}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.visibility}
              </label>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`${
                  isPublic ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200`}
              >
                <span
                  className={`${
                    isPublic ? "translate-x-5" : "translate-x-0"
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200`}
                />
              </button>
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
                disabled={mutation.isPending || !name}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md hover:from-indigo-700 hover:to-purple-700 shadow-sm disabled:opacity-50"
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
  const style = { transform: CSS.Transform.toString(transform), transition };
  const Icon = fieldTypes.find((ft) => ft.type === field.type)?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
    >
      <button
        type="button"
        {...listeners}
        className="cursor-grab p-1 text-gray-400"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <span className="ml-2 text-gray-500 dark:text-gray-400">{Icon}</span>
      <input
        type="text"
        value={field.label}
        onChange={(e) => onUpdate(field.id, e.target.value)}
        placeholder="Field Label"
        className="mx-3 flex-1 px-2 py-1 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />
      <button
        type="button"
        onClick={() => onRemove(field.id)}
        className="p-1 text-red-400 hover:text-red-600"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
