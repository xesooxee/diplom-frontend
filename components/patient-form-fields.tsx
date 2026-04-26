"use client"

const SMOKING_OPTIONS = [
  { label: "Мэдэгдэхгүй", value: "No Info" },
  { label: "Одоо татдаг", value: "current" },
  { label: "Татаж байсан", value: "ever" },
  { label: "Өмнө татдаг байсан", value: "former" },
  { label: "Хэзээ ч татаагүй", value: "never" },
  { label: "Одоо татдаггүй", value: "not current" },
]

export interface PatientFormValues {
  gender: "Female" | "Male"
  age: number
  height_cm: number
  weight_kg: number
  hypertension: 0 | 1
  heart_disease: 0 | 1
  smoking_history: string
  selectedModel: string
}

interface PatientFormFieldsProps {
  values: PatientFormValues
  onChange: (values: PatientFormValues) => void
  models: Record<string, { name: string; available: boolean; default: boolean }>
  showLabValues?: boolean
  hba1c?: number
  blood_glucose?: number
  onHba1cChange?: (v: number) => void
  onBloodGlucoseChange?: (v: number) => void
}

function bmi(h: number, w: number) {
  if (!h || !w) return null
  return (w / ((h / 100) ** 2)).toFixed(1)
}

function bmiCategory(b: number) {
  if (b < 18.5) return { label: "Тарган доор", color: "text-blue-600" }
  if (b < 25) return { label: "Хэвийн", color: "text-green-600" }
  if (b < 30) return { label: "Илүүдэл", color: "text-amber-600" }
  return { label: "Таргалалт", color: "text-red-600" }
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm text-slate-800 placeholder:text-slate-400 transition-all bg-white"

export function PatientFormFields({
  values,
  onChange,
  models,
  showLabValues,
  hba1c,
  blood_glucose,
  onHba1cChange,
  onBloodGlucoseChange,
}: PatientFormFieldsProps) {
  const set = <K extends keyof PatientFormValues>(k: K, v: PatientFormValues[K]) =>
    onChange({ ...values, [k]: v })

  const availableModels = Object.entries(models).filter(([, m]) => m.available)
  const bmiVal = bmi(values.height_cm, values.weight_kg)
  const bmiCat = bmiVal ? bmiCategory(parseFloat(bmiVal)) : null

  return (
    <div className="space-y-4">
      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Хүйс</label>
        <div className="grid grid-cols-2 gap-2">
          {(["Female", "Male"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => set("gender", g)}
              className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                values.gender === g
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-slate-200 text-slate-600 hover:border-teal-200 hover:bg-teal-50/30"
              }`}
            >
              <span>{g === "Female" ? "🚺" : "🚹"}</span>
              {g === "Female" ? "Эмэгтэй" : "Эрэгтэй"}
            </button>
          ))}
        </div>
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Нас</label>
        <input
          type="number"
          min={0}
          max={120}
          value={values.age || ""}
          onChange={(e) => set("age", parseInt(e.target.value) || 0)}
          placeholder="Насаа оруулна уу"
          className={inputClass}
        />
      </div>

      {/* Height + Weight */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Өндөр (cm)</label>
          <input
            type="number"
            min={0}
            value={values.height_cm || ""}
            onChange={(e) => set("height_cm", parseFloat(e.target.value) || 0)}
            placeholder="165"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Жин (kg)</label>
          <input
            type="number"
            min={0}
            value={values.weight_kg || ""}
            onChange={(e) => set("weight_kg", parseFloat(e.target.value) || 0)}
            placeholder="70"
            className={inputClass}
          />
        </div>
      </div>

      {/* BMI badge */}
      {bmiVal && bmiCat && (
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
          <span className="text-sm text-slate-500">BMI:</span>
          <span className="font-bold text-slate-800 text-sm">{bmiVal}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 ${bmiCat.color}`}>
            {bmiCat.label}
          </span>
        </div>
      )}

      {/* Hypertension toggle */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Өндөр цусны даралт</p>
          <p className="text-xs text-slate-400 mt-0.5">Гипертензи</p>
        </div>
        <button
          type="button"
          onClick={() => set("hypertension", values.hypertension === 1 ? 0 : 1)}
          className={`relative w-11 h-6 rounded-full transition-all ${values.hypertension === 1 ? "bg-teal-500" : "bg-slate-200"}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${values.hypertension === 1 ? "left-6" : "left-1"}`} />
        </button>
      </div>

      {/* Heart disease toggle */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Зүрхний өвчин</p>
          <p className="text-xs text-slate-400 mt-0.5">Зүрх судасны өвчин</p>
        </div>
        <button
          type="button"
          onClick={() => set("heart_disease", values.heart_disease === 1 ? 0 : 1)}
          className={`relative w-11 h-6 rounded-full transition-all ${values.heart_disease === 1 ? "bg-teal-500" : "bg-slate-200"}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${values.heart_disease === 1 ? "left-6" : "left-1"}`} />
        </button>
      </div>

      {/* Smoking history */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Тамхины түүх</label>
        <select
          value={values.smoking_history}
          onChange={(e) => set("smoking_history", e.target.value)}
          className={inputClass}
        >
          {SMOKING_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Lab values (conditional) */}
      {showLabValues && onHba1cChange && onBloodGlucoseChange && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">HbA1c (%)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              value={hba1c || ""}
              onChange={(e) => onHba1cChange(parseFloat(e.target.value) || 0)}
              placeholder="5.7"
              className={inputClass}
            />
            <p className="text-xs text-slate-400 mt-1">Хэвийн: &lt; 5.7%</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Цусан дахь глюкоз (mg/dL)</label>
            <input
              type="number"
              min={0}
              value={blood_glucose || ""}
              onChange={(e) => onBloodGlucoseChange(parseFloat(e.target.value) || 0)}
              placeholder="100"
              className={inputClass}
            />
            <p className="text-xs text-slate-400 mt-1">Хэвийн: &lt; 100 mg/dL</p>
          </div>
        </>
      )}

      {/* Model selector */}
      {availableModels.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">AI Загвар</label>
          <div className="flex flex-wrap gap-2">
            {availableModels.map(([key, m]) => (
              <button
                key={key}
                type="button"
                onClick={() => set("selectedModel", key)}
                className={`px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                  values.selectedModel === key
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-slate-200 text-slate-600 hover:border-teal-200"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
