import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getItems, updateInventory } from "../utils/api";
import { useLanguage } from "../hooks/useLanguage";
import toast from "react-hot-toast";
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
import { Bars3Icon, TrashIcon } from "@heroicons/react/24/outline";

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

export default function EditInventoryPage() {
  const { id: inventoryId } = useParams();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [isPublic, setIsPublic] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["items", inventoryId],
    queryFn: () => getItems(inventoryId),
  });

  useEffect(() => {
    if (data?.inventory) {
      const { inventory } = data;
      setName(inventory.name || "");
      setDescription(inventory.description || "");
      setIsPublic(inventory.is_public || false);
      const mappedFields = inventory.fieldsSchema.map((f) => ({
        ...f,
        id: f.key,
      }));
      setFields(mappedFields || []);
    }
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const mutation = useMutation({
    mutationFn: (updatedData) => updateInventory(inventoryId, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      queryClient.invalidateQueries({ queryKey: ["items", inventoryId] });
      toast.success(
        t.inventoryUpdatedSuccess || "Inventory updated successfully!"
      );
      navigate(`/inventory/${inventoryId}`);
    },
    onError: (err) => toast.error(err.message || t.error),
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
      type: f.type,
      label: f.label || `Custom ${f.type} ${i + 1}`,
    }));
    mutation.mutate({
      name,
      description,
      fieldsSchema: finalSchema,
      is_public: isPublic,
    });
  };

  if (isLoading) return <div className="text-center p-8">{t.loading}</div>;
  if (error)
    return <div className="text-center p-8 text-red-500">{t.error}</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.editInventory || "Edit Inventory"}
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">{name}</p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/inventory/${inventoryId}`)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !name}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? t.saving : t.saveChanges}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">{t.manage}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.inventoryName}*
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.description}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">{t.fields}</h2>
              <div className="min-h-[200px] space-y-3">
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
                {fields.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                    {t.addCustomFields}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">{t.visibility}</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isPublic ? t.visibilityPublic : t.visibilityPrivate}
                </span>
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
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">
                {t.addCustomFields}
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {fieldTypes.map((ft) => (
                  <button
                    type="button"
                    key={ft.type}
                    onClick={() => addField(ft.type)}
                    className="w-full flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-indigo-500">{ft.icon}</span>
                    <span className="ml-3">{ft.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
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
      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
    >
      <button
        type="button"
        {...listeners}
        className="cursor-grab p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <span className="ml-2 text-gray-500 dark:text-gray-400">{Icon}</span>
      <input
        type="text"
        value={field.label}
        onChange={(e) => onUpdate(field.id, e.target.value)}
        placeholder={`Field Label (${field.type})`}
        className="mx-3 flex-1 px-2 py-1 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />
      <button
        type="button"
        onClick={() => onRemove(field.id)}
        className="p-1 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
