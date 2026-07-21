import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Home,
  Search,
} from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12 text-slate-950">
      <section className="w-full max-w-3xl rounded-[32px] bg-white p-7 text-center shadow-xl ring-1 ring-slate-200/70 sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
          <GraduationCap size={31} />
        </div>

        <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-indigo-600">
          404 · Sayfa bulunamadı
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
          Aradığın sayfaya ulaşamadık
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
          Adres yanlış yazılmış, sayfa kaldırılmış veya bağlantı güncelliğini
          kaybetmiş olabilir. Aşağıdaki seçeneklerden devam edebilirsin.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black !text-white transition hover:bg-indigo-700"
          >
            <Home size={18} />
            Ana sayfaya dön
          </Link>

          <Link
            href="/programlar"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black !text-white transition hover:bg-slate-800 hover:!text-white"
          >
            <Search size={18} />
            Programları incele
          </Link>

          <Link
            href="/universiteler"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-4 text-sm font-black text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <GraduationCap size={18} />
            Üniversiteleri gör
          </Link>

          <Link
            href="/kyk-yurtlari"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-4 text-sm font-black text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Building2 size={18} />
            KYK yurtlarını gör
          </Link>
        </div>

        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          YKS Tercih ana sayfası
        </Link>
      </section>
    </main>
  );
}
