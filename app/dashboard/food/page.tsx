"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Check, CheckCircle, Leaf, Search, User, UtensilsCrossed, X } from "lucide-react"
import { PatientFormFields, PatientFormValues } from "@/components/patient-form-fields"
import { ResultCard } from "@/components/result-card"
import {
  AdminDish,
  DishIngredient,
  FoodSearchItem,
  FoodPredictRequest,
  FoodPredictResponse,
  getAdminDishes,
  getModels,
  ModelInfo,
  predictFood,
  searchFoods,
} from "@/lib/api"

const DEFAULT_FORM: PatientFormValues = {
  gender: "Female",
  age: 0,
  height_cm: 0,
  weight_kg: 0,
  hypertension: 0,
  heart_disease: 0,
  smoking_history: "No Info",
  selectedModel: "rf",
}

const MODEL_LABELS: Record<string, string> = {
  rf: "Random Forest",
  lr: "Logistic Regression",
  svm: "SVM",
  xgb: "XGBoost",
}

function ingredientName(item: Pick<DishIngredient, "name" | "display_name">) {
  return item.display_name || item.name
}

export default function FoodPage() {
  const [models, setModels] = useState<Record<string, ModelInfo>>({})
  const [form, setForm] = useState<PatientFormValues>(DEFAULT_FORM)
  const [selectedModel, setSelectedModel] = useState("rf")

  const [dishes, setDishes] = useState<AdminDish[]>([])
  const [dishesLoading, setDishesLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [selected, setSelected] = useState<Record<string, AdminDish>>({})
  const [allIngredients, setAllIngredients] = useState<FoodSearchItem[]>([])
  const [ingredientFilter, setIngredientFilter] = useState("")
  const [ingredientsLoading, setIngredientsLoading] = useState(true)
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, DishIngredient>>({})

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FoodPredictResponse | null>(null)

  useEffect(() => {
    getModels().then((m) => {
      setModels(m)
      const defaultKey = Object.entries(m).find(([, v]) => v.default)?.[0] ?? Object.keys(m)[0]
      if (defaultKey) {
        setForm((f) => ({ ...f, selectedModel: defaultKey }))
        setSelectedModel(defaultKey)
      }
    })

    getAdminDishes()
      .then(setDishes)
      .finally(() => setDishesLoading(false))

    searchFoods("")
      .then(setAllIngredients)
      .finally(() => setIngredientsLoading(false))
  }, [])

  const filteredDishes = filter.trim()
    ? dishes.filter((dish) => dish.name.toLowerCase().includes(filter.toLowerCase()))
    : dishes

  const selectedDishes = useMemo(() => Object.values(selected), [selected])
  const selectedIngredients = useMemo(() => Object.values(checkedIngredients), [checkedIngredients])
  const filteredIngredients = ingredientFilter.trim()
    ? allIngredients.filter((item) => item.name.toLowerCase().includes(ingredientFilter.toLowerCase()))
    : allIngredients

  function toggleDish(dish: AdminDish) {
    setSelected((prev) => {
      if (prev[dish.id]) {
        const next = { ...prev }
        delete next[dish.id]
        const remainingDishes = Object.values(next)
        setCheckedIngredients((prevIngredients) => {
          const nextIngredients = { ...prevIngredients }
          for (const ingredient of dish.ingredients) {
            const usedByOtherDish = remainingDishes.some((otherDish) =>
              otherDish.ingredients.some((item) => item.name === ingredient.name)
            )
            if (!usedByOtherDish) delete nextIngredients[ingredient.name]
          }
          return nextIngredients
        })
        return next
      }
      setCheckedIngredients((prevIngredients) => {
        const nextIngredients = { ...prevIngredients }
        for (const ingredient of dish.ingredients) {
          nextIngredients[ingredient.name] = ingredient
        }
        return nextIngredients
      })
      return { ...prev, [dish.id]: dish }
    })
  }

  function removeDish(id: string) {
    setSelected((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    const dish = selected[id]
    if (!dish) return
    const remainingDishes = Object.values(selected).filter((item) => item.id !== id)
    setCheckedIngredients((prevIngredients) => {
      const nextIngredients = { ...prevIngredients }
      for (const ingredient of dish.ingredients) {
        const usedByOtherDish = remainingDishes.some((otherDish) =>
          otherDish.ingredients.some((item) => item.name === ingredient.name)
        )
        if (!usedByOtherDish) delete nextIngredients[ingredient.name]
      }
      return nextIngredients
    })
  }

  function toggleIngredient(food: FoodSearchItem) {
    setCheckedIngredients((prev) => {
      if (prev[food.name]) {
        const next = { ...prev }
        delete next[food.name]
        return next
      }
      return {
        ...prev,
        [food.name]: {
          ...food,
          amount: 100,
        },
      }
    })
  }

  function updateIngredientAmount(name: string, amount: number) {
    setCheckedIngredients((prev) => ({
      ...prev,
      [name]: { ...prev[name], amount },
    }))
  }

  function computeNutrition() {
    return selectedIngredients.reduce(
      (acc, item) => {
        const r = item.amount / 100
        return {
          calories: acc.calories + item.calories * r,
          carbs: acc.carbs + item.carbohydrate * r,
          sugars: acc.sugars + item.sugars * r,
          fiber: acc.fiber + item.fiber * r,
          protein: acc.protein + item.protein * r,
          fat: acc.fat + item.fat * r,
        }
      },
      { calories: 0, carbs: 0, sugars: 0, fiber: 0, protein: 0, fat: 0 }
    )
  }

  const nutrition = computeNutrition()
  const availableModels = Object.entries(models).filter(([, m]) => m.available)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedIngredients.length === 0) {
      setError("Дор хаяж 1 хоол сонгоно уу")
      return
    }
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const body: FoodPredictRequest = {
        foods: selectedIngredients.map((item) => ({ name: item.name, amount: item.amount })),
        gender: form.gender,
        age: form.age,
        hypertension: form.hypertension,
        heart_disease: form.heart_disease,
        smoking_history: form.smoking_history,
        height_cm: form.height_cm,
        weight_kg: form.weight_kg,
        model: selectedModel,
      }
      const res = await predictFood(body)
      setResult(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  const nutrientItems = [
    { label: "Калори", val: nutrition.calories.toFixed(0), unit: "ккал", color: "text-orange-600 bg-orange-50", bar: Math.min(100, (nutrition.calories / 2000) * 100) },
    { label: "Нүүрс ус", val: nutrition.carbs.toFixed(1), unit: "г", color: "text-blue-600 bg-blue-50", bar: Math.min(100, (nutrition.carbs / 300) * 100) },
    { label: "Чихэр", val: nutrition.sugars.toFixed(1), unit: "г", color: "text-pink-600 bg-pink-50", bar: Math.min(100, (nutrition.sugars / 50) * 100) },
    { label: "Эслэг", val: nutrition.fiber.toFixed(1), unit: "г", color: "text-green-600 bg-green-50", bar: Math.min(100, (nutrition.fiber / 30) * 100) },
    { label: "Уураг", val: nutrition.protein.toFixed(1), unit: "г", color: "text-violet-600 bg-violet-50", bar: Math.min(100, (nutrition.protein / 50) * 100) },
    { label: "Өөх тос", val: nutrition.fat.toFixed(1), unit: "г", color: "text-yellow-600 bg-yellow-50", bar: Math.min(100, (nutrition.fat / 65) * 100) },
  ]

  function ingredientLabel(item: DishIngredient) {
    return `${ingredientName(item)} ${item.amount}г`
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Хоолны эрсдэл</h1>
        <p className="text-slate-500 text-sm mt-0.5">Админ самбарт бүртгэсэн хоолны орцоор чихрийн шижингийн эрсдэлийг тооцоолно</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Leaf size={15} className="text-orange-500" />
                  </div>
                  <h2 className="font-semibold text-slate-800 text-sm">Хоол сонгох</h2>
                  {!dishesLoading && (
                    <span className="text-xs text-slate-400">{dishes.length} хоол</span>
                  )}
                </div>
                {selectedDishes.length > 0 && (
                  <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {selectedDishes.length} сонгосон
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Бүртгэсэн хоол шүүх..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all bg-slate-50"
                />

                {dishesLoading ? (
                  <div className="flex items-center justify-center py-10 gap-3">
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-slate-400">Хоолны жагсаалт ачааллаж байна...</span>
                  </div>
                ) : filteredDishes.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    Хоол олдсонгүй. Эхлээд админ самбарт хоол, орц бүртгэнэ үү.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                    {filteredDishes.map((dish) => {
                      const isSelected = !!selected[dish.id]
                      return (
                        <button
                          key={dish.id}
                          type="button"
                          onClick={() => toggleDish(dish)}
                          className={`relative text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                            isSelected
                              ? "border-teal-400 bg-teal-50"
                              : "border-slate-100 bg-slate-50 hover:border-teal-200 hover:bg-teal-50/40"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                              <Check size={12} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                          <span className={`font-semibold block pr-7 ${isSelected ? "text-teal-800" : "text-slate-800"}`}>
                            {dish.name}
                          </span>
                          <span className="text-xs text-slate-400 mt-1 block">{dish.ingredients.length} орц</span>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {dish.ingredients.slice(0, 4).map((item) => (
                              <span key={`${dish.id}-${item.name}`} className="text-[11px] bg-white border border-slate-100 rounded-full px-2 py-0.5 text-slate-500">
                                {ingredientLabel(item)}
                              </span>
                            ))}
                            {dish.ingredients.length > 4 && (
                              <span className="text-[11px] text-slate-400">+{dish.ingredients.length - 4}</span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {selectedDishes.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center">
                    <UtensilsCrossed size={15} className="text-teal-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800 text-sm">Орц сонгох</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Сонгосон хоолтой холбоотой орцууд автоматаар check хийгдэнэ
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {selectedDishes.map((dish) => (
                    <div key={dish.id} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{dish.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{dish.ingredients.length} холбосон орц</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDish(dish.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                          <X size={14} className="text-red-500" />
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {dish.ingredients.map((item) => (
                          <span key={`${dish.id}-${item.name}`} className="text-xs bg-white border border-slate-100 rounded-full px-2 py-1 text-slate-500">
                            {ingredientLabel(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={ingredientFilter}
                      onChange={(e) => setIngredientFilter(e.target.value)}
                      placeholder="Бүх орцноос хайх..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all bg-slate-50"
                    />
                  </div>

                  {ingredientsLoading ? (
                    <div className="text-center py-8 text-sm text-slate-400">Орцууд ачааллаж байна...</div>
                  ) : filteredIngredients.length === 0 ? (
                    <div className="text-center py-8 text-sm text-slate-400">Орц олдсонгүй</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                      {filteredIngredients.map((food) => {
                        const checked = checkedIngredients[food.name]
                        return (
                          <div
                            key={food.name}
                            className={`rounded-xl border-2 px-3 py-2.5 transition-all ${
                              checked ? "border-teal-400 bg-teal-50" : "border-slate-100 bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => toggleIngredient(food)}
                                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                                  checked ? "bg-teal-500 border-teal-500" : "bg-white border-slate-300"
                                }`}
                              >
                                {checked && <Check size={13} className="text-white" strokeWidth={3} />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${checked ? "text-teal-800" : "text-slate-700"}`}>
                                  {food.display_name || food.name}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">{food.calories} ккал/100г</p>
                              </div>
                              {checked && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <input
                                    type="number"
                                    min={1}
                                    value={checked.amount}
                                    onChange={(e) => updateIngredientAmount(food.name, parseFloat(e.target.value) || 0)}
                                    className="w-20 px-2 py-1.5 text-sm border border-slate-200 rounded-lg text-center bg-white"
                                  />
                                  <span className="text-xs text-slate-400">г</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                  {nutrientItems.map((n) => (
                    <div key={n.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{n.label}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${n.color}`}>{n.val}{n.unit}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-400 rounded-full" style={{ width: `${n.bar}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center">
                  <User size={15} className="text-teal-500" />
                </div>
                <h2 className="font-semibold text-slate-800 text-sm">Өвчтөний мэдээлэл</h2>
              </div>
              <div className="p-6">
                <PatientFormFields
                  values={form}
                  onChange={setForm}
                  models={{}}
                  showLabValues={false}
                />
              </div>
            </div>

            {availableModels.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">AI Загвар сонгох</h3>
                <div className="space-y-2">
                  {availableModels.map(([key, m]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedModel(key)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedModel === key
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 text-slate-600 hover:border-teal-200"
                      }`}
                    >
                      {MODEL_LABELS[key] ?? m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || selectedIngredients.length === 0}
          className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-teal-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Тооцоолж байна...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Хоолноос эрсдэл тооцоолох
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-slate-800">Тооцоолж байна...</p>
              <p className="text-slate-400 text-sm mt-1">Хоолны орцод дүн шинжилгээ хийж байна</p>
            </div>
          </div>
        </div>
      )}

      {result && !loading && (
        <ResultCard result={result} isFoodResult />
      )}
    </div>
  )
}
