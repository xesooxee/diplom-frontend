"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, ChevronRight } from "lucide-react"
import { PatientFormFields, PatientFormValues } from "@/components/patient-form-fields"
import { ResultCard } from "@/components/result-card"
import {
  getModels,
  predict,
  PredictRequest,
  PredictResponse,
  ModelInfo,
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

export default function PredictPage() {
  const router = useRouter()
  const [models, setModels] = useState<Record<string, ModelInfo>>({})
  const [form, setForm] = useState<PatientFormValues>(DEFAULT_FORM)
  const [hba1c, setHba1c] = useState(0)
  const [bloodGlucose, setBloodGlucose] = useState(0)
  const [knowsLab, setKnowsLab] = useState<boolean | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PredictResponse | null>(null)

  useEffect(() => {
    getModels().then((m) => {
      setModels(m)
      const defaultKey = Object.entries(m).find(([, v]) => v.default)?.[0] ?? Object.keys(m)[0]
      if (defaultKey) setForm((f) => ({ ...f, selectedModel: defaultKey }))
    })
  }, [])

  function buildRequest(): PredictRequest {
    return {
      gender: form.gender,
      age: form.age,
      hypertension: form.hypertension,
      heart_disease: form.heart_disease,
      smoking_history: form.smoking_history as PredictRequest["smoking_history"],
      height_cm: form.height_cm,
      weight_kg: form.weight_kg,
      hba1c_level: hba1c,
      blood_glucose_level: bloodGlucose,
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const res = await predict(buildRequest(), form.selectedModel)
      setResult(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  const availableModels = Object.entries(models).filter(([, m]) => m.available)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Эрсдэл тооцоолох</h1>
        <p className="text-slate-500 text-sm mt-0.5">Шинжилгээний үзүүлэлтээрээ чихрийн шижингийн эрсдэлийг тооцоолно</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Patient info */}
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

        {/* Right: Question + Lab values */}
        <div className="space-y-4">
          {/* Question card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle size={16} className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1">
                  Та HbA1c болон цусан дахь сахарынхаа үзүүлэлтийг мэдэх үү?
                </h3>
                <p className="text-slate-500 text-xs">
                  Лабораторийн шинжилгээний үр дүнгээ мэдэж байгаа эсэхийг сонгоно уу
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setKnowsLab(true)}
                className={`py-4 px-4 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-2 ${
                  knowsLab === true
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-slate-200 text-slate-600 hover:border-teal-200 hover:bg-teal-50/50"
                }`}
              >
                <span className="text-2xl"></span>
                Тийм, мэднэ
              </button>
              <button
                type="button"
                onClick={() => { setKnowsLab(false); router.push("/dashboard/food") }}
                className="py-4 px-4 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:border-orange-200 hover:bg-orange-50/50 transition-all flex flex-col items-center gap-2"
              >
                <span className="text-2xl"></span>
                Үгүй, мэдэхгүй
              </button>
            </div>
          </div>

          {/* Lab values card — shown when knowsLab = true */}
          {knowsLab === true && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-base">📋</span>
                  </div>
                  <h2 className="font-semibold text-slate-800 text-sm">Шинжилгээний үзүүлэлт</h2>
                </div>
                <div className="p-6 space-y-4">
                  {/* HbA1c */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      HbA1c түвшин (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={20}
                      value={hba1c || ""}
                      onChange={(e) => setHba1c(parseFloat(e.target.value) || 0)}
                      placeholder="5.7"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all"
                    />
                    <div className="flex gap-2 mt-2">
                      {[{ label: "Хэвийн", val: "< 5.7%", c: "bg-green-50 text-green-700" }, { label: "Эрсдэлтэй", val: "5.7–6.4%", c: "bg-amber-50 text-amber-700" }, { label: "Өвчтэй", val: "≥ 6.5%", c: "bg-red-50 text-red-700" }].map(r => (
                        <span key={r.label} className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.c}`}>{r.label} {r.val}</span>
                      ))}
                    </div>
                  </div>

                  {/* Blood glucose */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Цусан дахь глюкоз (mg/dL)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={bloodGlucose || ""}
                      onChange={(e) => setBloodGlucose(parseFloat(e.target.value) || 0)}
                      placeholder="100"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm transition-all"
                    />
                    <p className="text-xs text-slate-400 mt-1">Хэвийн: &lt; 100 mg/dL (өлөн байхад)</p>
                  </div>

                  {/* Model selector */}
                  {availableModels.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">AI Загвар сонгох</label>
                      <div className="flex flex-wrap gap-2">
                        {availableModels.map(([key, m]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, selectedModel: key }))}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                              form.selectedModel === key
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
                disabled={loading}
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
                    Эрсдэл тооцоолох
                  </>
                )}
              </button>
            </form>
          )}

          {/* Redirect hint when "Үгүй" is selected */}
          {knowsLab === false && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center gap-3">
              <span className="text-2xl">🥗</span>
              <div>
                <p className="font-semibold text-orange-800 text-sm">Хоолны эрсдэл тооцоолох</p>
                <p className="text-orange-600 text-xs mt-0.5">Хоолны хуудас руу шилжиж байна...</p>
              </div>
              <ChevronRight size={16} className="text-orange-500 ml-auto" />
            </div>
          )}
        </div>
      </div>

      {/* Result section */}
      {(loading || result) && (
        <div>
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-100 p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
                <div className="text-center">
                  <p className="font-semibold text-slate-800">Тооцоолж байна...</p>
                  <p className="text-slate-400 text-sm mt-1">AI загвар дүн шинжилгээ хийж байна</p>
                </div>
              </div>
            </div>
          )}
          {result && !loading && (
            <ResultCard result={result} isFoodResult={false} />
          )}
        </div>
      )}
    </div>
  )
}
