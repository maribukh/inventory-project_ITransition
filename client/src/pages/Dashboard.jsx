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
import { getInventories, createInventory } from "../utils/api";
import { Link } from "react-router-dom";
import { useLanguage, translations } from "../hooks/useLanguage";
import toast from "react-hot-toast";

function SortableField({ field, index, onUpdate, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex gap-3 items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 mb-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
      >
        ⠿
      </div>
      <input
        value={field.label}
        onChange={(e) => onUpdate(index, { ...field, label: e.target.value })}
        placeholder="Field label"
        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium">
        {field.type}
      </span>
      <button
        type="button"
        onClick={() => onRemove(field.key)}
        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Remove
      </button>
    </li>
  );
}

export default function Dashboard() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [fieldsSchema, setFieldsSchema] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const t = translations[language];

  const {
    data: inventories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inventories"],
    queryFn: getInventories,
    retry: 1,
  });

  const createInventoryMutation = useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      toast.success(
        language === "en"
          ? "Inventory created successfully!"
          : "Инвентарь успешно создан!"
      );
      setName("");
      setDesc("");
      setFieldsSchema([]);
      setIsCreating(false);
    },
    onError: (error) => {
      console.error("Create inventory error:", error);
      toast.error(error.message || t.error);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function addField(type) {
    const countOfType = fieldsSchema.filter((f) => f.type === type).length;
    if (countOfType >= 3) {
      toast.error(
        language === "en"
          ? `Maximum 3 ${type} fields allowed`
          : `Максимум 3 поля типа ${type}`
      );
      return;
    }
    const keyBase = `${type}_${Date.now().toString(36).slice(-4)}`;
    setFieldsSchema([
      ...fieldsSchema,
      {
        type,
        key: keyBase,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      },
    ]);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFieldsSchema((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function updateField(index, updatedField) {
    const newFields = [...fieldsSchema];
    newFields[index] = updatedField;
    setFieldsSchema(newFields);
  }

  function removeField(key) {
    setFieldsSchema(fieldsSchema.filter((field) => field.key !== key));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(
        language === "en"
          ? "Inventory name is required"
          : "Название инвентаря обязательно"
      );
      return;
    }

    createInventoryMutation.mutate({
      name: name.trim(),
      description: desc.trim(),
      fieldsSchema,
    });
  }

  const fieldTypes = [
    { type: "string", label: "Text", color: "bg-blue-500" },
    { type: "text", label: "Text Area", color: "bg-green-500" },
    { type: "number", label: "Number", color: "bg-purple-500" },
    { type: "boolean", label: "Boolean", color: "bg-yellow-500" },
    { type: "link", label: "Link", color: "bg-pink-500" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          {t.loading}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-red-600">
          {language === "en"
            ? "Error loading inventories:"
            : "Ошибка загрузки инвентарей:"}{" "}
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.myInventories}
        </h1>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {isCreating ? t.cancel : t.newInventory}
        </button>
      </div>

      {/* Create Inventory Form */}
      {isCreating && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            {t.createNewInventory}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.inventoryName} *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  language === "en"
                    ? "e.g., Office Equipment, Book Collection..."
                    : "например, Офисное оборудование, Коллекция книг..."
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.description}
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={
                  language === "en"
                    ? "Describe what this inventory will track..."
                    : "Опишите, что будет отслеживать этот инвентарь..."
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            {/* Field Type Buttons */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.addCustomFields}
              </label>
              <div className="flex flex-wrap gap-2">
                {fieldTypes.map(({ type, label, color }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addField(type)}
                    className={`px-4 py-2 ${color} text-white rounded-lg hover:opacity-90 transition-opacity font-medium`}
                  >
                    + {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields Schema List */}
            {fieldsSchema.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.fieldConfiguration} ({fieldsSchema.length} {t.fields})
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {t.dragToReorder}
                  </span>
                </label>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fieldsSchema.map((f) => f.key)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="space-y-2">
                      {fieldsSchema.map((field, index) => (
                        <SortableField
                          key={field.key}
                          field={field}
                          index={index}
                          onUpdate={updateField}
                          onRemove={removeField}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={createInventoryMutation.isPending || !name.trim()}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {createInventoryMutation.isPending
                  ? t.creating
                  : t.createInventory}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventories List */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          {t.yourInventories} ({inventories.length})
        </h2>
        {inventories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg
                className="mx-auto h-16 w-16"
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
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              {t.noInventories}
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              {t.createFirstInventory}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inventories.map((inv) => (
              <div
                key={inv.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <Link
                      to={`/inventory/${inv.id}`}
                      className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors block mb-2"
                    >
                      {inv.name}
                    </Link>
                    {inv.description && (
                      <div className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {inv.description}
                      </div>
                    )}
                    {inv.fieldsSchema?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {inv.fieldsSchema.slice(0, 4).map((field) => (
                          <span
                            key={field.key}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                          >
                            {field.label}
                          </span>
                        ))}
                        {inv.fieldsSchema.length > 4 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                            +{inv.fieldsSchema.length - 4}{" "}
                            {language === "en" ? "more" : "еще"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {inv.fieldsSchema?.length || 0} {t.fields}
                    </span>
                    <Link
                      to={`/inventory/${inv.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      {t.manage}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
