"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login, register } from "@/lib/api"

export default function Home() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (mode === "signup" && password !== confirm) {
      setError("Нууц үг таарахгүй байна.")
      return
    }
    setLoading(true)
    try {
      const res = mode === "login"
        ? await login(email, password)
        : await register(email, password)
      localStorage.setItem("token", res.access_token)
      localStorage.setItem("email", res.email)
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-linear-to-br from-teal-700 via-teal-600 to-cyan-500 relative overflow-hidden flex-col p-12">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 left-1/4 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute top-1/4 left-1/3 w-48 h-48 rounded-full bg-teal-500/20" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">GlucoCare</p>
              <p className="text-teal-100/70 text-xs mt-0.5">Эрсдэл тооцоолох систем</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center relative z-10 py-12">
          <div className="mb-10">
            <h1 className="text-white text-4xl font-bold leading-tight mb-4">
              Таны эрүүл мэндийг<br />бид хамгаална
            </h1>
            <p className="text-teal-100/80 text-base leading-relaxed max-w-md">
              Хоол хүнс болон шинжилгээний үзүүлэлт дээр үндэслэн чихрийн шижингийн
              эрсдэлийг хиймэл оюун ухаанаар тооцоолно.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {[
              { icon: "🎯", value: "95%+", label: "Нарийвчлал" },
              { icon: "🤖", value: "4", label: "AI Загвар" },
              { icon: "🥗", value: "1000+", label: "Хоолны мэдээлэл" },
              { icon: "⚡", value: "< 1с", label: "Хурд" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-white text-xl font-bold leading-none">{s.value}</p>
                <p className="text-teal-100/70 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {["HbA1c шинжилгээ", "Хоолны дүн шинжилгээ", "Загвар харьцуулалт", "Хувийн зөвлөмж"].map((f) => (
              <span key={f} className="bg-white/15 text-white/90 text-xs px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-teal-100/40 text-xs">© 2025 GlucoCare · Эмнэлгийн зориулалттай хэрэгсэл</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-100">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">GlucoCare</span>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {mode === "login" ? "Тавтай морилно уу 👋" : "Бүртгэл үүсгэх"}
            </h2>
            <p className="text-slate-500 text-sm">
              {mode === "login"
                ? "Системд нэвтрэхийн тулд мэдээллээ оруулна уу"
                : "Шинэ бүртгэл үүсгэн эрүүл мэндээ хянацгааяа"}
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null) }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === m
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">И-мэйл хаяг</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm text-slate-900 placeholder:text-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Нууц үг</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm text-slate-900 placeholder:text-slate-400 transition-all"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Нууц үг давтах</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
                  Нууц үг мартсан уу?
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-teal-200 mt-1"
            >
              {loading
                ? "Уншиж байна..."
                : mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === "login" ? "Бүртгэл байхгүй юу? " : "Бүртгэлтэй юу? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null) }}
              className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              {mode === "login" ? "Бүртгүүлэх" : "Нэвтрэх"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
