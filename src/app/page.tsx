import Link from "next/link";
import data from "@/data/programs.json";
import { allDormitories } from "@/data/all-dormitories";
import RankingSearchForm from "@/components/ranking-search-form";
import {
  BarChart3,
  BookOpen,
  Building2,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Sıralamana göre ara",
    description:
      "TYT, SAY, EA, SÖZ veya DİL sıralamanı girerek sana uygun programları bul.",
    href: "/programlar",
  },
  {
    icon: BarChart3,
    title: "Geçmiş yılları karşılaştır",
    description:
      "Programların taban sıralamalarını, puanlarını ve kontenjan değişimlerini incele.",
    href: "/programlar",
  },
  {
    icon: Home,
    title: "Yurtları incele",
    description:
      "KYK ve özel yurtların oda tiplerini, kapasitelerini ve kampüse uzaklığını gör.",
    href: "/yurtlar",
  },
  {
    icon: Heart,
    title: "Tercih listeni oluştur",
    description:
      "Beğendiğin programları kaydet, karşılaştır ve 24 tercihlik listeni hazırla.",
    href: "/tercihlerim",
  },
];

const samplePrograms = data.programs
  .filter(
    (program) =>
      program.scoreType === "SAY" &&
      program.latestRanking !== null &&
      program.latestRanking >= 60000 &&
      program.latestRanking <= 110000
  )
  .sort(
    (a, b) =>
      (a.latestRanking ?? Number.MAX_SAFE_INTEGER) -
      (b.latestRanking ?? Number.MAX_SAFE_INTEGER)
  )
  .slice(0, 3);


const popularDormitoryCities = Array.from(
  new Set(
    allDormitories
      .map((dormitory) => dormitory.city)
      .filter(Boolean)
  )
)
  .map((city) => ({
    city,
    slug: createCitySlug(city),
    dormitoryCount: allDormitories.filter(
      (dormitory) => dormitory.city === city
    ).length,
  }))
  .sort(
    (left, right) =>
      right.dormitoryCount - left.dormitoryCount ||
      left.city.localeCompare(right.city, "tr-TR")
  )
  .slice(0, 12);

const statistics = [
  {
    value: new Intl.NumberFormat("tr-TR").format(
      data.metadata.universityCount
    ),
    label: "Üniversite",
  },
  {
    value: new Intl.NumberFormat("tr-TR").format(
      data.metadata.programCount
    ),
    label: "Toplam program",
  },
  {
    value: new Intl.NumberFormat("tr-TR").format(
      data.metadata.byLevel.onLisans
    ),
    label: "Ön lisans programı",
  },
  {
    value: new Intl.NumberFormat("tr-TR").format(
      data.metadata.byLevel.lisans
    ),
    label: "Lisans programı",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-600 !text-white shadow-lg shadow-indigo-200">
              <GraduationCap size={25} />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight">YKS Tercih</p>
              <p className="text-xs text-slate-500">YKS tercih rehberi</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <Link href="/programlar" className="transition hover:text-indigo-600">
              Programlar
            </Link>
            <Link href="/universiteler" className="transition hover:text-indigo-600">
              Üniversiteler
            </Link>
            <Link href="/kyk-yurtlari" className="transition hover:text-indigo-600">
              KYK Yurtları
            </Link>
            <Link
              href="/rehber"
              className="transition hover:text-indigo-600"
            >
              Rehber
            </Link>

            <Link href="/tercihlerim" className="transition hover:text-indigo-600">
              Tercihlerim
            </Link>
          </nav>

          <Link
            href="/programlar"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black !text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:!text-white"
          >
            Tüm programları gör
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
              <Sparkles size={16} />
              Öğrenciler için ücretsiz tercih rehberi
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-7xl">
              Sıralamanı yaz,
              <span className="gradient-text block">
                sana uygun bölümleri keşfet.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Gerçek ÖSYM verileriyle bölümleri karşılaştır, sıralamana yakın
              seçenekleri bul ve 24 tercihlik kişisel listeni hazırla.
            </p>

            <div className="mt-9 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60">
              <RankingSearchForm />
            </div>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-600" />
                Kişisel bilgi istemez
              </span>
              <span className="flex items-center gap-2">
                <BookOpen size={17} className="text-emerald-600" />
                Resmî verilere dayalı
              </span>
              <span className="flex items-center gap-2">
                <Building2 size={17} className="text-emerald-600" />
                Tüm üniversiteler
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[40px] bg-gradient-to-br from-indigo-200 to-sky-100 blur-2xl" />

            <div className="relative rounded-[32px] border border-white bg-white/90 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Tercih analizi örneği
                  </p>
                  <h2 className="mt-1 text-2xl font-black">SAY · 82.000</h2>
                </div>

                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                  <BarChart3 size={25} />
                </div>
              </div>

              <div className="mt-7 space-y-4">
                {samplePrograms.map((program, index) => {
                  const status =
                    index === 0
                      ? {
                          label: "Sıralamana yakın",
                          className: "bg-amber-100 text-amber-700",
                        }
                      : index === 1
                        ? {
                            label: "Güvenli",
                            className: "bg-emerald-100 text-emerald-700",
                          }
                        : {
                            label: "Riskli",
                            className: "bg-rose-100 text-rose-700",
                          };

                  return (
                    <ProgramCard
                      key={program.code}
                      title={program.programName}
                      university={program.universityName}
                      ranking={
                        program.latestRanking !== null
                          ? new Intl.NumberFormat("tr-TR").format(
                              program.latestRanking
                            )
                          : "Veri yok"
                      }
                      status={status.label}
                      statusClass={status.className}
                    />
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-300">Akıllı değerlendirme</p>
                <p className="mt-2 font-bold leading-6">
                  Sıralamana uygun programlar, geçmiş yıl hareketleri ve
                  kontenjan değişimleri birlikte değerlendirilecek.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-slate-200 px-5 md:grid-cols-4 md:divide-y-0 lg:px-8">
          {statistics.map((stat) => (
            <div key={stat.label} className="px-4 py-8 text-center">
              <p className="text-3xl font-black text-indigo-600">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-bold text-indigo-600">Tek platformda her şey</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Tercih yaparken ihtiyaç duyacağın araçlar
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Sadece taban puan gösteren bir liste değil, karar vermeni
            kolaylaştıran kapsamlı bir öğrenci platformu.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.title}
                href={feature.href}
                aria-label={feature.title}
                className="group block rounded-3xl border border-slate-200 bg-white p-6 text-slate-950 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 text-lg font-black">
                  {feature.title}
                </h3>

                <p className="mt-2 leading-7 text-slate-600">
                  {feature.description}
                </p>

                <span className="mt-5 inline-flex text-sm font-black text-indigo-600">
                  İncele →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 YKS Tercih</p>
          <p>
            Gösterilen analizler kesin yerleştirme sonucu değildir.
          </p>
        </div>
      </footer>
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-indigo-600">
                KYK yurt rehberi
              </p>

              <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Şehrindeki KYK yurtlarını incele
              </h2>

              <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
                Üniversite tercihi yapmadan önce okuyacağın şehirdeki KYK
                yurtlarının adres, kapasite, cinsiyet ve iletişim bilgilerine
                göz at.
              </p>
            </div>

            <Link
              href="/kyk-yurtlari"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black !text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Tüm şehirleri görüntüle
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {popularDormitoryCities.map((item) => (
              <Link
                key={item.slug}
                href={`/kyk-yurtlari/${item.slug}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <MapPin size={19} />
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate font-black text-slate-900 transition group-hover:text-indigo-700">
                      {item.city} KYK yurtları
                    </span>

                    <span className="mt-0.5 block text-xs font-bold text-slate-500">
                      {item.dormitoryCount} yurt
                    </span>
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="font-black text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500"
                >
                  →
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-[24px] bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="text-lg font-black">
                Şehirden bağımsız gelişmiş yurt araması
              </h3>

              <p className="mt-1 text-sm font-semibold leading-6 text-slate-300">
                Yurtları şehir, cinsiyet, kapasite ve diğer seçeneklerle filtrele.
              </p>
            </div>

            <Link
              href="/yurtlar"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-black !text-slate-950 transition hover:bg-indigo-50"
            >
              Yurt aramasını aç
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

function ProgramCard({
  title,
  university,
  ranking,
  status,
  statusClass,
}: {
  title: string;
  university: string;
  ranking: string;
  status: string;
  statusClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-500">{university}</p>
        </div>

        <button
          type="button"
          aria-label="Favorilere ekle"
          className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
        >
          <Heart size={18} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400">Son başarı sırası</p>
          <p className="font-black">{ranking}</p>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function createCitySlug(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

