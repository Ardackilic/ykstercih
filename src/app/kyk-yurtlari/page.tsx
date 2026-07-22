import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { allDormitories } from "@/data/all-dormitories";
import { generatedDormitoryCapacityMap } from "@/data/generated-dormitory-capacities";
import CityDormitoryGrid from "@/components/dormitories/CityDormitoryGrid";

const SITE_URL = "https://ykstercih.site";

export const metadata: Metadata = {
  title: "Türkiye KYK Yurtları – Şehirlere Göre Yurt Listesi",
  description:
    "Türkiye'nin 81 ilindeki KYK yurtlarını şehir şehir incele. Yurt sayısı, kız ve erkek yurtları, doğrulanmış kapasite, adres ve iletişim bilgilerine ulaş.",
  alternates: {
    canonical: `${SITE_URL}/kyk-yurtlari`,
  },
  openGraph: {
    title: "Türkiye KYK Yurtları | YKS Tercih",
    description:
      "81 ildeki KYK yurtlarını şehir, kapasite ve cinsiyet bilgilerine göre incele.",
    url: `${SITE_URL}/kyk-yurtlari`,
    siteName: "YKS Tercih",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Türkiye KYK Yurtları | YKS Tercih",
    description:
      "81 ildeki KYK öğrenci yurtlarını şehir şehir incele.",
  },
};

type CitySummary = {
  city: string;
  slug: string;
  totalDormitories: number;
  femaleDormitories: number;
  maleDormitories: number;
  mixedDormitories: number;
  dormitoriesWithCapacity: number;
  totalCapacity: number;
};

const citySummaries: CitySummary[] = Array.from(
  new Set(
    allDormitories
      .map((dormitory) => dormitory.city)
      .filter(Boolean)
  )
)
  .map((city) => {
    const cityDormitories =
      allDormitories.filter(
        (dormitory) =>
          dormitory.city === city
      );

    const capacities =
      cityDormitories
        .map((dormitory) =>
          getCapacity(dormitory)
        )
        .filter(
          (capacity): capacity is number =>
            capacity !== null
        );

    return {
      city,
      slug: createCitySlug(city),
      totalDormitories:
        cityDormitories.length,
      femaleDormitories:
        cityDormitories.filter(
          (dormitory) =>
            dormitory.gender === "Kız"
        ).length,
      maleDormitories:
        cityDormitories.filter(
          (dormitory) =>
            dormitory.gender === "Erkek"
        ).length,
      mixedDormitories:
        cityDormitories.filter(
          (dormitory) =>
            dormitory.gender === "Karma"
        ).length,
      dormitoriesWithCapacity:
        capacities.length,
      totalCapacity:
        capacities.reduce(
          (total, capacity) =>
            total + capacity,
          0
        ),
    };
  })
  .sort((left, right) =>
    left.city.localeCompare(
      right.city,
      "tr-TR"
    )
  );

const totalVerifiedCapacity =
  citySummaries.reduce(
    (total, city) =>
      total + city.totalCapacity,
    0
  );

const totalCapacityRecords =
  citySummaries.reduce(
    (total, city) =>
      total +
      city.dormitoriesWithCapacity,
    0
  );

export default function KykDormitoryCitiesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Türkiye KYK Yurtları",
    description:
      "Türkiye'deki KYK öğrenci yurtlarının şehirlere göre listesi.",
    url: `${SITE_URL}/kyk-yurtlari`,
    inLanguage: "tr-TR",
    numberOfItems: citySummaries.length,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems:
        citySummaries.length,
      itemListElement:
        citySummaries.map(
          (city, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${city.city} KYK Yurtları`,
            url: `${SITE_URL}/kyk-yurtlari/${city.slug}`,
          })
        ),
    },
  };

  const frequentlyAskedQuestions = [
    {
      question:
        "KYK yurt bilgileri güncel mi?",
      answer:
        "Yurt adresi, telefon ve kapasite bilgileri farklı tarihlerde yayımlanan kaynaklardan gelebilir. Her yurt detayında bulunan kaynak ve kayıt yılı kontrol edilmeli; başvuru öncesinde KYGM, e-Devlet veya yurt müdürlüğünden doğrulama yapılmalıdır.",
    },
    {
      question:
        "Bir şehirdeki kız ve erkek KYK yurtlarını nasıl bulabilirim?",
      answer:
        "Şehir kartını açtıktan sonra o ildeki yurtların cinsiyet, kapasite, adres ve iletişim bilgilerini görebilirsin. Gelişmiş yurt aramasında ayrıca cinsiyet ve kapasite filtrelerini kullanabilirsin.",
    },
    {
      question:
        "Yurt kapasitesi ne anlama geliyor?",
      answer:
        "Yurt kapasitesi, ilgili kayıtta yurtta barınabildiği belirtilen öğrenci sayısını ifade eder. Kapasite zamanla değişebileceği için yanında gösterilen kaynak yılı dikkate alınmalıdır.",
    },
    {
      question:
        "Üniversiteye en yakın KYK yurdu nasıl bulunur?",
      answer:
        "Yurt detay sayfalarında koordinatı bulunan kayıtlar için yakın üniversite ve kuş uçuşu mesafe bilgileri gösterilir. Gerçek ulaşım süresi trafik, toplu taşıma ve kampüs girişine göre değişebilir.",
    },
    {
      question:
        "KYK yurdu seçerken nelere dikkat etmeliyim?",
      answer:
        "Yurdun kampüse uzaklığı, toplu taşıma imkânı, cinsiyet bilgisi, kapasitesi, adresi ve güncel iletişim bilgileri birlikte değerlendirilmelidir.",
    },
  ];

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: frequentlyAskedQuestions.map(
      (item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })
    ),
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
        name: "KYK Yurtları",
        item: `${SITE_URL}/kyk-yurtlari`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbData
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqStructuredData
          ),
        }}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Ana sayfa
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 font-black text-red-600"
          >
            <GraduationCap size={21} />
            YKS Tercih
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
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

          <span className="text-slate-900">
            KYK Yurtları
          </span>
        </nav>

        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-red-600 via-red-600 to-red-700 p-6 text-white shadow-xl sm:p-9">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Building2 size={28} />
          </div>

          <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
            Türkiye KYK yurtları
          </h1>

          <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-red-100 sm:text-base">
            Türkiye genelindeki KYK öğrenci
            yurtlarını şehir şehir incele.
            Yurtların adres, telefon, cinsiyet,
            kapasite ve üniversite yakınlığı
            bilgilerine ulaş.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <HeroBadge>
              {citySummaries.length} şehir
            </HeroBadge>

            <HeroBadge>
              {allDormitories.length} yurt
            </HeroBadge>

            <HeroBadge>
              {totalCapacityRecords} kapasite kaydı
            </HeroBadge>

            {totalVerifiedCapacity > 0 && (
              <HeroBadge>
                {totalVerifiedCapacity.toLocaleString(
                  "tr-TR"
                )}{" "}
                toplam doğrulanmış kapasite
              </HeroBadge>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<MapPin size={21} />}
            label="Listelenen şehir"
            value={citySummaries.length}
          />

          <StatCard
            icon={<Building2 size={21} />}
            label="Toplam yurt"
            value={allDormitories.length}
          />

          <StatCard
            icon={<ShieldCheck size={21} />}
            label="Kapasitesi bulunan"
            value={totalCapacityRecords}
          />

          <StatCard
            icon={<Users size={21} />}
            label="Doğrulanmış kapasite"
            value={totalVerifiedCapacity}
          />
        </section>

        <section className="mt-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
          <h2 className="text-2xl font-black">
            Şehre göre KYK yurdu bul
          </h2>

          <p className="mt-3 max-w-4xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
            Üniversite tercihi yaparken
            okuyacağın şehirdeki yurt
            seçeneklerini önceden incelemek;
            barınma, ulaşım ve kampüs
            yakınlığı açısından daha doğru
            karar vermene yardımcı olur. Aşağıdan
            bir şehir seçerek o ilde bulunan KYK
            yurtlarını ve doğrulanmış bilgileri
            görüntüleyebilirsin.
          </p>

          <Link
            href="/yurtlar"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
          >
            <Search size={17} />
            Gelişmiş yurt aramasını aç
          </Link>
        </section>

        <section className="mt-8">
          <div>
            <p className="font-black text-red-600">
              81 il yurt rehberi
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Şehirlere göre KYK yurtları
            </h2>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Bir şehri seçerek yurtların
              ayrıntılı listesine ulaş.
            </p>
          </div>

          <CityDormitoryGrid
            cities={citySummaries}
          />
        </section>

        <section className="mt-8">
          <div>
            <p className="font-black text-red-600">
              Merak edilenler
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              KYK yurtları hakkında sık sorulan sorular
            </h2>

            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              Yurt araştırırken kapasite, yakınlık ve veri güncelliğiyle ilgili önemli noktalar.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {frequentlyAskedQuestions.map(
              (item) => (
                <details
                  key={item.question}
                  className="group rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 open:ring-red-200"
                >
                  <summary className="cursor-pointer list-none pr-8 font-black leading-7 marker:hidden">
                    {item.question}
                  </summary>

                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm font-semibold leading-7 text-slate-600">
                    {item.answer}
                  </p>
                </details>
              )
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 p-5 sm:p-7">
          <h2 className="font-black text-amber-900">
            Yurt bilgileri hakkında
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-amber-800">
            Yurt kapasitesi, adres ve iletişim
            bilgileri zamanla değişebilir.
            Başvuru yapmadan önce güncel bilgileri
            KYGM, e-Devlet ve ilgili yurt
            müdürlüğünden doğrula.
          </p>
        </section>
      </section>
    </main>
  );
}

function getCapacity(
  dormitory: (typeof allDormitories)[number]
): number | null {
  const generatedCapacity =
    generatedDormitoryCapacityMap.get(
      dormitory.id
    );

  return (
    dormitory.capacity ??
    generatedCapacity?.capacity ??
    dormitory.historicalCapacity ??
    null
  );
}

function HeroBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-black backdrop-blur">
      {children}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        {icon}
      </div>

      <p className="mt-4 text-sm font-black text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black">
        {value.toLocaleString("tr-TR")}
      </p>
    </article>
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
