"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Search, Check } from "lucide-react"
import { PatientFormFields, PatientFormValues } from "@/components/patient-form-fields"
import { ResultCard } from "@/components/result-card"
import {
  getModels,
  predictFood,
  searchFoods,
  FoodSearchItem,
  FoodPredictResponse,
  ModelInfo,
  FoodPredictRequest,
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

interface SelectedFood {
  food: FoodSearchItem
  amount: number
}

export default function FoodPage() {
  const [models, setModels] = useState<Record<string, ModelInfo>>({})
  const [form, setForm] = useState<PatientFormValues>(DEFAULT_FORM)
  const [selectedModel, setSelectedModel] = useState("rf")

  const [allFoods, setAllFoods] = useState<FoodSearchItem[]>([])
  const [foodsLoading, setFoodsLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [selected, setSelected] = useState<Record<string, SelectedFood>>({})

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
    // Load all foods on mount
    searchFoods("").then((foods) => {
      setAllFoods(foods)
      setFoodsLoading(false)
    }).catch(() => setFoodsLoading(false))
  }, [])

  const filteredFoods = filter.trim()
    ? allFoods.filter((f) => f.name.toLowerCase().includes(filter.toLowerCase()))
    : allFoods

  function toggleFood(food: FoodSearchItem) {
    setSelected((prev) => {
      if (prev[food.name]) {
        const next = { ...prev }
        delete next[food.name]
        return next
      }
      return { ...prev, [food.name]: { food, amount: 100 } }
    })
  }

  function updateAmount(name: string, amount: number) {
    setSelected((prev) => ({
      ...prev,
      [name]: { ...prev[name], amount },
    }))
  }

  function removeFood(name: string) {
    setSelected((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const selectedList = Object.values(selected)

  function computeNutrition() {
    return selectedList.reduce(
      (acc, { food, amount }) => {
        const r = amount / 100
        return {
          calories: acc.calories + food.calories * r,
          carbs: acc.carbs + food.carbohydrate * r,
          sugars: acc.sugars + food.sugars * r,
          fiber: acc.fiber + food.fiber * r,
          protein: acc.protein + food.protein * r,
          fat: acc.fat + food.fat * r,
        }
      },
      { calories: 0, carbs: 0, sugars: 0, fiber: 0, protein: 0, fat: 0 }
    )
  }

  const nutrition = computeNutrition()
  const availableModels = Object.entries(models).filter(([, m]) => m.available)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedList.length === 0) {
      setError("Дор хаяж 1 хоол сонгоно уу")
      return
    }
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const body: FoodPredictRequest = {
        foods: selectedList.map(({ food, amount }) => ({ name: food.name, amount })),
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

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Хоолны эрсдэл</h1>
        <p className="text-slate-500 text-sm mt-0.5">Идсэн хоол хүнсээс чихрийн шижингийн эрсдэлийг тооцоолно</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left: Food picker + selected */}
          <div className="xl:col-span-2 space-y-4">

            {/* Food grid card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                    <span className="text-base">🥗</span>
                  </div>
                  <h2 className="font-semibold text-slate-800 text-sm">Хоол сонгох</h2>
                  {!foodsLoading && (
                    <span className="text-xs text-slate-400">{allFoods.length} хоол</span>
                  )}
                </div>
                {selectedList.length > 0 && (
                  <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {selectedList.length} сонгосон
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                {/* Filter input */}
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Хоол шүүх..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all bg-slate-50"
                  />
                </div>

                {/* Food grid */}
                {foodsLoading ? (
                  <div className="flex items-center justify-center py-10 gap-3">
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-slate-400">Хоолны жагсаалт ачааллаж байна...</span>
                  </div>
                ) : filteredFoods.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">Хоол олдсонгүй</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                    {filteredFoods.map((food) => {
                      const isSelected = !!selected[food.name]
                      return (
                        <button
                          key={food.name}
                          type="button"
                          onClick={() => toggleFood(food)}
                          className={`relative text-left px-3 py-2.5 rounded-xl border-2 text-xs transition-all flex flex-col gap-0.5 ${
                            isSelected
                              ? "border-teal-400 bg-teal-50"
                              : "border-slate-100 bg-slate-50 hover:border-teal-200 hover:bg-teal-50/40"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                              <Check size={10} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                          <span className={`font-semibold truncate pr-4 ${isSelected ? "text-teal-800" : "text-slate-700"}`}>
                            {food.name}
                          </span>
                          <span className="text-slate-400">{food.calories} ккал/100г</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Selected foods list */}
            {selectedList.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center">
                    <span className="text-base">🍽️</span>
                  </div>
                  <h2 className="font-semibold text-slate-800 text-sm">Сонгосон хоолнууд</h2>
                </div>
                <div className="p-4 space-y-2">
                  {selectedList.map(({ food, amount }) => (
                    <div key={food.name} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                      <span className="flex-1 text-sm font-medium text-slate-800 truncate">{food.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min={1}
                          value={amount}
                          onChange={(e) => updateAmount(food.name, parseFloat(e.target.value) || 0)}
                          className="w-20 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
                        />
                        <span className="text-xs text-slate-400 font-medium">г</span>
                        <button
                          type="button"
                          onClick={() => removeFood(food.name)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                          <X size={13} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nutrition summary */}
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

          {/* Right: Patient info + model */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center">
                  <span className="text-base">👤</span>
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
          disabled={loading || selectedList.length === 0}
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
              <p className="text-slate-400 text-sm mt-1">Хоол тэжээлийн дүн шинжилгээ хийж байна</p>
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
