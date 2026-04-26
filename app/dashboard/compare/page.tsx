"use client"

import { useState, useEffect } from "react"
import { AlertCircle, BarChart3, TrendingUp } from "lucide-react"
import {
  getModels,
  compare,
  PredictRequest,
  CompareResult,
  ModelInfo,
} from "@/lib/api"

const DEFAULT_FORM = {
  gender: "Female" as const,
  age: 45,
  height_cm: 165,
  weight_kg: 75,
  hypertension: 0 as const,
  heart_disease: 0 as const,
  smoking_history: "never" as const,
  hba1c_level: 6.0,
  blood_glucose_level: 120,
}

const RISK_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  Бага: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  Дунд: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Өндөр: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
}

const MODEL_INFO: Record<string, { icon: string; desc: string; color: string }> = {
  rf:  { icon: "🌲", desc: "Шийдлийн мод дээр суурилсан, хэт суралцахаас сэргийлэх", color: "bg-teal-50 border-teal-200" },
  lr:  { icon: "📈", desc: "Шугаман регрессийн загвар, тайлбарлах боломжтой", color: "bg-blue-50 border-blue-200" },
  svm: { icon: "⚡", desc: "Тусгаарлах гиперплейн дээр суурилсан загвар", color: "bg-violet-50 border-violet-200" },
  xgb: { icon: "🚀", desc: "Gradient boosting, өндөр нарийвчлалтай", color: "bg-orange-50 border-orange-200" },
}

const SMOKING_OPTIONS = [
  { label: "Мэдэгдэхгүй", value: "No Info" },
  { label: "Одоо татдаг", value: "current" },
  { label: "Татаж байсан", value: "ever" },
  { label: "Өмнө татдаг байсан", value: "former" },
  { label: "Хэзээ ч татаагүй", value: "never" },
  { label: "Одоо татдаггүй", value: "not current" },
]

export default function ComparePage() {
  const [models, setModels] = useState<Record<string, ModelInfo>>({})
  const [form, setForm] = useState(DEFAULT_FORM)
  const [results, setResults] = useState<CompareResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getModels().then(setModels)
  }, [])

  function bmi() {
    if (!form.height_cm || !form.weight_kg) return null
    return (form.weight_kg / ((form.height_cm / 100) ** 2)).toFixed(1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResults(null)
    setLoading(true)
    try {
      const body: PredictRequest = {
        gender: form.gender,
        age: form.age,
        hypertension: form.hypertension,
        heart_disease: form.heart_disease,
        smoking_history: form.smoking_history,
        height_cm: form.height_cm,
        weight_kg: form.weight_kg,
        hba1c_level: form.hba1c_level,
        blood_glucose_level: form.blood_glucose_level,
      }
      const res = await compare(body)
      setResults(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  const best = results?.reduce((a, b) => (a.probability > b.probability ? a : b))

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Загвар харьцуулах</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          RF, LR, SVM, XGBoost загваруудыг нэгэн зэрэг харьцуулж дүн шинжилгээ хий
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
                <span className="text-base">👤</span>
              </div>
              <h2 className="font-semibold text-slate-800 text-sm">Өвчтөний мэдээлэл</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Хүйс</label>
                <div className="flex gap-3">
                  {(["Female", "Male"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, gender: g }))}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        form.gender === g
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 text-slate-600 hover:border-teal-200"
                      }`}
                    >
                      {g === "Female" ? "🚺 Эмэгтэй" : "🚹 Эрэгтэй"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Нас</label>
                <input
                  type="number" min={0} max={120}
                  value={form.age || ""}
                  onChange={(e) => setForm((f) => ({ ...f, age: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all"
                  placeholder="45"
                />
              </div>

              {/* Height + Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Өндөр (cm)</label>
                  <input
                    type="number" min={0}
                    value={form.height_cm || ""}
                    onChange={(e) => setForm((f) => ({ ...f, height_cm: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all"
                    placeholder="165"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Жин (kg)</label>
                  <input
                    type="number" min={0}
                    value={form.weight_kg || ""}
                    onChange={(e) => setForm((f) => ({ ...f, weight_kg: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all"
                    placeholder="70"
                  />
                </div>
              </div>
              {bmi() && (
                <div className="flex items-center gap-2 bg-teal-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-slate-600">BMI:</span>
                  <span className="font-bold text-teal-700 text-sm">{bmi()}</span>
                  <span className="text-xs text-slate-400 ml-1">
                    {parseFloat(bmi()!) < 18.5 ? "Тарган доор" : parseFloat(bmi()!) < 25 ? "Хэвийн" : parseFloat(bmi()!) < 30 ? "Илүүдэл" : "Таргалалт"}
                  </span>
                </div>
              )}

              {/* Toggles */}
              <div className="space-y-2">
                {[
                  { label: "Өндөр цусны даралт", key: "hypertension" as const },
                  { label: "Зүрхний өвчин", key: "heart_disease" as const },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, [item.key]: f[item.key] === 1 ? 0 : 1 }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${form[item.key] === 1 ? "bg-teal-500" : "bg-slate-200"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form[item.key] === 1 ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Smoking */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Тамхины түүх</label>
                <select
                  value={form.smoking_history}
                  onChange={(e) => setForm((f) => ({ ...f, smoking_history: e.target.value as typeof form.smoking_history }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all bg-white"
                >
                  {SMOKING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* HbA1c + Glucose */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">HbA1c (%)</label>
                  <input
                    type="number" step="0.1" min={0}
                    value={form.hba1c_level || ""}
                    onChange={(e) => setForm((f) => ({ ...f, hba1c_level: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all"
                    placeholder="6.0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Глюкоз (mg/dL)</label>
                  <input
                    type="number" min={0}
                    value={form.blood_glucose_level || ""}
                    onChange={(e) => setForm((f) => ({ ...f, blood_glucose_level: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all"
                    placeholder="120"
                  />
                </div>
              </div>
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
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Харьцуулж байна...
              </>
            ) : (
              <>
                <BarChart3 size={16} />
                Бүх загваруудтай харьцуулах
              </>
            )}
          </button>
        </form>

        {/* Results */}
        <div className="space-y-4">
          {!results && !loading && (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center text-center h-full min-h-64">
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-2xl mb-4">📊</div>
              <p className="font-semibold text-slate-700 text-sm mb-1">Загвар харьцуулалт</p>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Зүүн талд мэдээлэл оруулж, "Харьцуулах" товч дарна уу
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-violet-100 border-t-violet-500 animate-spin" />
              <div className="text-center">
                <p className="font-semibold text-slate-800 text-sm">Харьцуулж байна...</p>
                <p className="text-slate-400 text-xs mt-1">4 загварыг нэгэн зэрэг тооцоолж байна</p>
              </div>
            </div>
          )}

          {results && !loading && (
            <>
              {/* Summary */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <TrendingUp size={16} className="text-violet-600" />
                  <h2 className="font-semibold text-slate-800 text-sm">Харьцуулалтын үр дүн</h2>
                  {best && (
                    <span className="ml-auto bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      Шилдэг: {results.find(r => r.model_key === best.model_key)?.model_name}
                    </span>
                  )}
                </div>
                <div className="p-6 space-y-3">
                  {results.map((r) => {
                    const info = MODEL_INFO[r.model_key] ?? { icon: "🤖", desc: "", color: "bg-slate-50 border-slate-200" }
                    const riskConf = RISK_CONFIG[r.risk_level] ?? { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
                    const isModels = models[r.model_key]
                    return (
                      <div
                        key={r.model_key}
                        className={`rounded-xl border-2 p-4 transition-all ${
                          r.model_key === best?.model_key
                            ? "border-violet-400 bg-violet-50"
                            : "border-slate-100 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{info.icon}</span>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">
                                {isModels?.name ?? r.model_name}
                                {r.model_key === best?.model_key && (
                                  <span className="ml-2 text-xs bg-violet-200 text-violet-800 px-1.5 py-0.5 rounded-full">✓ Шилдэг</span>
                                )}
                              </p>
                              <p className="text-xs text-slate-400">{info.desc}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${riskConf.bg} ${riskConf.text} ${riskConf.border}`}>
                            {r.risk_level} эрсдэл
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Таамаглал</span>
                            <span className="font-bold text-slate-800">{r.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  r.probability < 30 ? "bg-green-500" : r.probability <= 60 ? "bg-amber-500" : "bg-red-500"
                                }`}
                                style={{ width: `${r.probability}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-slate-800 shrink-0 w-12 text-right">
                              {r.probability.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
