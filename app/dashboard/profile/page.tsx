"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, LogOut, Shield, Activity } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState("")

  useEffect(() => {
    setEmail(localStorage.getItem("email") ?? "")
  }, [])

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("email")
    router.replace("/")
  }

  const initials = email ? email[0].toUpperCase() : "U"

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Профайл</h1>
        <p className="text-slate-500 text-sm mt-0.5">Таны бүртгэлийн мэдээлэл</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-sm shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">{email || "Хэрэглэгч"}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-teal-600 text-sm font-medium">Идэвхтэй хэрэглэгч</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Mail size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">И-мэйл хаяг</p>
            <p className="font-semibold text-slate-800 text-sm truncate">{email || "—"}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
            <Shield size={18} className="text-teal-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Бүртгэлийн төлөв</p>
            <p className="font-semibold text-teal-700 text-sm">Баталгаажсан ✓</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
            <Activity size={18} className="text-violet-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Системийн эрх</p>
            <p className="font-semibold text-slate-800 text-sm">Хэрэглэгч</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <User size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Нэвтрэлтийн арга</p>
            <p className="font-semibold text-slate-800 text-sm">И-мэйл / Нууц үг</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-2xl border border-red-100 p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800 text-sm">Системээс гарах</p>
          <p className="text-slate-400 text-xs mt-0.5">Бүртгэлээсээ гарахдаа дахин нэвтрэх шаардлагатай</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
        >
          <LogOut size={15} />
          Гарах
        </button>
      </div>
    </div>
  )
}
