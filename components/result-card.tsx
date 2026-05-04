"use client"

import { GaugeChart } from "@/components/gauge-chart"
import { PredictResponse, FoodPredictResponse } from "@/lib/api"
import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from "lucide-react"
import React from "react"

const RISK_CONFIG: Record<string, { bg: string; text: string; border: string; bar: string; icon: React.ElementType; iconColor: string }> = {
  Бага:  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  bar: "bg-green-500",  icon: CheckCircle2,  iconColor: "text-green-600" },
  Дунд:  { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  bar: "bg-amber-500",  icon: AlertTriangle, iconColor: "text-amber-500" },
  Өндөр: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    bar: "bg-red-500",    icon: AlertOctagon,  iconColor: "text-red-500" },
}

interface ResultCardProps {
  result: PredictResponse | FoodPredictResponse
  isFoodResult?: boolean
}

function isFoodPredictResponse(r: PredictResponse | FoodPredictResponse): r is FoodPredictResponse {
  return "nutrition" in r
}

export function ResultCard({ result, isFoodResult }: ResultCardProps) {
  const risk = RISK_CONFIG[result.risk_level] ?? { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", bar: "bg-gray-400", icon: Info, iconColor: "text-gray-500" }
  const foodResult = isFoodResult && isFoodPredictResponse(result) ? result : null

  const nutrients = foodResult
    ? [
        { label: "Калори",   val: foodResult.nutrition.total_calories.toFixed(0), unit: "ккал", color: "text-orange-600 bg-orange-50", pct: Math.min(100, (foodResult.nutrition.total_calories / 2000) * 100) },
        { label: "Нүүрс ус", val: foodResult.nutrition.total_carbs.toFixed(1),    unit: "г",    color: "text-blue-600 bg-blue-50",     pct: Math.min(100, (foodResult.nutrition.total_carbs / 300) * 100) },
        { label: "Чихэр",    val: foodResult.nutrition.total_sugars.toFixed(1),   unit: "г",    color: "text-pink-600 bg-pink-50",     pct: Math.min(100, (foodResult.nutrition.total_sugars / 50) * 100) },
        { label: "Эслэг",    val: foodResult.nutrition.total_fiber.toFixed(1),    unit: "г",    color: "text-green-600 bg-green-50",   pct: Math.min(100, (foodResult.nutrition.total_fiber / 30) * 100) },
        { label: "Уураг",    val: foodResult.nutrition.total_protein.toFixed(1),  unit: "г",    color: "text-violet-600 bg-violet-50", pct: Math.min(100, (foodResult.nutrition.total_protein / 50) * 100) },
        { label: "Өөх тос",  val: foodResult.nutrition.total_fat.toFixed(1),      unit: "г",    color: "text-yellow-600 bg-yellow-50", pct: Math.min(100, (foodResult.nutrition.total_fat / 65) * 100) },
      ]
    : []

  return (
    <div className="space-y-4">
      {/* Main result card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Risk banner */}
        <div className={`px-6 py-4 flex items-center gap-3 border-b ${risk.bg} ${risk.border}`}>
          <risk.icon size={24} className={risk.iconColor} />
          <div>
            <p className={`font-bold text-base ${risk.text}`}>{result.risk_level} эрсдэлтэй</p>
            <p className={`text-xs ${risk.text} opacity-75`}>Чихрийн шижингийн таамаглалын үр дүн</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs text-slate-400 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 font-medium">
              {result.model_used}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Gauge + probability */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <GaugeChart value={result.probability} />
            </div>

            <div className="flex-1 w-full space-y-3">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Эрсдэлийн магадлал</span>
                  <span className={`text-sm font-bold ${risk.text}`}>{result.probability.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${risk.bar}`}
                    style={{ width: `${result.probability}%` }}
                  />
                </div>
              </div>

              {/* Prediction badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${risk.bg} ${risk.text} ${risk.border}`}>
                <risk.icon size={15} className={risk.iconColor} />
                {result.label}
              </div>

              {/* Food-specific metrics */}
              {foodResult && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-500 font-medium mb-0.5">Таамагласан HbA1c</p>
                    <p className="text-lg font-bold text-blue-700">{foodResult.predicted_hba1c.toFixed(1)}%</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <p className="text-xs text-purple-500 font-medium mb-0.5">Таамагласан глюкоз</p>
                    <p className="text-lg font-bold text-purple-700">{foodResult.predicted_glucose.toFixed(0)} mg/dL</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <p className="text-sm text-slate-700 leading-relaxed">{result.message}</p>
          </div>

          {/* Nutrition breakdown (food result) */}
          {foodResult && nutrients.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Хоол тэжээлийн дүн шинжилгээ</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {nutrients.map((n) => (
                  <div key={n.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">{n.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${n.color}`}>{n.val}{n.unit}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${n.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Зөвлөмжүүд</h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 bg-teal-50 rounded-xl px-4 py-3 border border-teal-100">
                    <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-teal-800">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
