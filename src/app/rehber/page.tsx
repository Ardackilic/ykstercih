import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  GraduationCap,
  Home,
  ListChecks,
  Search,
} from "lucide-react";

const SITE_URL = "https://ykstercih.site";

export const metadata: Metadata = {
  title: "YKS Tercih Rehberi – Üniversite ve Bölüm Seçimi",
  description:
    "YKS tercih listesi hazırlama, başarı sırası, taban puanı, üniversite ve bölüm seçimi hakkında kapsamlı rehberleri incele.",
  alternates: {
    canonical: `${SITE_URL}/rehber`,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "YKS Tercih",
    url: `${SITE_URL}/rehber`,
    title:
      "YKS Tercih Rehberi – Üniversite ve Bölüm Seçimi",
    description:
      "Üniversite adayları için YKS tercih, başarı sırası ve bölüm araştırma rehberleri.",
  },
  twitter: {
    card: "summary_large_image",
    title: "YKS Tercih Rehberi",
    description:
      "YKS tercih döneminde ihtiyaç duyacağın rehber içerikleri incele.",
  },
};

const guides = [
  {
    href: "/rehber/yks-tercih-listesi-nasil-hazirlanir",
    icon: ListChecks,
    category: "Tercih listesi",
    title: "YKS tercih listesi nasıl hazırlanır?",
    description:
      "Başarı sırasına göre dengeli bir tercih listesi hazırlamak için uygulanabilecek adımları incele.",
  },
  {
    href: "/programlar",
    icon: Search,
    category: "Program araştırması",
    title: "Sıralamana göre üniversite programı bul",
    description:
      "TYT, SAY, EA, SÖZ veya DİL başarı sırana göre programları filtrele ve karşılaştır.",
  },
  {
    href: "/universiteler",
    icon: GraduationCap,
    category: "Üniversiteler",
    title: "Üniversitelerin programlarını karşılaştır",
    description:
      "Üniversitelerdeki lisans ve ön lisans programlarını, taban puanlarını ve başarı sıralarını görüntüle.",
  },
  {
    href: "/kyk-yurtlari",
    icon: Home,
    category: "Barınma",
    title: "Şehirlere göre KYK yurtlarını incele",
    description:
      "Üniversite tercihi öncesinde şehirlerdeki yurtların adres, cinsiyet ve kapasite bilgilerine ulaş.",
  },
];

export default function GuidesPage() {
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana sayfa",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Rehber",
        item: `${SITE_URL}/rehber`,
      },
    ],
  };

  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "YKS Tercih Rehberi",
    description:
      "YKS tercih ve üniversite araştırma rehberleri.",
    url: `${SITE_URL}/rehber`,
    inLanguage: "tr-TR",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: guides.length,
      itemListElement: guides.map(
        (guide, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: guide.title,
          url: guide.href.startsWith("/rehber/")
            ? `${SITE_URL}${guide.href}`
            : `${SITE_URL}${guide.href}`,
        })
      ),
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbStructuredData
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            collectionStructuredData
          ),
        }}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-red-600 !text-white">
              <GraduationCap size={24} />
            </span>

            <span>
              <span className="block font-black">
                YKS Tercih
              </span>

              <span className="block text-xs text-slate-500">
                Tercih rehberi
              </span>
            </span>
          </Link>

          <Link
            href="/programlar"
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black !text-white transition hover:bg-red-700 hover:!text-white"
          >
            Programları ara
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <nav
          aria-label="Sayfa yolu"
          className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-500"
        >
          <Link
            href="/"
            className="transition hover:text-red-600"
          >
            Ana sayfa
          </Link>

          <span>/</span>

          <span className="text-slate-900">
            Rehber
          </span>
        </nav>

        <section className="overflow-hidden rounded-[34px] bg-gradient-to-br from-red-600 via-red-600 to-red-700 p-7 text-white shadow-xl sm:p-10">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15">
            <BookOpen size={28} />
          </span>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-red-100">
            Üniversite adayları için
          </p>

          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
            YKS tercih rehberi
          </h1>

          <p className="mt-5 max-w-3xl text-sm font-semibold leading-7 text-red-100 sm:text-base">
            Tercih listesi hazırlama, başarı
            sırası, üniversite araştırması ve
            barınma seçenekleriyle ilgili
            rehberleri tek yerde incele.
          </p>
        </section>

        <section className="mt-8">
          <div>
            <p className="font-black text-red-600">
              Öne çıkan içerikler
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Tercih sürecinde işine yarayacak rehberler
            </h2>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {guides.map((guide) => {
              const Icon = guide.icon;

              return (
                <article
                  key={guide.href}
                  className="flex flex-col rounded-[26px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-red-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                      <Icon size={23} />
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                      {guide.category}
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl font-black leading-7">
                    <Link
                      href={guide.href}
                      className="transition hover:text-red-600"
                    >
                      {guide.title}
                    </Link>
                  </h2>

                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
                    {guide.description}
                  </p>

                  <div className="mt-auto pt-6">
                    <Link
                      href={guide.href}
                      className="inline-flex items-center gap-2 text-sm font-black text-red-600 transition hover:gap-3"
                    >
                      İncele
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <BarChart3 size={23} />

                <h2 className="text-xl font-black">
                  Sıralamana göre program araştır
                </h2>
              </div>

              <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-300">
                Başarı sıranı girerek sana yakın
                üniversite programlarını bul ve
                geçmiş yılların sonuçlarını
                karşılaştır.
              </p>
            </div>

            <Link
              href="/programlar"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-black !text-slate-950 transition hover:bg-red-50 hover:!text-slate-950"
            >
              Program aramasını aç
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
