import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  GraduationCap,
  MapPin,
} from "lucide-react";
import data from "@/data/programs.json";
import {
  getSeoProgramPage,
  seoProgramPages,
} from "@/data/seo-pages";

const SITE_URL = "https://ykstercih.site";
const formatter = new Intl.NumberFormat("tr-TR");

type Program = {
  code: string;
  programName: string;
  universityName: string;
  universityType: string;
  level: string;
  scoreType: string;
  city: string | null;
  latestRanking: number | null;
  latestBaseScore: number | null;
  latestQuota: number | null;
  isActive2025: boolean;
};

const programs = data.programs as Program[];

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return seoProgramPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoProgramPage(slug);

  if (!page) {
    return {
      title: "Sayfa bulunamadı",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical = `${SITE_URL}/siralamaya-gore/${page.slug}`;

  return {
    title: `${page.title} – 2025 Verileri`,
    description: page.description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      locale: "tr_TR",
      siteName: "YKS Tercih",
      url: canonical,
      title: page.title,
      description: page.description,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

export default async function SeoProgramDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const page = getSeoProgramPage(slug);

  if (!page) {
    notFound();
  }

  const matchedPrograms = programs
    .filter((program) => {
      if (!program.isActive2025 || program.latestRanking === null) {
        return false;
      }

      if (page.scoreType && program.scoreType !== page.scoreType) {
        return false;
      }

      if (page.level && program.level !== page.level) {
        return false;
      }

      if (
        page.minRanking !== undefined &&
        program.latestRanking < page.minRanking
      ) {
        return false;
      }

      if (
        page.maxRanking !== undefined &&
        program.latestRanking > page.maxRanking
      ) {
        return false;
      }

      if (page.programKeywords?.length) {
        const normalizedName = normalize(program.programName);

        return page.programKeywords.some((keyword) =>
          normalizedName.includes(normalize(keyword))
        );
      }

      return true;
    })
    .sort(
      (left, right) =>
        (left.latestRanking ?? Number.MAX_SAFE_INTEGER) -
        (right.latestRanking ?? Number.MAX_SAFE_INTEGER)
    )
    .slice(0, 120);

  const canonical = `${SITE_URL}/siralamaya-gore/${page.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.title,
    description: page.description,
    url: canonical,
    inLanguage: "tr-TR",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: matchedPrograms.length,
      itemListElement: matchedPrograms.slice(0, 50).map((program, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${program.universityName} ${program.programName}`,
        url: `${SITE_URL}/programlar/${program.code}`,
      })),
    },
  };

  const breadcrumbData = {
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
        name: "Sıralamaya göre",
        item: `${SITE_URL}/siralamaya-gore`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.shortTitle,
        item: canonical,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
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
                Sıralama rehberi
              </span>
            </span>
          </Link>

          <Link
            href="/siralamaya-gore"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
          >
            <ArrowLeft size={17} />
            Tüm rehberler
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
          <nav className="mb-5 flex flex-wrap gap-2 text-sm font-bold text-slate-500">
            <Link href="/">Ana sayfa</Link>
            <span>/</span>
            <Link href="/siralamaya-gore">Sıralamaya göre</Link>
            <span>/</span>
            <span className="text-slate-900">{page.shortTitle}</span>
          </nav>

          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-700">
            <BarChart3 size={17} />
            2025 yerleştirme verileri
          </span>

          <h1 className="mt-5 max-w-5xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            {page.title}
          </h1>

          <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600">
            {page.intro}
          </p>

          <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-7 text-amber-900">
            2026 kontenjanları ve program koşulları henüz farklılaşabilir.
            Tercih yaparken güncel ÖSYM program ve kontenjan kılavuzunu esas al.
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-black text-red-600">
                  {page.searchQuestion}
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {formatter.format(matchedPrograms.length)} program
                </h2>
              </div>

              <Link
                href="/programlar"
                className="inline-flex items-center gap-2 font-black text-red-600"
              >
                Gelişmiş filtreleri aç
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">
              {matchedPrograms.map((program, index) => (
                <article
                  key={program.code}
                  className="border-b border-slate-200 p-5 last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-600 font-black text-white">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                          {program.scoreType}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                          {program.universityType}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-black leading-7">
                        <Link
                          href={`/programlar/${program.code}`}
                          className="transition hover:text-red-600"
                        >
                          {program.programName}
                        </Link>
                      </h3>

                      <p className="mt-1 font-semibold text-slate-500">
                        {program.universityName}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <span>
                          <strong>Başarı sırası:</strong>{" "}
                          {formatter.format(program.latestRanking!)}
                        </span>

                        <span>
                          <strong>Taban puan:</strong>{" "}
                          {program.latestBaseScore !== null
                            ? program.latestBaseScore.toFixed(3)
                            : "Veri yok"}
                        </span>

                        <span>
                          <strong>Kontenjan:</strong>{" "}
                          {program.latestQuota ?? "Veri yok"}
                        </span>
                      </div>

                      {program.city && (
                        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <MapPin size={15} />
                          {program.city}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {matchedPrograms.length === 0 && (
                <div className="p-14 text-center text-slate-500">
                  Bu ölçütlere uygun program bulunamadı.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <Building2 className="text-red-600" size={22} />
                <h2 className="font-black">Tercih önerileri</h2>
              </div>

              <div className="mt-5 space-y-4">
                {page.tips.map((tip) => (
                  <div key={tip} className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <p className="text-sm font-semibold leading-6 text-slate-600">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-slate-950 p-5 text-white">
              <h2 className="text-xl font-black">
                Kendi sıralamanı kullan
              </h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
                Kesin aralık yerine kendi başarı sıranı girerek zor, yakın ve
                güvenli seçenekleri görüntüle.
              </p>
              <Link
                href="/programlar"
                className="mt-5 flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 font-black text-white"
              >
                Tercih robotunu aç
              </Link>
            </div>
          </aside>
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

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
