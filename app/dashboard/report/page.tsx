"use client"

import { useState, useRef } from "react"
import { AlertCircle, FileText, Printer, CheckCircle2, TrendingUp, GitBranch, Cpu, Zap, Check, Bot } from "lucide-react"
import React from "react"
import {
  compare,
  predict,
  getModels,
  PredictRequest,
  CompareResult,
  PredictResponse,
  ModelInfo,
} from "@/lib/api"
import { useEffect } from "react"

type FormState = {
  gender: "Female" | "Male"
  age: number
  height_cm: number
  weight_kg: number
  hypertension: 0 | 1
  heart_disease: 0 | 1
  smoking_history: PredictRequest["smoking_history"]
  hba1c_level: number
  blood_glucose_level: number
}

const DEFAULT_FORM: FormState = {
  gender: "Female",
  age: 45,
  height_cm: 165,
  weight_kg: 70,
  hypertension: 0,
  heart_disease: 0,
  smoking_history: "never",
  hba1c_level: 5.7,
  blood_glucose_level: 100,
}

const SMOKING_LABELS: Record<string, string> = {
  "No Info": "Мэдэгдэхгүй",
  current: "Одоо татдаг",
  ever: "Татаж байсан",
  former: "Өмнө татдаг байсан",
  never: "Хэзээ ч татаагүй",
  "not current": "Одоо татдаггүй",
}

const SMOKING_OPTIONS = [
  { label: "Мэдэгдэхгүй", value: "No Info" },
  { label: "Одоо татдаг", value: "current" },
  { label: "Татаж байсан", value: "ever" },
  { label: "Өмнө татдаг байсан", value: "former" },
  { label: "Хэзээ ч татаагүй", value: "never" },
  { label: "Одоо татдаггүй", value: "not current" },
]

const MODEL_INFO: Record<string, { icon: React.ElementType; iconColor: string; fullName: string; color: string; textColor: string }> = {
  rf:  { icon: GitBranch, iconColor: "text-teal-600",   fullName: "Random Forest",          color: "bg-teal-50 border-teal-200",     textColor: "text-teal-700" },
  lr:  { icon: TrendingUp, iconColor: "text-blue-600",  fullName: "Logistic Regression",    color: "bg-blue-50 border-blue-200",     textColor: "text-blue-700" },
  svm: { icon: Zap,        iconColor: "text-violet-600", fullName: "Support Vector Machine", color: "bg-violet-50 border-violet-200", textColor: "text-violet-700" },
  xgb: { icon: Cpu,        iconColor: "text-orange-600", fullName: "XGBoost",               color: "bg-orange-50 border-orange-200", textColor: "text-orange-700" },
}

const RISK_CONFIG: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  Бага:  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200", bar: "bg-green-500" },
  Дунд:  { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200", bar: "bg-amber-500" },
  Өндөр: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",   bar: "bg-red-500" },
}

export default function ReportPage() {
  const [models, setModels] = useState<Record<string, ModelInfo>>({})
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [compareResults, setCompareResults] = useState<CompareResult[] | null>(null)
  const [predictResult, setPredictResult] = useState<PredictResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)
  const [reportId, setReportId] = useState("")
  const [reportDate, setReportDate] = useState("")

  useEffect(() => {
    getModels().then(setModels)
  }, [])

  function bmi() {
    if (!form.height_cm || !form.weight_kg) return null
    return (form.weight_kg / (form.height_cm / 100) ** 2).toFixed(1)
  }

  function bmiLabel(val: number) {
    if (val < 18.5) return { label: "Бага жинтэй", color: "text-blue-600" }
    if (val < 25) return { label: "Хэвийн", color: "text-green-600" }
    if (val < 30) return { label: "Илүүдэл жинтэй", color: "text-amber-600" }
    return { label: "Таргалалт", color: "text-red-600" }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCompareResults(null)
    setPredictResult(null)
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

      const [cmpRes, predRes] = await Promise.all([
        compare(body),
        predict(body, "rf"),
      ])

      setCompareResults(cmpRes)
      setPredictResult(predRes)
      setReportId(String(cmpRes.length + Date.now()).slice(-6))
      setReportDate(new Date().toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  const best = compareResults?.reduce((a, b) => {
    const auc = (key: string) => models[key]?.roc_auc ?? 0
    return auc(a.model_key) >= auc(b.model_key) ? a : b
  })

  const bmiVal = bmi()
  const bmiInfo = bmiVal ? bmiLabel(parseFloat(bmiVal)) : null

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-printable, #report-printable * { visibility: visible; }
          #report-printable { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Эмнэлгийн тайлан</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Өвчтөний мэдээлэл оруулж, хэвлэх боломжтой тайлан үүсгэнэ
            </p>
          </div>
          {compareResults && (
            <button
              onClick={handlePrint}
              className="no-print flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              <Printer size={15} />
              Хэвлэх
            </button>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleGenerate} className="no-print">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText size={15} className="text-blue-600" />
              </div>
              <h2 className="font-semibold text-slate-800 text-sm">Өвчтөний мэдээлэл</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Gender */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Хүйс</label>
                  <div className="flex gap-2">
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
                        {g === "Female" ? " Эмэгтэй" : " Эрэгтэй"}
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm"
                    placeholder="45"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Өндөр (cm)</label>
                  <input
                    type="number" min={0}
                    value={form.height_cm || ""}
                    onChange={(e) => setForm((f) => ({ ...f, height_cm: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm"
                    placeholder="165"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Жин (kg)</label>
                  <input
                    type="number" min={0}
                    value={form.weight_kg || ""}
                    onChange={(e) => setForm((f) => ({ ...f, weight_kg: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm"
                    placeholder="70"
                  />
                </div>

                {/* HbA1c */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">HbA1c (%)</label>
                  <input
                    type="number" step="0.1" min={0}
                    value={form.hba1c_level || ""}
                    onChange={(e) => setForm((f) => ({ ...f, hba1c_level: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm"
                    placeholder="5.7"
                  />
                </div>

                {/* Blood glucose */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Глюкоз (mg/dL)</label>
                  <input
                    type="number" min={0}
                    value={form.blood_glucose_level || ""}
                    onChange={(e) => setForm((f) => ({ ...f, blood_glucose_level: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm"
                    placeholder="100"
                  />
                </div>

                {/* Smoking */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Тамхины түүх</label>
                  <select
                    value={form.smoking_history}
                    onChange={(e) => setForm((f) => ({ ...f, smoking_history: e.target.value as FormState["smoking_history"] }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm bg-white"
                  >
                    {SMOKING_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Hypertension */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Өндөр цусны даралт</label>
                  <div className="flex items-center gap-3 h-10">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, hypertension: f.hypertension === 1 ? 0 : 1 }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${form.hypertension === 1 ? "bg-teal-500" : "bg-slate-200"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.hypertension === 1 ? "left-6" : "left-1"}`} />
                    </button>
                    <span className="text-sm text-slate-600">{form.hypertension === 1 ? "Тийм" : "Үгүй"}</span>
                  </div>
                </div>

                {/* Heart disease */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Зүрхний өвчин</label>
                  <div className="flex items-center gap-3 h-10">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, heart_disease: f.heart_disease === 1 ? 0 : 1 }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${form.heart_disease === 1 ? "bg-teal-500" : "bg-slate-200"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.heart_disease === 1 ? "left-6" : "left-1"}`} />
                    </button>
                    <span className="text-sm text-slate-600">{form.heart_disease === 1 ? "Тийм" : "Үгүй"}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Тайлан үүсгэж байна...
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      Тайлан үүсгэх
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-slate-800">Тайлан боловсруулж байна...</p>
              <p className="text-slate-400 text-sm mt-1">4 AI загвараар дүн шинжилгээ хийж байна</p>
            </div>
          </div>
        )}

        {/* Report output */}
        {compareResults && predictResult && !loading && (
          <div id="report-printable" ref={reportRef} className="space-y-5">
            {/* Report header */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-500 px-8 py-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <span className="font-bold text-lg">GlucoCare</span>
                    </div>
                    <h2 className="text-xl font-bold mb-1">Чихрийн шижингийн эрсдэлийн тайлан</h2>
                    <p className="text-teal-100 text-sm">AI загварт суурилсан эрүүл мэндийн дүн шинжилгээ</p>
                  </div>
                  <div className="text-right text-sm text-teal-100">
                    <p className="font-medium">{reportDate}</p>
                    <p className="text-xs mt-1 text-teal-200">Тайлан ID: RPT-{reportId}</p>
                  </div>
                </div>
              </div>

              {/* Patient summary */}
              <div className="px-8 py-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Өвчтөний мэдээлэл</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Хүйс", value: form.gender === "Female" ? "Эмэгтэй" : "Эрэгтэй" },
                    { label: "Нас", value: `${form.age} нас` },
                    { label: "Өндөр / Жин", value: `${form.height_cm} cm / ${form.weight_kg} kg` },
                    { label: "BMI", value: bmiVal ? `${bmiVal} — ${bmiInfo?.label}` : "—" },
                    { label: "HbA1c", value: `${form.hba1c_level}%` },
                    { label: "Глюкоз", value: `${form.blood_glucose_level} mg/dL` },
                    { label: "Цусны даралт", value: form.hypertension === 1 ? "Өндөр" : "Хэвийн" },
                    { label: "Зүрхний өвчин", value: form.heart_disease === 1 ? "Тийм" : "Үгүй" },
                    { label: "Тамхи", value: SMOKING_LABELS[form.smoking_history] ?? form.smoking_history },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall risk */}
              {best && (() => {
                const risk = RISK_CONFIG[best.risk_level] ?? RISK_CONFIG["Бага"]
                return (
                  <div className={`px-8 py-5 border-b border-slate-100 ${risk.bg}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Нийт эрсдэлийн дүгнэлт</p>
                        <p className={`text-2xl font-bold ${risk.text}`}>{best.risk_level} эрсдэлтэй</p>
                        <p className="text-sm text-slate-600 mt-1">{predictResult.message}</p>
                      </div>
                      <div className={`text-center px-6 py-3 rounded-2xl border-2 ${risk.bg} ${risk.border}`}>
                        <p className={`text-3xl font-black ${risk.text}`}>{best.probability.toFixed(1)}%</p>
                        <p className={`text-xs font-medium ${risk.text} mt-0.5`}>Магадлал</p>
                      </div>
                    </div>
                    <div className="mt-3 h-3 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${risk.bar}`}
                        style={{ width: `${best.probability}%` }}
                      />
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Model comparison table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <TrendingUp size={16} className="text-violet-600" />
                <h3 className="font-semibold text-slate-800 text-sm">AI Загваруудын харьцуулалт</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {compareResults.map((r) => {
                    const info = MODEL_INFO[r.model_key] ?? { icon: Bot, iconColor: "text-slate-500", fullName: r.model_name, color: "bg-slate-50 border-slate-200", textColor: "text-slate-700" }
                    const risk = RISK_CONFIG[r.risk_level] ?? RISK_CONFIG["Бага"]
                    const modelMeta = models[r.model_key]
                    const isBest = r.model_key === best?.model_key

                    return (
                      <div
                        key={r.model_key}
                        className={`rounded-xl border-2 p-4 relative ${isBest ? "border-violet-400 bg-violet-50" : "border-slate-100 bg-white"}`}
                      >
                        {isBest && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                            <Check size={10} /> Шилдэг загвар
                          </div>
                        )}
                        <div className="text-center mb-3 pt-1">
                          <info.icon size={24} className={info.iconColor} />
                          <p className="font-bold text-slate-900 text-sm mt-1">{info.fullName}</p>
                          {modelMeta && (
                            <p className="text-xs text-slate-400 mt-0.5">AUC: {modelMeta.roc_auc?.toFixed(3) ?? "—"}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Таамаглал</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${risk.bg} ${risk.text} ${risk.border}`}>
                              {r.risk_level}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${risk.bar}`}
                                style={{ width: `${r.probability}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right shrink-0">
                              {r.probability.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {predictResult.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <h3 className="font-semibold text-slate-800 text-sm">Эмчийн зөвлөмж</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {predictResult.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 bg-teal-50 rounded-xl px-4 py-3 border border-teal-100">
                        <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{i + 1}</span>
                        </div>
                        <span className="text-sm text-teal-800 leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reference ranges */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm">Лавлагааны хэмжүүр</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">HbA1c түвшин</p>
                  <div className="space-y-2">
                    {[
                      { label: "Хэвийн", val: "< 5.7%", bg: "bg-green-50 text-green-700 border-green-200" },
                      { label: "Эрсдэлтэй", val: "5.7–6.4%", bg: "bg-amber-50 text-amber-700 border-amber-200" },
                      { label: "Чихрийн шижин", val: "≥ 6.5%", bg: "bg-red-50 text-red-700 border-red-200" },
                    ].map((r) => (
                      <div key={r.label} className={`flex justify-between items-center px-3 py-2 rounded-lg border text-xs font-medium ${r.bg}`}>
                        <span>{r.label}</span><span>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Цусан дахь глюкоз</p>
                  <div className="space-y-2">
                    {[
                      { label: "Хэвийн (өлөн)", val: "< 100 mg/dL", bg: "bg-green-50 text-green-700 border-green-200" },
                      { label: "Эрсдэлтэй", val: "100–125 mg/dL", bg: "bg-amber-50 text-amber-700 border-amber-200" },
                      { label: "Чихрийн шижин", val: "≥ 126 mg/dL", bg: "bg-red-50 text-red-700 border-red-200" },
                    ].map((r) => (
                      <div key={r.label} className={`flex justify-between items-center px-3 py-2 rounded-lg border text-xs font-medium ${r.bg}`}>
                        <span>{r.label}</span><span>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">BMI ангилал</p>
                  <div className="space-y-2">
                    {[
                      { label: "Тарган доор", val: "< 18.5", bg: "bg-blue-50 text-blue-700 border-blue-200" },
                      { label: "Хэвийн", val: "18.5–24.9", bg: "bg-green-50 text-green-700 border-green-200" },
                      { label: "Илүүдэл жин", val: "25–29.9", bg: "bg-amber-50 text-amber-700 border-amber-200" },
                      { label: "Таргалалт", val: "≥ 30", bg: "bg-red-50 text-red-700 border-red-200" },
                    ].map((r) => (
                      <div key={r.label} className={`flex justify-between items-center px-3 py-2 rounded-lg border text-xs font-medium ${r.bg}`}>
                        <span>{r.label}</span><span>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4 text-center">
              <p className="text-xs text-slate-400 leading-relaxed">
                Энэхүү тайлан нь GlucoCare AI системээр автоматаар үүсгэгдсэн бөгөөд зөвхөн мэдээллийн зорилгоор ашиглагдана.
                Эмнэлгийн мэргэжлийн үзлэгийг орлохгүй. Эрүүл мэндийн асуудалтай бол эмчтэйгээ зөвлөлдөнө үү.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
