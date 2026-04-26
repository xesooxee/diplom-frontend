"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { useRouter } from "next/navigation";

export default function QuestionPage() {
  useAuthGuard();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    router.replace("/");
  }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-linear-to-b from-background to-muted/30">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-3">
          <div className="flex justify-end mb-2">
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Гарах →
            </button>
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-900/60">GlucoCare</p>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            Та HbA1c болон цусан дахь сахарын шинжилгээний үр дүнгээ мэдэж байна уу?
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/predict" className="group">
            <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">🔬</div>
                <p className="text-xl font-semibold">Тийм, мэднэ</p>
                <p className="text-sm text-muted-foreground text-center">
                  Шинжилгээний үзүүлэлтээрээ таамаглах
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/predict/food" className="group">
            <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">🥗</div>
                <p className="text-xl font-semibold">Үгүй, мэдэхгүй</p>
                <p className="text-sm text-muted-foreground text-center">
                  Өдрийн хоол хүнсээрээ таамаглах
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
