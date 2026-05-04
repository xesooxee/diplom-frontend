"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Activity, Utensils, User, Lightbulb, ShieldCheck } from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Хяналтын самбар" },
  { href: "/dashboard/predict", icon: Activity, label: "Эрсдэл тооцоолох" },
  { href: "/dashboard/food", icon: Utensils, label: "Хоолны эрсдэл" },
  { href: "/dashboard/admin", icon: ShieldCheck, label: "Админ самбар" },
  { href: "/dashboard/profile", icon: User, label: "Профайл" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-base leading-none truncate">GlucoCare</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">Эрсдэл тооцоолох</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">Цэс</p>
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon
                size={18}
                className={`shrink-0 transition-colors ${
                  active ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span className="truncate">{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom health badge */}
      <div className="px-3 pb-4">
        <div className="bg-linear-to-br from-teal-500 to-cyan-500 rounded-2xl p-4 text-white">
          <Lightbulb size={18} className="text-white mb-1" />
          <p className="text-xs font-semibold mb-0.5">Эрүүл мэндийн зөвлөмж</p>
          <p className="text-xs text-white/75 leading-relaxed">
            Өдөр бүр 30 мин дасгал хөдөлгөөн хийх нь чихрийн шижингийн эрсдэлийг бууруулна.
          </p>
        </div>
      </div>
    </aside>
  )
}
