"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Bell } from "lucide-react"

export function DashboardHeader({ title }: { title?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")

  useEffect(() => {
    setEmail(localStorage.getItem("email") ?? "Хэрэглэгч")
  }, [])

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("email")
    router.replace("/")
  }

  const initials = email ? email[0].toUpperCase() : "U"

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div>
        {title ? (
          <h1 className="text-base font-bold text-slate-900">{title}</h1>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-900">Өдрийн мэнд! </p>
            <p className="text-xs text-slate-400 truncate max-w-xs">{email}</p>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Health status badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full border border-teal-100">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          Идэвхтэй
        </div>

  

        {/* Avatar + email */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-100">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-colors border border-red-100"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Гарах</span>
        </button>
      </div>
    </header>
  )
}
