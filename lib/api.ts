export const API_BASE = "http://localhost:8000";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}


export interface PredictRequest {
  gender: "Female" | "Male";
  age: number;
  hypertension: 0 | 1;
  heart_disease: 0 | 1;
  smoking_history: "No Info" | "current" | "ever" | "former" | "never" | "not current";
  height_cm: number;
  weight_kg: number;
  hba1c_level: number;
  blood_glucose_level: number;
}

export interface PredictResponse {
  prediction: 0 | 1;
  label: string;
  probability: number;
  risk_level: "Бага" | "Дунд" | "Өндөр";
  message: string;
  recommendations: string[];
  model_used: string;
}

export interface CompareResult {
  model_key: string;
  model_name: string;
  prediction: 0 | 1;
  label: string;
  probability: number;
  risk_level: string;
}

export interface FoodItem {
  name: string;
  amount: number;
}

export interface FoodPredictRequest {
  foods: FoodItem[];
  gender: "Female" | "Male";
  age: number;
  hypertension: 0 | 1;
  heart_disease: 0 | 1;
  smoking_history: string;
  height_cm: number;
  weight_kg: number;
  model: string;
}

export interface FoodPredictResponse extends PredictResponse {
  nutrition: {
    total_calories: number;
    total_carbs: number;
    total_sugars: number;
    total_fiber: number;
    total_protein: number;
    total_fat: number;
  };
  predicted_hba1c: number;
  predicted_glucose: number;
}

export interface FoodSearchItem {
  name: string;
  calories: number;
  carbohydrate: number;
  sugars: number;
  fiber: number;
  protein: number;
  fat: number;
}

export interface ModelInfo {
  name: string;
  available: boolean;
  default: boolean;
}

export async function predict(body: PredictRequest, model: string): Promise<PredictResponse> {
  const res = await fetch(`${API_BASE}/predict?model=${model}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "API error");
  }
  return res.json();
}

export async function compare(body: PredictRequest): Promise<CompareResult[]> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "API error");
  }
  return res.json();
}

export async function predictFood(body: FoodPredictRequest): Promise<FoodPredictResponse> {
  const res = await fetch(`${API_BASE}/predict/food`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "API error");
  }
  return res.json();
}

export async function searchFoods(query: string): Promise<FoodSearchItem[]> {
  const res = await fetch(`${API_BASE}/foods?search=${encodeURIComponent(query)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.foods ?? [];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  email: string;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Бүртгэл амжилтгүй");
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Нэвтрэх амжилтгүй");
  return data;
}

export async function getModels(): Promise<Record<string, ModelInfo>> {
  const res = await fetch(`${API_BASE}/models`, { headers: authHeaders() });
  if (!res.ok) return {};
  return res.json();
}
