import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  ChevronRight,
  GraduationCap,
  Layers3,
} from "lucide-react";
import data from "@/data/programs.json";

type Program = {
  code: string;
  programName: string;
  universityName: string;
  universityType: string;
  academicUnit: string | null;
  level: string;
  duration: number | null;
  scoreType: string;
  language: string;
  scholarship: string | null;
  latestRanking: number | null;
  latestBaseScore: number | null;
};

const programs = data.programs as Program[];

const SITE_URL = "https://ykstercih.site";

type UniversityPageProps = {
  params: Promise<{
    name: string;
  }>;
};

const universityNames = Array.from(
  new Set(
    programs.map(
      (program) => program.universityName
    )
  )
);

export function generateStaticParams() {
  return universityNames.map(
    (universityName) => ({
      name: universityName,
    })
  );
}

export async function generateMetadata({
  params,
}: UniversityPageProps): Promise<Metadata> {
  const { name } = await params;
  const universityName =
    decodeURIComponent(name);

  const universityPrograms =
    programs.filter(
      (program) =>
        program.universityName ===
        universityName
    );

  if (universityPrograms.length === 0) {
    return {
      title: "Üniversite bulunamadı",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const universityType =
    universityPrograms[0].universityType;

  const rankingValues =
    universityPrograms
      .map(
        (program) =>
          program.latestRanking
      )
      .filter(
        (
          ranking
        ): ranking is number =>
          ranking !== null
      );

  const bestRanking =
    rankingValues.length > 0
      ? Math.min(...rankingValues)
      : null;

  const title =
    `${universityName} Taban Puanları ve Başarı Sıralamaları`;

  const description =
    `${universityName} bünyesindeki ${universityPrograms.length} ön lisans ve lisans programını incele. ` +
    `${universityType} üniversitesi programlarının taban puanları, başarı sıralamaları, kontenjanları ve bölüm bilgileri` +
    `${
      bestRanking !== null
        ? `; en yüksek başarı sırası ${bestRanking.toLocaleString(
            "tr-TR"
          )}`
        : ""
    }.`;

  const canonicalUrl =
    `${SITE_URL}/universiteler/${encodeURIComponent(
      universityName
    )}`;

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "YKS Tercih",
      url: canonicalUrl,
      title,
      description,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}


export default async function UniversityDetailPage({
  params,
}: UniversityPageProps) {
  const { name } = await params;
  const universityName = decodeURIComponent(name);

  const universityPrograms = programs
    .filter((program) => program.universityName === universityName)
    .sort((a, b) => {
      const aRanking = a.latestRanking ?? Number.MAX_SAFE_INTEGER;
      const bRanking = b.latestRanking ?? Number.MAX_SAFE_INTEGER;

      return aRanking - bRanking;
    });

  if (universityPrograms.length === 0) {
    notFound();
  }

  const universityType = universityPrograms[0].universityType;

  const lisansCount = universityPrograms.filter(
    (program) => program.level === "Lisans"
  ).length;

  const onLisansCount = universityPrograms.filter(
    (program) => program.level === "Ön Lisans"
  ).length;

  const scoreTypes = Array.from(
    new Set(
      universityPrograms
        .map((program) => program.scoreType)
        .filter(Boolean)
    )
  );

  const validRankings = universityPrograms
    .map((program) => program.latestRanking)
    .filter((ranking): ranking is number => ranking !== null);

  const bestRanking =
    validRankings.length > 0 ? Math.min(...validRankings) : null;

  const lowestRanking =
    validRankings.length > 0 ? Math.max(...validRankings) : null;

  const academicUnits = new Set(
    universityPrograms
      .map((program) => program.academicUnit)
      .filter(Boolean)
  ).size;

  const universityUrl =
    `https://ykstercih.site/universiteler/${encodeURIComponent(
      universityName
    )}`;

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana sayfa",
        item: "https://ykstercih.site",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Üniversiteler",
        item: "https://ykstercih.site/universiteler",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: universityName,
        item: universityUrl,
      },
    ],
  };

  const universityStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: universityName,
    url: universityUrl,
    description:
      `${universityName} programları, taban puanları, ` +
      `başarı sıralamaları ve kontenjan bilgileri.`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${universityName} programları`,
      numberOfItems: universityPrograms.length,
      itemListElement: universityPrograms
        .slice(0, 100)
        .map((program, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: program.programName,
          url:
            `https://ykstercih.site/programlar/${encodeURIComponent(
              program.code
            )}`,
        })),
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
            universityStructuredData
          ),
        }}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 !text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="font-black">YKS Tercih</p>
              <p className="text-xs text-slate-500">
                Üniversite detayları
              </p>
            </div>
          </Link>

          <Link
            href="/universiteler"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
          >
            <ArrowLeft size={17} />
            Üniversiteler
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pt-8 lg:px-8">
        <nav
          aria-label="Sayfa yolu"
          className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500"
        >
          <Link
            href="/"
            className="transition hover:text-red-600"
          >
            Ana sayfa
          </Link>

          <span aria-hidden="true">/</span>

          <Link
            href="/universiteler"
            className="transition hover:text-red-600"
          >
            Üniversiteler
          </Link>

          <span aria-hidden="true">/</span>

          <span className="text-slate-900">
            {universityName}
          </span>
        </nav>

        <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-red-600 via-red-600 to-red-500 p-7 text-white shadow-2xl shadow-red-200 sm:p-10">
          <div className="absolute -right-16 -top-16 size-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
              <Building2 size={30} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur">
                {universityType}
              </span>

              {scoreTypes.map((scoreType) => (
                <span
                  key={scoreType}
                  className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur"
                >
                  {scoreType}
                </span>
              ))}
            </div>

            <h1 className="mt-5 max-w-5xl text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
              {universityName}
            </h1>

            <p className="mt-4 max-w-3xl leading-7 text-red-100">
              Üniversitenin tüm ön lisans ve lisans programlarını,
              başarı sıralarını ve kontenjanlarını incele.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <HeroStat
                label="Toplam program"
                value={universityPrograms.length}
              />

              <HeroStat label="Lisans" value={lisansCount} />
              <HeroStat label="Ön lisans" value={onLisansCount} />
              <HeroStat label="Akademik birim" value={academicUnits} />

              <HeroStat
                label="En iyi sıra"
                value={
                  bestRanking !== null ? format(bestRanking) : "Veri yok"
                }
                emphasis
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <BarChart3 size={22} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Sıralama aralığı
                </p>

                <p className="mt-1 text-xl font-black">
                  {bestRanking !== null && lowestRanking !== null
                    ? `${format(bestRanking)} – ${format(lowestRanking)}`
                    : "Veri yok"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Layers3 size={22} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Program dağılımı
                </p>

                <p className="mt-1 text-xl font-black">
                  {lisansCount} lisans · {onLisansCount} ön lisans
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="font-black text-red-600">
            Üniversitenin programları
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight">
            Tüm bölümler
          </h2>

          <p className="mt-3 text-slate-600">
            {universityPrograms.length} program başarı sırasına göre listelendi.
          </p>
        </div>

        <div className="mt-7 grid gap-4">
          {universityPrograms.map((program) => (
            <article
              key={program.code}
              className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{program.scoreType || "Belirsiz"}</Badge>
                    <Badge>{program.level}</Badge>

                    {program.duration && (
                      <Badge>{program.duration} yıllık</Badge>
                    )}

                    {program.scholarship && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                        {program.scholarship}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-xl font-black">
                    {program.programName}
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {program.academicUnit || "Akademik birim belirtilmemiş"}
                    {" · "}
                    {program.language}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[480px]">
                  <MiniStat
                    label="Başarı sırası"
                    value={
                      program.latestRanking !== null
                        ? format(program.latestRanking)
                        : "Dolmadı"
                    }
                  />

                  <MiniStat
                    label="Taban puan"
                    value={
                      program.latestBaseScore !== null
                        ? program.latestBaseScore.toFixed(3)
                        : "Yok"
                    }
                  />

                  <Link
                    href={`/programlar/${program.code}`}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 font-black !text-white transition hover:bg-red-600 sm:col-span-1"
                  >
                    İncele
                    <ChevronRight size={17} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function HeroStat({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string | number;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 backdrop-blur ${
        emphasis
          ? "border-white bg-white text-red-700"
          : "border-white/15 bg-white/10 text-white"
      }`}
    >
      <p
        className={`text-xs font-bold ${
          emphasis ? "text-red-400" : "text-red-100"
        }`}
      >
        {label}
      </p>

      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
      {children}
    </span>
  );
}

function format(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value);
}
