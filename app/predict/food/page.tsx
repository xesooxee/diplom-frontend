"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientFormFields, PatientFormValues } from "@/components/patient-form-fields";
import { ResultCard } from "@/components/result-card";
import {
  getModels,
  predictFood,
  searchFoods,
  FoodItem,
  FoodSearchItem,
  FoodPredictResponse,
  ModelInfo,
  FoodPredictRequest,
} from "@/lib/api";

const DEFAULT_FORM: PatientFormValues = {
  gender: "Female",
  age: 0,
  height_cm: 0,
  weight_kg: 0,
  hypertension: 0,
  heart_disease: 0,
  smoking_history: "No Info",
  selectedModel: "rf",
};

interface FoodEntry extends FoodItem {
  id: number;
  foodData: FoodSearchItem;
}

let idCounter = 0;

function computeNutrition(entries: FoodEntry[]) {
  return entries.reduce(
    (acc, e) => {
      const ratio = e.amount / 100;
      return {
        total_calories: acc.total_calories + e.foodData.calories * ratio,
        total_carbs: acc.total_carbs + e.foodData.carbohydrate * ratio,
        total_sugars: acc.total_sugars + e.foodData.sugars * ratio,
        total_fiber: acc.total_fiber + e.foodData.fiber * ratio,
        total_protein: acc.total_protein + e.foodData.protein * ratio,
        total_fat: acc.total_fat + e.foodData.fat * ratio,
      };
    },
    { total_calories: 0, total_carbs: 0, total_sugars: 0, total_fiber: 0, total_protein: 0, total_fat: 0 }
  );
}

export default function FoodPredictPage() {
  useAuthGuard();
  const router = useRouter();
  const [models, setModels] = useState<Record<string, ModelInfo>>({});
  const [form, setForm] = useState<PatientFormValues>(DEFAULT_FORM);

  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<FoodSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodPredictResponse | null>(null);

  useEffect(() => {
    getModels().then((m) => {
      setModels(m);
      const defaultKey = Object.entries(m).find(([, v]) => v.default)?.[0] ?? Object.keys(m)[0];
      if (defaultKey) setForm((f) => ({ ...f, selectedModel: defaultKey }));
    });
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    setSearchLoading(true);
    const results = await searchFoods(q);
    setSuggestions(results);
    setShowDropdown(true);
    setSearchLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(searchQuery), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, doSearch]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function addFood(food: FoodSearchItem) {
    setFoodEntries((prev) => [
      ...prev,
      { id: ++idCounter, name: food.name, amount: 100, foodData: food },
    ]);
    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  }

  function updateAmount(id: number, amount: number) {
    setFoodEntries((prev) => prev.map((e) => (e.id === id ? { ...e, amount } : e)));
  }

  function removeFood(id: number) {
    setFoodEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const nutrition = computeNutrition(foodEntries);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (foodEntries.length === 0) {
      setError("Дор хаяж 1 хоол нэмнэ үү");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const body: FoodPredictRequest = {
        foods: foodEntries.map(({ name, amount }) => ({ name, amount })),
        gender: form.gender,
        age: form.age,
        hypertension: form.hypertension,
        heart_disease: form.heart_disease,
        smoking_history: form.smoking_history,
        height_cm: form.height_cm,
        weight_kg: form.weight_kg,
        model: form.selectedModel,
      };
      const res = await predictFood(body);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-10 bg-background">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/question" className="text-muted-foreground hover:text-foreground text-sm">
              ← Буцах
            </Link>
            <h1 className="text-xl font-bold">Хоол хүнсээр таамаглах</h1>
          </div>
          <button
            onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("email"); router.replace("/"); }}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Гарах →
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Food log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Хоолны жагсаалт</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative" ref={dropdownRef}>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                    placeholder="Хоол хайх..."
                    autoComplete="off"
                  />
                  {searchLoading && (
                    <p className="text-xs text-muted-foreground mt-1">Хайж байна...</p>
                  )}
                  {showDropdown && suggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-md max-h-52 overflow-y-auto">
                      {suggestions.map((food) => (
                        <button
                          key={food.name}
                          type="button"
                          onClick={() => addFood(food)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <span className="font-medium">{food.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            {food.calories} ккал/100г
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {foodEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Хоол нэмэгдээгүй байна
                  </p>
                ) : (
                  <div className="space-y-2">
                    {foodEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-2 rounded-lg border p-2">
                        <span className="flex-1 text-sm truncate">{entry.name}</span>
                        <Input
                          type="number"
                          min={1}
                          value={entry.amount}
                          onChange={(e) => updateAmount(entry.id, parseFloat(e.target.value) || 0)}
                          className="w-20 h-8 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">г</span>
                        <button
                          type="button"
                          onClick={() => removeFood(entry.id)}
                          className="text-muted-foreground hover:text-destructive text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {foodEntries.length > 0 && (
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          {["Калори", "Нүүрс ус", "Чихэр", "Эслэг", "Уураг", "Өөх тос"].map((h) => (
                            <th key={h} className="py-1.5 px-2 text-left font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-1.5 px-2">{nutrition.total_calories.toFixed(0)}</td>
                          <td className="py-1.5 px-2">{nutrition.total_carbs.toFixed(1)}г</td>
                          <td className="py-1.5 px-2">{nutrition.total_sugars.toFixed(1)}г</td>
                          <td className="py-1.5 px-2">{nutrition.total_fiber.toFixed(1)}г</td>
                          <td className="py-1.5 px-2">{nutrition.total_protein.toFixed(1)}г</td>
                          <td className="py-1.5 px-2">{nutrition.total_fat.toFixed(1)}г</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Patient info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Өвчтөний мэдээлэл</CardTitle>
              </CardHeader>
              <CardContent>
                <PatientFormFields
                  values={form}
                  onChange={setForm}
                  models={models}
                />
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">
              {error}
            </div>
          )}

          <div className="mt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Тооцоолж байна..." : "Таамаглах"}
            </Button>
          </div>
        </form>

        {loading && (
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-12 w-48 mx-auto rounded-full" />
              <Skeleton className="h-32 w-48 mx-auto rounded-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        )}

        {result && !loading && (
          <ResultCard result={result} isFoodResult />
        )}
      </div>
    </main>
  );
}
