import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  GraduationCap,
  Search,
} from "lucide-react";
import { seoProgramPages } from "@/data/seo-pages";

const SITE_URL = "https://ykstercih.site";

export const metadata: Metadata = {
  title: "Sıralamaya Göre Bölümler ve Taban Puanları",
  description:
    "SAY, TYT, EA ve SÖZ başarı sıralamana göre bölümleri incele; Bilgisayar Mühendisliği, Hemşirelik, Psikoloji ve Hukuk taban sıralamalarını karşılaştır.",
  alternates: {
    canonical: `${SITE_URL}/siralamaya-gore`,
  },
};

export default function RankingGuidesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Sıralamaya Göre Bölümler",
    url: `${SITE_URL}/siralamaya-gore`,
    inLanguage: "tr-TR",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: seoProgramPages.length,
      itemListElement: seoProgramPages.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: page.title,
        url: `${SITE_URL}/siralamaya-gore/${page.slug}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-red-600 text-white">
              <GraduationCap size={24} />
            </span>
            <span>
              <span className="block font-black">YKS Tercih</span>
              <span className="block text-xs text-slate-500">
                Sıralama rehberleri
              </span>
            </span>
          </Link>

          <Link
            href="/rehber"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
          >
            <ArrowLeft size={17} />
            Rehber
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-700">
            <BarChart3 size={17} />
            2025 yerleştirme sonuçları
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            Sıralamana göre bölümleri ve üniversiteleri incele
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            2026 tercih dönemi için hazırlanmış bu sayfalarda, 2025 başarı
            sıralarına göre programları karşılaştırabilirsin.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {seoProgramPages.map((page) => (
            <Link
              key={page.slug}
              href={`/siralamaya-gore/${page.slug}`}
              className="group flex flex-col rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
                  {page.category}
                </span>
                <Search size={19} className="text-slate-300" />
              </div>

              <h2 className="mt-5 text-2xl font-black leading-tight group-hover:text-red-700">
                {page.shortTitle}
              </h2>

              <p className="mt-4 flex-1 leading-7 text-slate-600">
                {page.description}
              </p>

              <span className="mt-6 flex items-center gap-2 font-black text-red-600 transition group-hover:gap-3">
                Programları incele
                <ArrowRight size={17} />
              </span>
            </Link>
          ))}
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
