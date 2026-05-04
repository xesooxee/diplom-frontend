"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle, Plus, Search, Trash2, UtensilsCrossed, X } from "lucide-react"
import {
  AdminDish,
  createAdminDish,
  deleteAdminDish,
  FoodSearchItem,
  getAdminDishes,
  searchFoods,
} from "@/lib/api"

interface SelectedIngredient {
  food: FoodSearchItem
  amount: number
}

function foodName(food: FoodSearchItem) {
  return food.display_name || food.name
}

export default function AdminPage() {
  const [dishName, setDishName] = useState("")
  const [query, setQuery] = useState("")
  const [foods, setFoods] = useState<FoodSearchItem[]>([])
  const [ingredients, setIngredients] = useState<Record<string, SelectedIngredient>>({})
  const [dishes, setDishes] = useState<AdminDish[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAdminDishes().then(setDishes)
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      setLoading(true)
      searchFoods(query).then(setFoods).finally(() => setLoading(false))
    }, 250)
    return () => window.clearTimeout(id)
  }, [query])

  const selectedList = useMemo(() => Object.values(ingredients), [ingredients])

  function addIngredient(food: FoodSearchItem) {
    setIngredients((prev) => ({
      ...prev,
      [food.name]: prev[food.name] ?? { food, amount: 100 },
    }))
  }

  function updateAmount(name: string, amount: number) {
    setIngredients((prev) => ({
      ...prev,
      [name]: { ...prev[name], amount },
    }))
  }

  function removeIngredient(name: string) {
    setIngredients((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!dishName.trim()) {
      setError("Хоолны нэр оруулна уу")
      return
    }
    if (selectedList.length === 0) {
      setError("Дор хаяж 1 орц сонгоно уу")
      return
    }

    setError(null)
    setSaving(true)
    try {
      const dish = await createAdminDish(
        dishName,
        selectedList.map(({ food, amount }) => ({ name: food.name, amount }))
      )
      setDishes((prev) => [...prev, dish])
      setDishName("")
      setIngredients({})
      setQuery("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    try {
      await deleteAdminDish(id)
      setDishes((prev) => prev.filter((dish) => dish.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Админ самбар</h1>
        <p className="text-slate-500 text-sm mt-0.5">Хоол үүсгэж, тухайн хоолны орцуудыг сонгон хадгална</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={handleSave} className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center">
                <UtensilsCrossed size={15} className="text-teal-600" />
              </div>
              <h2 className="font-semibold text-slate-800 text-sm">Шинэ хоол нэмэх</h2>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Хоолны нэр</label>
                <input
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="Жишээ: Цуйван"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Орц хайх</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="beef, rice, onion..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {loading ? (
                  <div className="col-span-full text-center py-8 text-sm text-slate-400">Орц хайж байна...</div>
                ) : foods.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-sm text-slate-400">Орц олдсонгүй</div>
                ) : foods.map((food) => {
                  const selected = !!ingredients[food.name]
                  return (
                    <button
                      key={food.name}
                      type="button"
                      onClick={() => addIngredient(food)}
                      className={`relative text-left px-3 py-2.5 rounded-xl border-2 text-xs transition-all ${
                        selected ? "border-teal-400 bg-teal-50" : "border-slate-100 bg-slate-50 hover:border-teal-200"
                      }`}
                    >
                      {selected && (
                        <CheckCircle size={13} className="absolute top-2 right-2 text-teal-600" />
                      )}
                      <span className="font-semibold text-slate-700 block truncate pr-4">{foodName(food)}</span>
                      <span className="text-slate-400">{food.calories} ккал/100г</span>
                    </button>
                  )
                })}
              </div>

              {selectedList.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-800">Сонгосон орцууд</h3>
                  {selectedList.map(({ food, amount }) => (
                    <div key={food.name} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                      <span className="flex-1 text-sm font-medium text-slate-800 truncate">{foodName(food)}</span>
                      <input
                        type="number"
                        min={1}
                        value={amount}
                        onChange={(e) => updateAmount(food.name, parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-center bg-white"
                      />
                      <span className="text-xs text-slate-400 font-medium">г</span>
                      <button type="button" onClick={() => removeIngredient(food.name)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center">
                        <X size={14} className="text-red-500" />
                      </button>
                    </div>
                  ))}
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
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-teal-200"
          >
            <Plus size={16} />
            {saving ? "Хадгалж байна..." : "Хоол хадгалах"}
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">Бүртгэсэн хоолнууд</h2>
          </div>
          <div className="p-4 space-y-3 max-h-[680px] overflow-y-auto">
            {dishes.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-400">Хоол бүртгээгүй байна</div>
            ) : dishes.map((dish) => (
              <div key={dish.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{dish.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{dish.ingredients.length} орц</p>
                  </div>
                  <button onClick={() => handleDelete(dish.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center shrink-0">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {dish.ingredients.map((item) => (
                    <span key={`${dish.id}-${item.name}`} className="text-xs bg-white border border-slate-100 rounded-full px-2 py-1 text-slate-500">
                      {item.name} {item.amount}г
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
