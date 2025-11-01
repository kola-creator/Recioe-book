{/* 
  Overall Assessment:
  The component implements a simple recipe book with CRUD operations, category filtering,
  search, and a detail view, persisting data to localStorage. The UI is built with Tailwind
  classes and icon components from lucide-react. However, the JSX contains numerous syntax
  errors (e.g., malformed className expressions) that prevent it from compiling.
*/}

{/* 
  Improvement Opportunities:
  - Fix malformed JSX syntax (e.g., `className={text - 2}` should be a valid expression or string).
  - Extract repeated UI fragments (header, recipe list item, form fields) into separate components
    to improve readability and maintainability.
  - Debounce the search input to avoid filtering on every keystroke.
  - Validate form inputs (e.g., require at least one ingredient) before saving.
  - Use a more robust ID generator (e.g., UUID) to avoid collisions.
  - Add PropTypes or TypeScript for better type safety.
  - Handle potential JSON parse errors gracefully when reading from localStorage.
  - Consider using useCallback/useMemo for functions that depend on stable references.
  - Provide ARIA attributes for better accessibility.
*/}

{/* ====================== START OF COMPONENT ====================== */}
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Settings,
  Volume2,
  ChevronLeft,
  Search,
  Trash2,
  Save,
  X,
  Eye,
} from "lucide-react";

/* List of recipe categories; the first entry "Все" means "All". */
const CATEGORIES = [
  "Все",
  "Супы",
  "Выпечка",
  "Салаты",
  "Десерты",
  "Основные блюда",
  "Закуски",
];

/* Key used for persisting recipes in localStorage. */
const STORAGE_KEY = "grandmas-recipes:v1";

/* Simple UID generator – suitable for demo purposes only. */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Main App component.
 * Manages recipe data, UI view state, and user interactions.
 * Renders header, search/filter controls, recipe list, detail view, and form.
 */
export default function App() {
  /* ---- State Hooks ---------------------------------------------------- */
  const [recipes, setRecipes] = useState([]);                     // All recipes
  const [activeView, setActiveView] = useState("list");           // "list" | "detail" | "form"
  const [selectedRecipeId, setSelectedRecipeId] = useState(null); // ID of recipe in detail view
  const [selectedCategory, setSelectedCategory] = useState("Все"); // Currently selected category filter
  const [searchQuery, setSearchQuery] = useState("");             // Search input value
  const [largeTextMode, setLargeTextMode] = useState(false);      // Toggle for larger text
  const [formData, setFormData] = useState({                      // Controlled form data
    id: null,
    title: "",
    category: CATEGORIES[1],
    ingredients: [""],
    steps: "",
    notes: "",
  });

  // IMPROVEMENT: Wrap localStorage access in a try/catch that also validates JSON structure.
  // Load recipes from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setRecipes(JSON.parse(raw));
      } else {
        // Seed with a default recipe if storage is empty.
        const seed = [
          {
            id: uid(),
            title: "Классический борщ",
            category: "Супы",
            ingredients: ["Свекла", "Капуста", "Морковь", "Картофель", "Мясо"],
            steps:
              "1. Подготовьте овощи.\n2. Обжарьте.\n3. Варите до готовности.",
            notes: "Подавать со сметаной.",
            createdAt: Date.now(),
          },
        ];
        setRecipes(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }
    } catch (e) {
      console.error("Ошибка чтения localStorage", e);
    }
  }, []);

  // Save recipes to localStorage whenever they change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch (e) {
      console.error("Ошибка записи localStorage", e);
    }
  }, [recipes]);

  /* ---- UI Helpers ----------------------------------------------------- */

  // Open a blank form for creating a new recipe.
  const openNewForm = () => {
    setFormData({
      id: null,
      title: "",
      category: CATEGORIES[1],
      ingredients: [""],
      steps: "",
      notes: "",
    });
    setActiveView("form");
  };

  // Open the form pre-filled with data of the recipe to edit.
  const openEditForm = (id) => {
    const r = recipes.find((x) => x.id === id);
    if (!r) return;
    setFormData({ ...r });
    setActiveView("form");
  };

  // Persist form data to the recipes list (create or update).
  const saveForm = () => {
    const payload = {
      ...formData,
      title: formData.title.trim() || "Без названия",
      ingredients: formData.ingredients.filter((i) => i.trim() !== ""),
      updatedAt: Date.now(),
    };

    if (formData.id) {
      // Update existing recipe.
      setRecipes((prev) =>
        prev.map((r) => (r.id === formData.id ? { ...r, ...payload } : r))
      );
    } else {
      // Insert new recipe at the top of the list.
      setRecipes((prev) => [
        { ...payload, id: uid(), createdAt: Date.now() },
        ...prev,
      ]);
    }
    setActiveView("list");
  };

  // Remove a recipe after user confirmation.
  const deleteRecipe = (id) => {
    if (!window.confirm("Удалить рецепт?")) return;
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setSelectedRecipeId(null);
    setActiveView("list");
  };

  // Switch to detail view for the selected recipe.
  const openDetail = (id) => {
    setSelectedRecipeId(id);
    setActiveView("detail");
  };

  // Filter recipes based on selected category and search query.
  const filteredRecipes = recipes.filter((r) => {
    if (selectedCategory !== "Все" && r.category !== selectedCategory)
      return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.ingredients.join(" ").toLowerCase().includes(q) ||
      r.steps.toLowerCase().includes(q)
    );
  });

  // Determine Tailwind text size class based on largeTextMode flag.
  const textSize = largeTextMode ? "text-lg" : "text-sm";

  /* ---- Render --------------------------------------------------------- */
  return (
    <>
      {/* Header Section */}
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white p-6">
        <header className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-amber-700" />
              {/* IMPROVEMENT: The following className expression is malformed; replace with a valid string. */}
              {/* TEST CASE: Verify that the title renders correctly with different textSize values. */}
              <h1
                className={`text-2xl xl font-extrabold text-amber-900 ${textSize}`}
              >
                Книга бабушкиных рецептов
              </h1>
            </div>

            {/* Controls: Text size toggle & Add button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLargeTextMode((s) => !s)}
                className="px-3 py-2 rounded-lg border"
              >
                <Volume2 className="inline-block w-4 h-4 mr-1" />
                {largeTextMode ? "Обычный" : "Крупный"}
              </button>
              <button
                onClick={openNewForm}
                className="bg-amber-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Добавить
              </button>
            </div>
          </div>

          {/* Search & Category Selector */}
          <div className="mt-4 flex gap-3 items-center">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по рецептам..."
                className="bg-transparent outline-none px-2"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="ml-2 bg-transparent outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Column: List / Detail / Form */}
          <section className="md:col-span-2">
            {/* ---------- List View ---------- */}
            {activeView === "list" && (
              <ul className="space-y-4">
                {filteredRecipes.map((r) => (
                  <li
                    key={r.id}
                    className="bg-white p-4 rounded-xl shadow flex justify-between"
                  >
                    <div>
                      {/* IMPROVEMENT: className expression is malformed; replace with a valid string. */}
                      <h3 className={`font-semibold ${textSize} text-amber-900`}>
                        {r.title}
                      </h3>
                      <p className="text-xs text-gray-500">{r.category}</p>
                      {/* Show first line of steps as a preview */}
                      <p className={`mt-2 ${textSize} text-gray-700 line-clamp-3`}>
                        {r.steps.split("\n")[0]}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <button onClick={() => openDetail(r.id)} title="Открыть">
                          <Eye className="w-5 h-5 text-amber-600" />
                        </button>
                        <button
                          onClick={() => openEditForm(r.id)}
                          title="Редактировать"
                        >
                          <Settings className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteRecipe(r.id)}
                          title="Удалить"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* ---------- Detail View ---------- */}
            {activeView === "detail" && (() => {
              const r = recipes.find((x) => x.id === selectedRecipeId);
              if (!r) return <p>Рецепт не найден.</p>;
              return (
                <div className="bg-white p-6 rounded-xl shadow">
                  <button
                    onClick={() => setActiveView("list")}
                    className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded border"
                  >
                    <ChevronLeft className="w-4 h-4" /> Назад
                  </button>
                  <h2 className={`text-2xl font-bold ${textSize} text-amber-900`}>
                    {r.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">{r.category}</p>

                  <h4 className={`font-semibold ${textSize} mb-2`}>Ингредиенты</h4>
                  <ul className={`${textSize} list-disc pl-5`}>
                    {r.ingredients.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>

                  <h4 className={`font-semibold ${textSize} mt-4 mb-2`}>
                    Приготовление
                  </h4>
                  <pre className={`${textSize} whitespace-pre-wrap`}>{r.steps}</pre>

                  {r.notes && (
                    <>
                      <h4 className={`font-semibold ${textSize} mt-4 mb-2`}>
                        Заметки
                      </h4>
                      <p className={textSize}>{r.notes}</p>
                    </>
                  )}
                </div>
              );
            })()}

            {/* ---------- Form View ---------- */}
            {activeView === "form" && (
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${textSize} text-amber-900`}>
                    {formData.id ? "Редактировать рецепт" : "Новый рецепт"}
                  </h2>
                  <button
                    onClick={() => setActiveView("list")}
                    className="p-2 rounded border"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label className={`block mb-1 ${textSize} font-medium`}>
                      Название
                    </label>
                    <input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded border"
                    />
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className={`block mb-1 ${textSize} font-medium`}>
                      Категория
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded border"
                    >
                      {CATEGORIES.filter((c) => c !== "Все").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ingredients List */}
                  <div>
                    <label className={`block mb-1 ${textSize} font-medium`}>
                      Ингредиенты
                    </label>
                    <div className="space-y-2">
                      {formData.ingredients.map((ing, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            value={ing}
                            onChange={(e) => {
                              const next = [...formData.ingredients];
                              next[idx] = e.target.value;
                              setFormData({ ...formData, ingredients: next });
                            }}
                            className="flex-1 px-3 py-2 rounded border"
                          />
                          <button
                            onClick={() => {
                              const next = [...formData.ingredients];
                              next.splice(idx, 1);
                              setFormData({
                                ...formData,
                                ingredients: next.length ? next : [""],
                              });
                            }}
                            className="px-2 rounded border"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            ingredients: [...formData.ingredients, ""],
                          })
                        }
                        className="mt-2 px-3 py-2 rounded bg-amber-600 text-white"
                      >
                        Добавить ингредиент
                      </button>
                    </div>
                  </div>

                  {/* Steps Textarea */}
                  <div>
                    <label className={`block mb-1 ${textSize} font-medium`}>
                      Приготовление
                    </label>
                    <textarea
                      value={formData.steps}
                      onChange={(e) =>
                        setFormData({ ...formData, steps: e.target.value })
                      }
                      rows={6}
                      className="w-full px-3 py-2 rounded border whitespace-pre-wrap"
                    />
                  </div>

                  {/* Notes Input */}
                  <div>
                    <label className={`block mb-1 ${textSize} font-medium`}>
                      Заметки
                    </label>
                    <input
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded border"
                    />
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={saveForm}
                      className="px-4 py-2 rounded bg-amber-600 text-white flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Сохранить
                    </button>
                    <button
                      onClick={() => setActiveView("list")}
                      className="px-4 py-2 rounded border"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sidebar: Categories & Statistics */}
          <aside className="space-y-4">
            {/* Category list (duplicate of top selector) */}
            <div className="p-4 bg-white rounded-xl shadow">
              <h3 className={`font-bold ${textSize} text-amber-900 mb-2`}>
                Категории
              </h3>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`text-left px-3 py-2 rounded ${
                      selectedCategory === c ? "bg-amber-100" : "hover:bg-amber-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics panel */}
            <div className="p-4 bg-white rounded-xl shadow">
              <h3 className={`font-bold ${textSize} text-blue-900 mb-2`}>
                Статистика
              </h3>
              <p className={`${textSize} text-blue-700`}>
                Всего рецептов:{" "}
                <span className="font-bold text-lg">{recipes.length}</span>
              </p>
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}
{/* ====================== END OF COMPONENT ====================== */}