"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientFormFields, PatientFormValues } from "@/components/patient-form-fields";
import { ResultCard } from "@/components/result-card";
import {
  getModels,
  predict,
  compare,
  PredictRequest,
  PredictResponse,
  CompareResult,
  ModelInfo,
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

export default function PredictPage() {
  useAuthGuard();
  const router = useRouter();
  const [models, setModels] = useState<Record<string, ModelInfo>>({});
  const [form, setForm] = useState<PatientFormValues>(DEFAULT_FORM);
  const [hba1c, setHba1c] = useState(0);
  const [bloodGlucose, setBloodGlucose] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);

  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareResults, setCompareResults] = useState<CompareResult[] | null>(null);

  useEffect(() => {
    getModels().then((m) => {
      setModels(m);
      const defaultKey = Object.entries(m).find(([, v]) => v.default)?.[0] ?? Object.keys(m)[0];
      if (defaultKey) setForm((f) => ({ ...f, selectedModel: defaultKey }));
    });
  }, []);

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
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setCompareResults(null);
    setLoading(true);
    try {
      const res = await predict(buildRequest(), form.selectedModel);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  async function handleCompare() {
    setCompareError(null);
    setCompareLoading(true);
    try {
      const res = await compare(buildRequest());
      setCompareResults(res);
    } catch (err: unknown) {
      setCompareError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setCompareLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-10 bg-background">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/question" className="text-muted-foreground hover:text-foreground text-sm">
              ← Буцах
            </Link>
            <h1 className="text-xl font-bold">Шинжилгээний үзүүлэлтээр таамаглах</h1>
          </div>
          <button
            onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("email"); router.replace("/"); }}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Гарах →
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Мэдээлэл оруулах</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <PatientFormFields
                values={form}
                onChange={setForm}
                models={models}
                showLabValues
                hba1c={hba1c}
                blood_glucose={bloodGlucose}
                onHba1cChange={setHba1c}
                onBloodGlucoseChange={setBloodGlucose}
              />

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Тооцоолж байна..." : "Таамаглах"}
              </Button>
            </form>
          </CardContent>
        </Card>

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
          <>
            {compareError && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">
                {compareError}
              </div>
            )}
            <ResultCard
              result={result}
              isFoodResult={false}
              compareResults={compareResults ?? undefined}
              selectedModel={form.selectedModel}
              onCompare={handleCompare}
              compareLoading={compareLoading}
            />
          </>
        )}
      </div>
    </main>
  );
}
