"use client"

import Link from "next/link"
import { Activity, Utensils, BarChart3, TrendingUp, Heart, Shield } from "lucide-react"

const quickActions = [
  {
    href: "/dashboard/predict",
    icon: Activity,
    color: "bg-teal-50 text-teal-600 border-teal-100",
    iconBg: "bg-teal-100",
    title: "Эрсдэл тооцоолох",
    desc: "HbA1c болон цусан дахь сахарын үзүүлэлтээрээ таамаглах",
    badge: "Хамгийн түгээмэл",
    badgeColor: "bg-teal-100 text-teal-700",
  },
  {
    href: "/dashboard/food",
    icon: Utensils,
    color: "bg-orange-50 text-orange-600 border-orange-100",
    iconBg: "bg-orange-100",
    title: "Хоолны эрсдэл",
    desc: "Идсэн хоол хүнсээ оруулж эрсдэлээ тооцоолох",
    badge: "Хоол хүнс",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    href: "/dashboard/compare",
    icon: BarChart3,
    color: "bg-violet-50 text-violet-600 border-violet-100",
    iconBg: "bg-violet-100",
    title: "Загвар харьцуулах",
    desc: "RF, LR, SVM, XGBoost загваруудыг харьцуулж дүн шинжилгээ хийх",
    badge: "AI Загвар",
    badgeColor: "bg-violet-100 text-violet-700",
  },
]

const healthTips = [
  { icon: "🥦", title: "Ногоо идэх", desc: "Өдөрт 5 өнгийн ногоо идэх нь чихрийн шижингээс сэргийлнэ." },
  { icon: "🏃", title: "Дасгал хөдөлгөөн", desc: "7 хоногт дор хаяж 150 минут дунд зэргийн хөдөлгөөн хийгээрэй." },
  { icon: "💧", title: "Ус уух", desc: "Өдөрт 8 аяга ус уух нь цусан дахь сахарыг тогтворжуулна." },
  { icon: "😴", title: "Хангалттай унтах", desc: "7-9 цаг унтах нь инсулины эсэргүүцлийг бууруулна." },
]

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome section */}
      <div className="bg-linear-to-br from-teal-600 to-cyan-500 rounded-3xl p-7 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/8" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
              <span className="text-teal-100 text-sm font-medium">Систем идэвхтэй</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">GlucoCare Хяналтын самбар</h1>
            <p className="text-teal-100/80 text-sm max-w-md leading-relaxed">
              Чихрийн шижингийн эрсдэлийг тооцоолоход тавтай морилно уу.
              Доорх хэрэгслүүдийг ашиглан эрүүл мэндээ хянаарай.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-center gap-1 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20">
            <Shield size={28} className="text-white mb-1" />
            <span className="text-white text-xs font-semibold">Найдвартай</span>
            <span className="text-teal-100/70 text-xs">95%+ нарийвчлал</span>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: "🤖", val: "4", label: "AI Загвар" },
            { icon: "📊", val: "3", label: "Тооцоолох арга" },
            { icon: "💊", val: "∞", label: "Зөвлөмж" },
          ].map((s) => (
            <div key={s.label} className="bg-white/12 rounded-xl px-4 py-3 border border-white/15">
              <div className="text-lg mb-0.5">{s.icon}</div>
              <div className="text-white font-bold text-base leading-none">{s.val}</div>
              <div className="text-teal-100/70 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Хурдан үйлдэл</h2>
          <TrendingUp size={16} className="text-slate-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <div className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md hover:-translate-y-0.5 ${action.color}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center`}>
                    <action.icon size={20} />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${action.badgeColor}`}>
                    {action.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{action.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{action.desc}</p>
                <div className="mt-4 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Эхлэх <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Health info + tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tips */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 mb-4">Эрүүл мэндийн зөвлөмж</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {healthTips.map((tip) => (
              <div key={tip.title} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-start gap-3 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0">
                  {tip.icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm mb-1">{tip.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info card */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4">Чихрийн шижин гэж юу вэ?</h2>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <Heart size={17} className="text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Чихрийн шижин</p>
                <p className="text-slate-400 text-xs">Цусан дахь сахарын өвчин</p>
              </div>
            </div>
            {[
              { label: "HbA1c хэвийн", val: "< 5.7%", color: "text-green-600 bg-green-50" },
              { label: "HbA1c эрсдэлтэй", val: "5.7–6.4%", color: "text-amber-600 bg-amber-50" },
              { label: "HbA1c чихрийн шижин", val: "≥ 6.5%", color: "text-red-600 bg-red-50" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{r.label}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.color}`}>{r.val}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Цусан дахь сахарыг тогтмол шалгаж, эрт илрүүлэх нь чихрийн шижингээс урьдчилан сэргийлэх гол арга юм.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
