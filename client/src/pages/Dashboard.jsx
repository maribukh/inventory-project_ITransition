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

// Beautiful SVG Icons for Dashboard
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
      d="M4 6h16M4 12h16M4 18h16"
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
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01m12-.01V12a9 9 0 00-9-9m9 9H3"
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
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

const DragIcon = () => (
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
      d="M4 8h16M4 16h16"
    />
  </svg>
);

const AddIcon = () => (
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

const DeleteIcon = () => (
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
);

const LoadingIcon = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const InventoryIcon = () => (
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
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

function SortableField({ field, index, onUpdate, onRemove, fieldTypeCounts }) {
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

  const getFieldTypeConfig = (type) => {
    const configs = {
      string: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700",
        icon: <TextFieldIcon />,
      },
      text: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700",
        icon: <TextAreaIcon />,
      },
      number: {
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-700",
        icon: <NumberIcon />,
      },
      boolean: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700",
        icon: <BooleanIcon />,
      },
      link: {
        color:
          "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border-pink-200 dark:border-pink-700",
        icon: <LinkIcon />,
      },
    };
    return configs[type] || configs.string;
  };

  const config = getFieldTypeConfig(field.type);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex gap-3 items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 mb-3 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <DragIcon />
      </div>

      <div className="flex-1 min-w-0">
        <input
          value={field.label}
          onChange={(e) => onUpdate(index, { ...field, label: e.target.value })}
          placeholder="Enter field name..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {field.type === "string" && "Short text input"}
          {field.type === "text" && "Multi-line text area"}
          {field.type === "number" && "Numeric value"}
          {field.type === "boolean" && "Yes/No checkbox"}
          {field.type === "link" && "URL link"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.color} gap-2`}
        >
          {config.icon}
          {field.type}
          <span className="text-xs opacity-75">
            ({fieldTypeCounts[field.type]}/3)
          </span>
        </span>
        <button
          type="button"
          onClick={() => onRemove(field.key)}
          className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
          title="Remove field"
        >
          <DeleteIcon />
        </button>
      </div>
    </li>
  );
}

function FieldTypeButton({
  type,
  label,
  description,
  icon,
  color,
  onClick,
  disabled,
  currentCount,
}) {
  const getButtonStyles = () => {
    const base =
      "flex items-center p-4 rounded-xl border-2 border-dashed transition-all duration-200 group ";
    if (disabled) {
      return (
        base +
        "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
      );
    }

    const colorStyles = {
      blue: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-md cursor-pointer",
      green:
        "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 hover:shadow-md cursor-pointer",
      purple:
        "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:shadow-md cursor-pointer",
      yellow:
        "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:border-yellow-300 dark:hover:border-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:shadow-md cursor-pointer",
      pink: "border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 hover:border-pink-300 dark:hover:border-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:shadow-md cursor-pointer",
    };

    return base + colorStyles[color];
  };

  const getIconBg = () => {
    const colorStyles = {
      blue: "bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/70",
      green:
        "bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-900/70",
      purple:
        "bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/70",
      yellow:
        "bg-yellow-100 dark:bg-yellow-900/50 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/70",
      pink: "bg-pink-100 dark:bg-pink-900/50 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/70",
    };
    return colorStyles[color];
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={getButtonStyles()}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-lg ${getIconBg()} transition-colors duration-200`}
          >
            {icon}
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm">{label}</div>
            <div className="text-xs opacity-75 mt-1">{description}</div>
          </div>
        </div>
        <div className="text-xs opacity-60 font-medium">{currentCount}/3</div>
      </div>
    </button>
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
      resetForm();
    },
    onError: (error) => {
      console.error("Create inventory error:", error);
      toast.error(error.message || t.error);
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      toast.success(
        language === "en"
          ? "Inventory deleted successfully!"
          : "Инвентарь успешно удален!"
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete inventory");
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

  const fieldTypeCounts = fieldsSchema.reduce((acc, field) => {
    acc[field.type] = (acc[field.type] || 0) + 1;
    return acc;
  }, {});

  const fieldTypes = [
    {
      type: "string",
      label: "Text Field",
      description: "Short text input",
      icon: <TextFieldIcon />,
      color: "blue",
    },
    {
      type: "text",
      label: "Text Area",
      description: "Multi-line text",
      icon: <TextAreaIcon />,
      color: "green",
    },
    {
      type: "number",
      label: "Number",
      description: "Numeric value",
      icon: <NumberIcon />,
      color: "purple",
    },
    {
      type: "boolean",
      label: "Checkbox",
      description: "Yes/No toggle",
      icon: <BooleanIcon />,
      color: "yellow",
    },
    {
      type: "link",
      label: "Link",
      description: "URL address",
      icon: <LinkIcon />,
      color: "pink",
    },
  ];

  function addField(type) {
    if (fieldTypeCounts[type] >= 3) {
      toast.error(
        language === "en"
          ? `Maximum 3 ${type} fields allowed`
          : `Максимум 3 поля типа ${type}`
      );
      return;
    }

    const defaultLabels = {
      string: "Text Field",
      text: "Description",
      number: "Number",
      boolean: "Enabled",
      link: "Website",
    };

    const key = `custom_${type}${(fieldTypeCounts[type] || 0) + 1}`;
    setFieldsSchema([
      ...fieldsSchema,
      {
        type,
        key,
        label: defaultLabels[type],
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

  function resetForm() {
    setName("");
    setDesc("");
    setFieldsSchema([]);
    setIsCreating(false);
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

  function handleDeleteInventory(inventoryId, inventoryName) {
    if (
      window.confirm(
        language === "en"
          ? `Delete inventory "${inventoryName}"? This action cannot be undone.`
          : `Удалить инвентарь "${inventoryName}"? Это действие нельзя отменить.`
      )
    ) {
      deleteInventoryMutation.mutate(inventoryId);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
          <LoadingIcon />
          <div className="text-lg">{t.loading}</div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.myInventories}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {language === "en"
                ? "Manage your inventory collections and track items"
                : "Управляйте коллекциями инвентаря и отслеживайте элементы"}
            </p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            {isCreating ? (
              <>
                <DeleteIcon />
                <span className="ml-2">{t.cancel}</span>
              </>
            ) : (
              <>
                <AddIcon />
                <span className="ml-2">{t.newInventory}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Create Inventory Form */}
      {isCreating && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            {t.createNewInventory}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            </div>

            {/* Field Type Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.addCustomFields}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {fieldTypes.map((fieldType) => (
                  <FieldTypeButton
                    key={fieldType.type}
                    {...fieldType}
                    onClick={() => addField(fieldType.type)}
                    disabled={fieldTypeCounts[fieldType.type] >= 3}
                    currentCount={fieldTypeCounts[fieldType.type] || 0}
                  />
                ))}
              </div>
            </div>

            {/* Fields Schema List */}
            {fieldsSchema.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.fieldConfiguration} ({fieldsSchema.length} {t.fields})
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t.dragToReorder}
                  </span>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fieldsSchema.map((f) => f.key)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="space-y-3">
                      {fieldsSchema.map((field, index) => (
                        <SortableField
                          key={field.key}
                          field={field}
                          index={index}
                          onUpdate={updateField}
                          onRemove={removeField}
                          fieldTypeCounts={fieldTypeCounts}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={createInventoryMutation.isPending || !name.trim()}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm hover:shadow-md"
              >
                {createInventoryMutation.isPending ? (
                  <>
                    <LoadingIcon />
                    <span className="ml-2">{t.creating}</span>
                  </>
                ) : (
                  t.createInventory
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventories List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t.yourInventories}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {inventories.length}{" "}
            {language === "en" ? "inventories" : "инвентарей"}
          </span>
        </div>

        {inventories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-gray-300 dark:text-gray-600 mb-4">
              <InventoryIcon />
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              {t.noInventories}
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-sm mb-6">
              {t.createFirstInventory}
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <AddIcon />
              <span className="ml-2">{t.createNewInventory}</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inventories.map((inv) => (
              <InventoryCard
                key={inv.id}
                inventory={inv}
                language={language}
                onDelete={handleDeleteInventory}
                isDeleting={deleteInventoryMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryCard({ inventory, language, onDelete, isDeleting }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600 group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <Link
              to={`/inventory/${inventory.id}`}
              className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors line-clamp-2"
            >
              {inventory.name}
            </Link>
            <div
              className={`flex items-center space-x-1 transition-opacity duration-200 ${
                showActions ? "opacity-100" : "opacity-0"
              }`}
            >
              <button
                onClick={() => onDelete(inventory.id, inventory.name)}
                disabled={isDeleting}
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                title={
                  language === "en" ? "Delete inventory" : "Удалить инвентарь"
                }
              >
                <DeleteIcon />
              </button>
            </div>
          </div>

          {inventory.description && (
            <div className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
              {inventory.description}
            </div>
          )}

          {inventory.fieldsSchema?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
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
                  +{inventory.fieldsSchema.length - 4}{" "}
                  {language === "en" ? "more" : "еще"}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {inventory.fieldsSchema?.length || 0}{" "}
            {language === "en" ? "fields" : "полей"}
          </span>
          <Link
            to={`/inventory/${inventory.id}`}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
          >
            {language === "en" ? "Manage" : "Управлять"}
          </Link>
        </div>
      </div>
    </div>
  );
}
