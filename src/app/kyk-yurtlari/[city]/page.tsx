import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  ExternalLink,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

import { allDormitories } from "@/data/all-dormitories";
import { generatedDormitoryCapacityMap } from "@/data/generated-dormitory-capacities";

const SITE_URL = "https://ykstercih.site";

type PageProps = {
  params: Promise<{
    city: string;
  }>;
};

const cities = Array.from(
  new Set(
    allDormitories
      .map((dormitory) => dormitory.city)
      .filter(Boolean)
  )
).sort((left, right) =>
  left.localeCompare(right, "tr-TR")
);

export function generateStaticParams() {
  return cities.map((city) => ({
    city: createSlug(city),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;

  const city = cities.find(
    (item) => createSlug(item) === citySlug
  );

  if (!city) {
    return {
      title: "Şehir bulunamadı",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cityDormitories = allDormitories.filter(
    (dormitory) => dormitory.city === city
  );

  const verifiedCapacity = cityDormitories.reduce(
    (total, dormitory) => {
      const capacity = getCapacity(dormitory);

      return capacity !== null
        ? total + capacity
        : total;
    },
    0
  );

  const canonicalUrl =
    `${SITE_URL}/kyk-yurtlari/${citySlug}`;

  const title =
    `${city} KYK Yurtları, Kapasiteleri ve Adresleri`;

  const description =
    `${city} KYK yurtlarını incele. ${cityDormitories.length} öğrenci yurdunun adres, telefon, cinsiyet ve kapasite bilgilerini karşılaştır${
      verifiedCapacity > 0
        ? `. Doğrulanmış toplam kapasite ${verifiedCapacity.toLocaleString(
            "tr-TR"
          )} öğrenci`
        : ""
    }.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "YKS Tercih",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CityDormitoriesPage({
  params,
}: PageProps) {
  const { city: citySlug } = await params;

  const city = cities.find(
    (item) => createSlug(item) === citySlug
  );

  if (!city) {
    notFound();
  }

  const cityDormitories = allDormitories
    .filter(
      (dormitory) =>
        dormitory.city === city
    )
    .sort((left, right) => {
      const rightCapacity =
        getCapacity(right) ?? 0;

      const leftCapacity =
        getCapacity(left) ?? 0;

      if (
        rightCapacity !== leftCapacity
      ) {
        return rightCapacity - leftCapacity;
      }

      return left.name.localeCompare(
        right.name,
        "tr-TR"
      );
    });

  const femaleDormitoryCount =
    cityDormitories.filter(
      (dormitory) =>
        dormitory.gender === "Kız"
    ).length;

  const maleDormitoryCount =
    cityDormitories.filter(
      (dormitory) =>
        dormitory.gender === "Erkek"
    ).length;

  const mixedDormitoryCount =
    cityDormitories.filter(
      (dormitory) =>
        dormitory.gender === "Karma"
    ).length;

  const dormitoriesWithCapacity =
    cityDormitories.filter(
      (dormitory) =>
        getCapacity(dormitory) !== null
    );

  const totalVerifiedCapacity =
    dormitoriesWithCapacity.reduce(
      (total, dormitory) =>
        total +
        (getCapacity(dormitory) ?? 0),
      0
    );

  const districts = Array.from(
    new Set(
      cityDormitories
        .map(
          (dormitory) =>
            dormitory.district
        )
        .filter(
          (district): district is string =>
            Boolean(
              district &&
                district !==
                  "İlçe bilgisi bulunamadı"
            )
        )
    )
  ).sort((left, right) =>
    left.localeCompare(right, "tr-TR")
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${city} KYK Yurtları`,
    description:
      `${city} ilindeki KYK öğrenci yurtlarının adres, iletişim ve kapasite bilgileri.`,
    url: `${SITE_URL}/kyk-yurtlari/${citySlug}`,
    inLanguage: "tr-TR",
    numberOfItems:
      cityDormitories.length,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems:
        cityDormitories.length,
      itemListElement:
        cityDormitories.map(
          (dormitory, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: dormitory.name,
            url: `${SITE_URL}/yurtlar/${dormitory.id}`,
          })
        ),
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
        name: "KYK Yurtları",
        item: `${SITE_URL}/kyk-yurtlari`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${city} KYK Yurtları`,
        item: `${SITE_URL}/kyk-yurtlari/${citySlug}`,
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

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/yurtlar"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Tüm yurtlar
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 font-black text-indigo-600"
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
            className="hover:text-indigo-600"
          >
            Ana sayfa
          </Link>

          <span>/</span>

          <Link
            href="/kyk-yurtlari"
            className="hover:text-indigo-600"
          >
            KYK Yurtları
          </Link>

          <span>/</span>

          <span className="text-slate-900">
            {city}
          </span>
        </nav>

        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-xl sm:p-9">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Building2 size={28} />
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
            {city} KYK yurtları
          </h1>

          <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-indigo-100 sm:text-base">
            {city} ilindeki devlet öğrenci
            yurtlarını adres, cinsiyet ve
            doğrulanmış kapasite bilgilerine
            göre incele. Yurt detaylarından
            telefon, yakın üniversite ve harita
            bilgilerine ulaş.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <HeroBadge>
              {cityDormitories.length} yurt
            </HeroBadge>

            <HeroBadge>
              {districts.length} ilçe
            </HeroBadge>

            {totalVerifiedCapacity > 0 && (
              <HeroBadge>
                {totalVerifiedCapacity.toLocaleString(
                  "tr-TR"
                )}{" "}
                doğrulanmış kapasite
              </HeroBadge>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Building2 size={21} />}
            label="Toplam yurt"
            value={cityDormitories.length}
          />

          <StatCard
            icon={<ShieldCheck size={21} />}
            label="Kız yurtları"
            value={femaleDormitoryCount}
          />

          <StatCard
            icon={<Users size={21} />}
            label="Erkek yurtları"
            value={maleDormitoryCount}
          />

          <StatCard
            icon={<BedDouble size={21} />}
            label="Karma yurtlar"
            value={mixedDormitoryCount}
          />
        </section>

        <section className="mt-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
          <h2 className="text-2xl font-black">
            {city} öğrenci yurtları hakkında
          </h2>

          <div className="mt-4 space-y-4 text-sm font-semibold leading-7 text-slate-600 sm:text-base">
            <p>
              {city} ilinde veri tabanımızda{" "}
              <strong className="text-slate-900">
                {cityDormitories.length} KYK
                öğrenci yurdu
              </strong>{" "}
              bulunuyor. Bunların{" "}
              {femaleDormitoryCount} tanesi kız,
              {maleDormitoryCount} tanesi erkek
              öğrenciler için kayıtlıdır
              {mixedDormitoryCount > 0
                ? `; ${mixedDormitoryCount} yurt ise karma olarak listelenmektedir`
                : ""}
              .
            </p>

            {dormitoriesWithCapacity.length >
              0 && (
              <p>
                {dormitoriesWithCapacity.length}{" "}
                yurt için doğrulanabilir kapasite
                verisi bulunuyor. Bu kayıtların
                toplam kapasitesi{" "}
                <strong className="text-slate-900">
                  {totalVerifiedCapacity.toLocaleString(
                    "tr-TR"
                  )}{" "}
                  öğrenci
                </strong>
                . Kapasite yılları farklı
                olabileceğinden her yurdun detay
                sayfasındaki kaynak ve kayıt yılı
                ayrıca kontrol edilmelidir.
              </p>
            )}

            <p>
              Yurt seçerken yalnızca kapasiteye
              değil; yurdun ilçesine, kampüse
              uzaklığına, ulaşım seçeneklerine ve
              cinsiyet bilgisinin güncelliğine de
              dikkat edilmelidir. Başvuru öncesi
              kesin bilgileri KYGM ve ilgili yurt
              müdürlüğünden doğrulaman önerilir.
            </p>
          </div>
        </section>

        {districts.length > 0 && (
          <section className="mt-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
            <h2 className="text-xl font-black">
              Yurt bulunan ilçeler
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {districts.map(
                (district) => (
                  <span
                    key={district}
                    className="rounded-full bg-indigo-50 px-3 py-2 text-sm font-black text-indigo-700"
                  >
                    {formatPlaceName(
                      district
                    )}
                  </span>
                )
              )}
            </div>
          </section>
        )}

        <section className="mt-8">
          <div>
            <p className="font-black text-indigo-600">
              Resmî yurt kayıtları
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              {city} KYK yurt listesi
            </h2>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Yurtlar doğrulanmış kapasitesi
              yüksek olandan düşük olana doğru
              sıralanmıştır.
            </p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {cityDormitories.map(
              (dormitory) => {
                const capacity =
                  getCapacity(dormitory);

                const capacityYear =
                  getCapacityYear(
                    dormitory
                  );

                return (
                  <article
                    key={dormitory.id}
                    className="flex flex-col rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-indigo-200 sm:p-6"
                  >
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-700">
                        {dormitory.type}
                      </span>

                      <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">
                        {dormitory.gender}
                      </span>

                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                        Resmî KYGM
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-black leading-7">
                      <Link
                        href={`/yurtlar/${dormitory.id}`}
                        className="transition hover:text-indigo-600"
                      >
                        {dormitory.name}
                      </Link>
                    </h3>

                    <p className="mt-3 flex items-start gap-2 text-sm font-semibold leading-6 text-slate-500">
                      <MapPin
                        size={17}
                        className="mt-0.5 shrink-0 text-indigo-500"
                      />

                      <span>
                        {dormitory.district &&
                        dormitory.district !==
                          "İlçe bilgisi bulunamadı"
                          ? formatPlaceName(
                              dormitory.district
                            )
                          : city}
                      </span>
                    </p>

                    {dormitory.address && (
                      <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                        {dormitory.address}
                      </p>
                    )}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-black text-slate-500">
                          {capacityYear
                            ? `Kapasite (${capacityYear})`
                            : "Kapasite"}
                        </p>

                        <p className="mt-1 font-black">
                          {capacity !== null
                            ? `${capacity.toLocaleString(
                                "tr-TR"
                              )} öğrenci`
                            : "Henüz doğrulanmadı"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-black text-slate-500">
                          Telefon
                        </p>

                        <p className="mt-1 font-black">
                          {dormitory.phone ||
                            "Bilgi bulunamadı"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-5">
                      <Link
                        href={`/yurtlar/${dormitory.id}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black !text-white transition hover:bg-indigo-700"
                      >
                        Yurt bilgilerini incele
                        <ExternalLink
                          size={16}
                        />
                      </Link>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 p-5 sm:p-7">
          <h2 className="font-black text-amber-900">
            Bilgilendirme
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-amber-800">
            Yurt kapasitesi, iletişim ve
            yerleşke bilgileri zaman içinde
            değişebilir. Başvuru veya kayıt
            işlemi yapmadan önce güncel bilgiyi
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

function getCapacityYear(
  dormitory: (typeof allDormitories)[number]
): number | null {
  const generatedCapacity =
    generatedDormitoryCapacityMap.get(
      dormitory.id
    );

  return (
    generatedCapacity?.capacityYear ??
    dormitory.historicalCapacityYear ??
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
      <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
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

function createSlug(value: string) {
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

function formatPlaceName(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part[0].toLocaleUpperCase(
          "tr-TR"
        ) + part.slice(1)
    )
    .join(" ");
}
