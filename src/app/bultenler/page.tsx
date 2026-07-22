import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  CalendarDays,
  GraduationCap,
  Newspaper,
  Sparkles,
} from "lucide-react";
import { bulletins } from "@/data/bulletins";

export const metadata: Metadata = {
  title: "YKS Bültenleri",
  description:
    "2026 YKS sonuç, tercih, kontenjan ve ÖSYM duyurularını takip et.",
};

export default function BulletinsPage() {
  const featuredBulletin =
    bulletins.find((bulletin) => bulletin.important) ?? bulletins[0];

  const otherBulletins = bulletins.filter(
    (bulletin) => bulletin.slug !== featuredBulletin.slug
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-200">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="font-black">YKS Tercih</p>
              <p className="text-xs text-slate-500">Güncel YKS bültenleri</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold transition hover:border-red-300 hover:text-red-600"
          >
            <ArrowLeft size={17} />
            Ana sayfa
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700">
            <BellRing size={17} />
            Güncel gelişmeler
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            YKS ile ilgili önemli gelişmeleri
            <span className="block text-red-600">tek yerde takip et.</span>
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Sonuç tarihleri, tercih süreci, kontenjanlar ve ÖSYM tarafından
            yayımlanan önemli duyurular.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <Link
          href={`/bultenler/${featuredBulletin.slug}`}
          className="group relative block overflow-hidden rounded-[32px] bg-gradient-to-br from-red-700 via-red-700 to-red-500 p-7 text-white shadow-2xl shadow-red-200 transition hover:-translate-y-1 sm:p-10"
        >
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 size-80 rounded-full bg-red-300/20 blur-3xl" />

          <div className="relative max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-red-100">
              <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 backdrop-blur">
                Öne çıkan
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays size={16} />
                {featuredBulletin.date}
              </span>
            </div>

            <h2 className="mt-6 text-3xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">
              {featuredBulletin.title}
            </h2>

            <p className="mt-5 max-w-3xl text-base leading-7 text-red-50 sm:text-lg">
              {featuredBulletin.summary}
            </p>

            <span className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-red-700 transition group-hover:gap-3">
              Haberi incele
              <ArrowRight size={18} />
            </span>
          </div>
        </Link>

        <div className="mt-12 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <Newspaper size={22} />
          </div>

          <div>
            <p className="text-sm font-bold text-red-600">Son gelişmeler</p>
            <h2 className="text-2xl font-black">Tüm bültenler</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {otherBulletins.map((bulletin) => (
            <Link
              key={bulletin.slug}
              href={`/bultenler/${bulletin.slug}`}
              className="group flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-100/60"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
                  {bulletin.category}
                </span>

                <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <CalendarDays size={15} />
                  {bulletin.date}
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-black leading-tight tracking-[-0.02em] transition group-hover:text-red-700">
                {bulletin.title}
              </h3>

              <p className="mt-4 flex-1 leading-7 text-slate-600">
                {bulletin.summary}
              </p>

              <span className="mt-6 flex items-center gap-2 font-black text-red-600 transition group-hover:gap-3">
                Devamını oku
                <ArrowRight size={17} />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-[28px] border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="mt-1 shrink-0 text-amber-600" size={22} />

            <p className="text-sm font-semibold leading-7 text-amber-900">
              Bültenlerdeki bilgiler bilgilendirme amaçlıdır. Başvuru, sonuç ve
              tercih işlemlerinde ÖSYM tarafından yayımlanan resmî duyurular
              esas alınmalıdır.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 text-sm font-semibold text-slate-500 lg:px-8">
          © 2026 YKS Tercih. Tüm hakları saklıdır.
        </div>
      </footer>
    </main>
  );
}
