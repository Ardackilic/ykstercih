import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Languages,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import data from "@/data/programs.json";
import FavoriteButton from "@/components/favorite-button";
import PreferenceButton from "@/components/preference-button";

type HistoryItem = {
  guideYear: number;
  ranking: number | null;
  baseScore: number | null;
  generalQuota: number | null;
  schoolFirstQuota: number | null;
  conditions: string | null;
  tuitionFee?: number | null;
};

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
  specialStatuses: string[];
  latestGuideYear: number;
  latestResultYear: number | null;
  latestRanking: number | null;
  latestBaseScore: number | null;
  history: Record<string, HistoryItem>;
};

const programs = data.programs as Program[];

const SITE_URL = "https://ykstercih.site";

export const dynamicParams = true;
export const revalidate = 86400;
type ProgramPageProps = {
  params: Promise<{
    id: string;
  }>;
};



export async function generateMetadata({
  params,
}: ProgramPageProps): Promise<Metadata> {
  const { id } = await params;

  const program = programs.find(
    (item) => item.code === id
  );

  if (!program) {
    return {
      title: "Program bulunamadı",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const rankingText =
    program.latestRanking !== null
      ? `${program.latestRanking.toLocaleString(
          "tr-TR"
        )} başarı sırası`
      : "başarı sırası verisi bulunmuyor";

  const scoreText =
    program.latestBaseScore !== null
      ? `${program.latestBaseScore.toFixed(
          3
        )} taban puan`
      : "taban puan verisi bulunmuyor";

  const title =
    `${program.programName} Taban Puanı ve Başarı Sırası – ${program.universityName}`;

  const description =
    `${program.universityName} ${program.programName} bölümü için ` +
    `${program.latestResultYear ?? program.latestGuideYear} yılı ` +
    `${rankingText}, ${scoreText}, kontenjan, puan türü ve geçmiş yıllara ait tercih verilerini incele.`;

  const canonicalUrl =
    `${SITE_URL}/programlar/${encodeURIComponent(
      program.code
    )}`;

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "article",
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


export default async function ProgramDetailPage({
  params,
}: ProgramPageProps) {
  const { id } = await params;

  const program = programs.find((item) => item.code === id);

  if (!program) {
    notFound();
  }

  const historyRows = Object.entries(program.history)
    .map(([year, item]) => ({
      year: Number(year),
      ...item,
    }))
    .sort((a, b) => b.year - a.year);

  const latestHistory =
    program.latestResultYear !== null
      ? program.history[String(program.latestResultYear)]
      : null;

  const trend = getTrend(historyRows);

  const rankingChartRows = historyRows
    .filter(
      (
        item
      ): item is typeof item & {
        ranking: number;
      } => item.ranking !== null
    )
    .sort((a, b) => a.year - b.year);

  const programUrl =
    `https://ykstercih.site/programlar/${encodeURIComponent(
      program.code
    )}`;

  const universityUrl =
    `https://ykstercih.site/universiteler/${encodeURIComponent(
      program.universityName
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
        name: "Programlar",
        item: "https://ykstercih.site/programlar",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: program.universityName,
        item: universityUrl,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: program.programName,
        item: programUrl,
      },
    ],
  };

  const programStructuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: program.programName,
    description:
      `${program.universityName} ${program.programName} programının ` +
      `taban puanı, başarı sırası, kontenjan ve geçmiş yıl bilgileri.`,
    url: programUrl,
    provider: {
      "@type": "CollegeOrUniversity",
      name: program.universityName,
      url: universityUrl,
    },
    educationalProgramMode:
      program.language || "Türkçe",
    occupationalCategory:
      program.academicUnit || program.programName,
    timeToComplete: program.duration
      ? `P${program.duration}Y`
      : undefined,
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
            programStructuredData
          ),
        }}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-red-600 !text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="font-black">YKS Tercih</p>
              <p className="text-xs text-slate-500">Program detayları</p>
            </div>
          </Link>

          <Link
            href="/programlar?geri=1"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold transition hover:border-red-300 hover:text-red-600"
          >
            <ArrowLeft size={17} />
            Programlara dön
          </Link>
        </div>
      </header>

      <section className="px-5 pt-7 lg:px-8">
        <div className="mx-auto max-w-7xl">
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
              href="/programlar?geri=1"
              className="transition hover:text-red-600"
            >
              Programlar
            </Link>

            <span aria-hidden="true">/</span>

            <Link
              href={`/universiteler/${encodeURIComponent(
                program.universityName
              )}`}
              className="transition hover:text-red-600"
            >
              {program.universityName}
            </Link>

            <span aria-hidden="true">/</span>

            <span className="text-slate-900">
              {program.programName}
            </span>
          </nav>

          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-red-600 via-red-600 to-red-500 p-6 text-white shadow-2xl shadow-red-200 sm:p-9">
            <div className="absolute -right-20 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-28 -left-20 size-72 rounded-full bg-red-300/20 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <HeroBadge>{program.scoreType || "Puan türü belirsiz"}</HeroBadge>
                    <HeroBadge>{program.level}</HeroBadge>
                    <HeroBadge>{program.universityType}</HeroBadge>
                    {program.duration && (
                      <HeroBadge>{program.duration} yıllık</HeroBadge>
                    )}
                    {program.scholarship && (
                      <HeroBadge>{program.scholarship}</HeroBadge>
                    )}
                  </div>

                  <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-red-100">
                    {program.universityName}
                  </p>

                  <h1 className="mt-3 max-w-5xl text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
                    {program.programName}
                  </h1>

                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-red-50">
                    {program.academicUnit && (
                      <span>{program.academicUnit}</span>
                    )}
                    <span>Program kodu: {program.code}</span>
                  </div>
                </div>

                <FavoriteButton
                  program={{
                    code: program.code,
                    programName: program.programName,
                    universityName: program.universityName,
                    scoreType: program.scoreType,
                    latestRanking: program.latestRanking,
                  }}
                />
              </div>

              <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <HeroStat
                    label={`${program.latestResultYear ?? "Son"} başarı sırası`}
                    value={formatNullable(program.latestRanking)}
                    emphasis
                  />

                <HeroStat
                  label="Taban puan"
                  value={
                    program.latestBaseScore !== null
                      ? program.latestBaseScore.toFixed(5)
                      : "Veri yok"
                  }
                />

                <HeroStat
                  label="Genel kontenjan"
                  value={
                    latestHistory?.generalQuota !== null &&
                    latestHistory?.generalQuota !== undefined
                      ? String(latestHistory.generalQuota)
                      : "Veri yok"
                  }
                />

                <HeroStat
                  label="Okul birincisi"
                  value={
                    latestHistory?.schoolFirstQuota !== null &&
                    latestHistory?.schoolFirstQuota !== undefined
                      ? String(latestHistory.schoolFirstQuota)
                      : "Yok"
                  }
                />

                <HeroStat
                  label="Eğitim dili"
                  value={program.language || "Türkçe"}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="space-y-7">
          <Section
            title="Program bilgileri"
            icon={<BookOpen size={21} />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow
                icon={<Building2 size={18} />}
                label="Üniversite türü"
                value={program.universityType}
              />

              <InfoRow
                icon={<GraduationCap size={18} />}
                label="Program seviyesi"
                value={program.level}
              />

              <InfoRow
                icon={<CalendarDays size={18} />}
                label="Eğitim süresi"
                value={
                  program.duration
                    ? `${program.duration} yıl`
                    : "Belirtilmemiş"
                }
              />

              <InfoRow
                icon={<Languages size={18} />}
                label="Eğitim dili"
                value={program.language || "Türkçe"}
              />

              <InfoRow
                icon={<BarChart3 size={18} />}
                label="Puan türü"
                value={program.scoreType || "Belirtilmemiş"}
              />

              <InfoRow
                icon={<Sparkles size={18} />}
                label="Burs durumu"
                value={program.scholarship || "Burs bilgisi yok"}
              />

                {typeof program.history["2025"]?.tuitionFee === "number" && (
                  <InfoRow
                    icon={<BookOpen size={18} />}
                    label="2025 yıllık liste ücreti"
                    value={`${formatNumber(
                      program.history["2025"].tuitionFee
                    )} TL`}
                  />
                )}
            </div>

              {typeof program.history["2025"]?.tuitionFee === "number" && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold leading-5 text-amber-800">
                    Bu tutar 2025 yılı için ilan edilen yıllık liste
                    ücretidir. Burs ve indirim oranına göre öğrencinin
                    ödeyeceği gerçek tutar değişebilir.
                  </p>
                </div>
              )}

            {program.specialStatuses.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-black text-slate-700">
                  Özel kontenjan veya durumlar
                </p>

                <div className="flex flex-wrap gap-2">
                  {program.specialStatuses.map((status) => (
                    <span
                      key={status}
                      className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-700"
                    >
                      {status}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section
            title="Yıllara göre başarı sırası"
            icon={<BarChart3 size={21} />}
          >
            <RankingChart rows={rankingChartRows} />

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[680px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs font-black uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-2">Sonuç yılı</th>
                    <th className="px-4 py-2">Başarı sırası</th>
                    <th className="px-4 py-2">Taban puan</th>
                    <th className="px-4 py-2">Kontenjan</th>
                    <th className="px-4 py-2">Okul birincisi</th>
                  </tr>
                </thead>

                <tbody>
                  {historyRows.map((item) => (
                    <tr key={item.year} className="bg-slate-50">
                      <td className="rounded-l-2xl px-4 py-4 font-black">
                        {item.year}
                      </td>

                      <td className="px-4 py-4 font-black text-red-600">
                        {formatNullable(item.ranking)}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {item.baseScore !== null
                          ? item.baseScore.toFixed(5)
                          : "Dolmadı"}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {item.generalQuota ?? "Yok"}
                      </td>

                      <td className="rounded-r-2xl px-4 py-4 font-bold">
                        {item.schoolFirstQuota ?? "Yok"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className={`mt-6 flex items-start gap-3 rounded-2xl p-4 ${trend.className}`}
            >
              <trend.icon size={21} className="mt-0.5 shrink-0" />

              <div>
                <p className="font-black">{trend.title}</p>
                <p className="mt-1 text-sm leading-6">
                  {trend.description}
                </p>
              </div>
            </div>
          </Section>

          <Section
            title="Kontenjan değişimi"
            icon={<Users size={21} />}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {historyRows.map((item) => (
                <div
                  key={item.year}
                  className="rounded-2xl bg-slate-50 p-5"
                >
                  <p className="text-sm font-bold text-slate-500">
                    {item.year}
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {item.generalQuota ?? "—"}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Genel kontenjan
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Özel koşullar"
            icon={<ShieldCheck size={21} />}
          >
            {historyRows.some((item) => item.conditions) ? (
              <div className="space-y-3">
                {historyRows.map((item) =>
                  item.conditions ? (
                    <div
                      key={item.year}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <p className="text-sm font-black text-red-600">
                        {item.year} verisi
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Koşul numaraları: {item.conditions}
                      </p>
                    </div>
                  ) : null
                )}

                <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  Koşul numaralarının açıklamaları ilgili yılın ÖSYM tercih
                  kılavuzundan kontrol edilmelidir.
                </p>
              </div>
            ) : (
              <p className="text-slate-500">
                Bu program için özel koşul bilgisi bulunamadı.
              </p>
            )}
          </Section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl bg-slate-950 p-6 text-white lg:sticky lg:top-5">
            <p className="text-sm font-black text-red-300">
              Tercih analizi
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Sıralamanla karşılaştır
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Bir sonraki adımda bu alanı canlı tercih riski hesaplamasına
              bağlayacağız.
            </p>

            <div className="mt-6 space-y-3">
              <SideInfo
                icon={<CheckCircle2 size={17} />}
                text="Gerçek ÖSYM program verisi"
              />

              <SideInfo
                icon={<CheckCircle2 size={17} />}
                text="Yıllara göre sıralama geçmişi"
              />

              <SideInfo
                icon={<CheckCircle2 size={17} />}
                text="Kontenjan değişimi"
              />
            </div>

            <div className="mt-6 space-y-3">
              <PreferenceButton
                program={{
                  code: program.code,
                  programName: program.programName,
                  universityName: program.universityName,
                  scoreType: program.scoreType,
                  latestRanking: program.latestRanking,
                }}
              />

              <Link
                href="/tercihlerim"
                className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-black !text-white transition hover:bg-white/20"
              >
                Tercih listemi aç
              </Link>

              <Link
                href={`/programlar?puanTuru=${encodeURIComponent(
                  program.scoreType
                )}`}
                className="flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-3 font-black !text-white transition hover:bg-red-500"
              >
                Benzer programları göster
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-black text-slate-500">
              Veri kapsamı
            </p>

            <p className="mt-2 text-lg font-black">
              {historyRows.map((item) => item.year).join(", ")}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Gösterilen başarı sıraları ilgili yerleştirme yıllarına aittir.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}


function HeroBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
      {children}
    </span>
  );
}

function HeroStat({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 backdrop-blur ${
        emphasis
          ? "border-white/40 bg-white text-red-700"
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
      <p className="mt-2 break-words text-xl font-black">{value}</p>
    </div>
  );
}

function RankingChart({
  rows,
}: {
  rows: Array<{
    year: number;
    ranking: number;
  }>;
}) {
  if (rows.length < 2) {
    return null;
  }

  const width = 760;
  const height = 280;
  const paddingX = 58;
  const paddingTop = 32;
  const paddingBottom = 58;

  const rankings = rows.map((item) => item.ranking);
  const minimumRanking = Math.min(...rankings);
  const maximumRanking = Math.max(...rankings);

  const range = Math.max(
    maximumRanking - minimumRanking,
    1
  );

  const chartWidth = width - paddingX * 2;
  const chartHeight =
    height - paddingTop - paddingBottom;

  const points = rows.map((item, index) => {
    const x =
      rows.length === 1
        ? width / 2
        : paddingX +
          (index / (rows.length - 1)) *
            chartWidth;

    /*
     * Başarı sıralamasında küçük sayı daha iyidir.
     * Bu nedenle küçük değer grafikte yukarıda,
     * büyük değer aşağıda gösterilir.
     */
    const y =
      paddingTop +
      ((item.ranking - minimumRanking) / range) *
        chartHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  const polylinePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <div className="overflow-hidden rounded-3xl bg-slate-50 p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black text-slate-900">
            Başarı sırası grafiği
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            Grafikte yukarı çıkmak daha iyi başarı sırasını gösterir.
          </p>
        </div>

        <span className="mt-2 inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700 sm:mt-0">
          Küçük sıra daha iyi
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Yıllara göre başarı sırası grafiği"
          className="min-w-[620px] w-full"
        >
          {[0, 0.25, 0.5, 0.75, 1].map(
            (ratio) => {
              const y =
                paddingTop + ratio * chartHeight;

              const ranking = Math.round(
                minimumRanking + ratio * range
              );

              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.08"
                    strokeWidth="1"
                  />

                  <text
                    x={paddingX - 12}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[11px] font-bold"
                  >
                    {new Intl.NumberFormat(
                      "tr-TR"
                    ).format(ranking)}
                  </text>
                </g>
              );
            }
          )}

          <polyline
            points={polylinePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-600"
          />

          {points.map((point) => (
            <g key={point.year}>
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="white"
                stroke="currentColor"
                strokeWidth="4"
                className="text-red-600"
              />

              <text
                x={point.x}
                y={point.y - 16}
                textAnchor="middle"
                className="fill-slate-900 text-[12px] font-black"
              >
                {new Intl.NumberFormat(
                  "tr-TR"
                ).format(point.ranking)}
              </text>

              <text
                x={point.x}
                y={height - 20}
                textAnchor="middle"
                className="fill-slate-500 text-[12px] font-black"
              >
                {point.year}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          {icon}
        </div>

        <h2 className="text-xl font-black sm:text-2xl">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
      {children}
    </span>
  );
}

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 break-words text-xl font-black">{value}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-black">{value}</p>
      </div>
    </div>
  );
}

function SideInfo({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <span className="text-emerald-400">{icon}</span>
      {text}
    </div>
  );
}

function formatNullable(value: number | null) {
  if (value === null) {
    return "Dolmadı";
  }

  return new Intl.NumberFormat("tr-TR").format(value);
}

function getLatestRanking(program: Program) {
  const rows = Object.entries(program.history)
    .map(([year, item]) => ({
      year: Number(year),
      ranking: item.ranking,
    }))
    .filter(
      (
        item
      ): item is {
        year: number;
        ranking: number;
      } => item.ranking !== null
    )
    .sort((a, b) => b.year - a.year);

  return (
    rows[0] ?? {
      year: null,
      ranking: null,
    }
  );
}

function getTrend(
  history: Array<{
    year: number;
    ranking: number | null;
  }>
) {
  const validRows = history
    .filter((item) => item.ranking !== null)
    .sort((a, b) => a.year - b.year);

  if (validRows.length < 2) {
    return {
      icon: BarChart3,
      title: "Yetersiz geçmiş veri",
      description:
        "Programın eğilimini hesaplamak için en az iki yıllık başarı sırası gerekiyor.",
      className: "bg-slate-100 text-slate-700",
    };
  }

  const oldest = validRows[0].ranking as number;
  const newest = validRows[validRows.length - 1].ranking as number;
  const difference = newest - oldest;
  const percent = Math.abs((difference / oldest) * 100);

  if (difference < 0) {
    return {
      icon: TrendingUp,
      title: "Programın başarı sırası yükselmiş",
      description: `İlk veriden son veriye yaklaşık ${formatNumber(
        Math.abs(difference)
      )} sıra, yani %${percent.toFixed(1)} iyileşme görülüyor.`,
      className: "bg-emerald-50 text-emerald-800",
    };
  }

  if (difference > 0) {
    return {
      icon: TrendingDown,
      title: "Programın başarı sırası gerilemiş",
      description: `İlk veriden son veriye yaklaşık ${formatNumber(
        difference
      )} sıra, yani %${percent.toFixed(1)} gerileme görülüyor.`,
      className: "bg-amber-50 text-amber-800",
    };
  }

  return {
    icon: BarChart3,
    title: "Başarı sırası değişmemiş",
    description: "İlk ve son yıl başarı sırası aynı görünüyor.",
    className: "bg-red-50 text-red-800",
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR").format(Math.round(value));
}
