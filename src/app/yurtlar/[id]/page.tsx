import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";

import { allDormitories } from "@/data/all-dormitories";
import { dormitoryMatchMap } from "@/data/dormitory-matches";
import { dormitoryDetailMap } from "@/data/dormitory-details";
import { generatedDormitoryCapacityMap } from "@/data/generated-dormitory-capacities";
import { generatedDormitoryRoomTypeMap } from "@/data/generated-dormitory-room-types";
import FavoriteDormitoryButton from "@/components/dormitories/FavoriteDormitoryButton";
import ShareDormitoryButton from "@/components/dormitories/ShareDormitoryButton";
import RecentlyViewedDormitories from "@/components/dormitories/RecentlyViewedDormitories";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return allDormitories.map((dormitory) => ({
    id: dormitory.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps) {
  const { id } = await params;

  const dormitory = allDormitories.find(
    (item) => item.id === id
  );

  if (!dormitory) {
    return {
      title: "Yurt bulunamadı",
    };
  }

  const canonicalUrl =
    `https://ykstercih.site/yurtlar/${dormitory.id}`;

  const description =
    `${dormitory.city} ilindeki ${dormitory.name} için adres, telefon, kapasite, yurt türü ve yakın üniversite bilgilerini incele.`;

  return {
    title: `${dormitory.name} | YKS Tercih`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${dormitory.name} | YKS Tercih`,
      description,
      url: canonicalUrl,
      siteName: "YKS Tercih",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${dormitory.name} | YKS Tercih`,
      description,
    },
  };
}

export default async function DormitoryDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const dormitory = allDormitories.find(
    (item) => item.id === id
  );

  if (!dormitory) {
    notFound();
  }

  const match = dormitoryMatchMap.get(
    dormitory.id
  );

  const nearestUniversity =
    match?.nearestUniversities?.[0] ?? null;

  const detail = dormitoryDetailMap.get(
    dormitory.id
  );

  const generatedCapacity =
    generatedDormitoryCapacityMap.get(
      dormitory.id
    );

  const generatedRoomType =
    generatedDormitoryRoomTypeMap.get(
      dormitory.id
    );

  const displayedCapacity =
    dormitory.capacity ??
    generatedCapacity?.capacity ??
    dormitory.historicalCapacity ??
    null;

  const displayedCapacityYear =
    generatedCapacity?.capacityYear ??
    dormitory.historicalCapacityYear ??
    null;

  const displayedCapacitySourceName =
    generatedCapacity?.capacitySourceName ??
    dormitory.historicalCapacitySourceName ??
    null;

  const displayedCapacitySourceUrl =
    generatedCapacity?.capacitySourceUrl ??
    dormitory.historicalCapacitySourceUrl ??
    null;

  const displayedRoomTypes =
    generatedRoomType?.roomTypes?.length
      ? generatedRoomType.roomTypes
      : detail?.roomTypes?.length
        ? detail.roomTypes
        : dormitory.roomTypes;

  const locationText = [
    dormitory.name,
    dormitory.address,
    dormitory.district,
    dormitory.city,
  ]
    .filter(Boolean)
    .join(" ");

  const mapsUrl =
    dormitory.latitude !== null &&
    dormitory.latitude !== undefined &&
    dormitory.longitude !== null &&
    dormitory.longitude !== undefined
      ? `https://www.google.com/maps/search/?api=1&query=${dormitory.latitude},${dormitory.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          locationText
        )}`;

  const citySlug = createCitySlug(
    dormitory.city
  );

  const breadcrumbData = {
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
        name: "KYK Yurtları",
        item: "https://ykstercih.site/yurtlar",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${dormitory.city} KYK Yurtları`,
        item: `https://ykstercih.site/kyk-yurtlari/${citySlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: dormitory.name,
        item: `https://ykstercih.site/yurtlar/${dormitory.id}`,
      },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hostel",
    name: dormitory.name,
    description: `${dormitory.city} ilindeki ${dormitory.name} öğrenci yurdu.`,
    url: `https://ykstercih.site/yurtlar/${dormitory.id}`,
    address: {
      "@type": "PostalAddress",
      streetAddress:
        dormitory.address || undefined,
      addressLocality:
        dormitory.district || dormitory.city,
      addressRegion: dormitory.city,
      addressCountry: "TR",
    },
    telephone:
      dormitory.phone || undefined,
    maximumAttendeeCapacity:
      displayedCapacity ?? undefined,
    geo:
      dormitory.latitude !== null &&
      dormitory.latitude !== undefined &&
      dormitory.longitude !== null &&
      dormitory.longitude !== undefined
        ? {
            "@type": "GeoCoordinates",
            latitude: dormitory.latitude,
            longitude: dormitory.longitude,
          }
        : undefined,
  };

  const otherDormitoriesInCity =
    allDormitories
      .filter(
        (item) =>
          item.id !== dormitory.id &&
          item.city === dormitory.city
      )
      .sort((left, right) => {
        const leftCapacity =
          generatedDormitoryCapacityMap.get(
            left.id
          )?.capacity ??
          left.capacity ??
          left.historicalCapacity ??
          0;

        const rightCapacity =
          generatedDormitoryCapacityMap.get(
            right.id
          )?.capacity ??
          right.capacity ??
          right.historicalCapacity ??
          0;

        return rightCapacity - leftCapacity;
      })
      .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/yurtlar"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Yurtlara dön
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

      <section className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        <nav
          aria-label="Sayfa yolu"
          className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500"
        >
          <Link
            href="/"
            className="transition hover:text-indigo-600"
          >
            Ana sayfa
          </Link>

          <span aria-hidden="true">/</span>

          <Link
            href="/yurtlar"
            className="transition hover:text-indigo-600"
          >
            KYK Yurtları
          </Link>

          <span aria-hidden="true">/</span>

          <Link
            href={`/kyk-yurtlari/${citySlug}`}
            className="transition hover:text-indigo-600"
          >
            {dormitory.city}
          </Link>

          <span aria-hidden="true">/</span>

          <span className="text-slate-900">
            {dormitory.name}
          </span>
        </nav>

        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-xl sm:p-9">
          <div className="flex flex-wrap gap-2">
            <Badge>{dormitory.type}</Badge>
            <Badge>{dormitory.gender}</Badge>

            <span className="rounded-full bg-emerald-400/20 px-3 py-1.5 text-xs font-black text-emerald-50">
              Resmî KYGM kaydı
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
            {dormitory.name}
          </h1>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm font-bold text-indigo-100 sm:text-base">
              <MapPin
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span>
                <Link
                  href={`/kyk-yurtlari/${citySlug}`}
                  className="underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
                >
                  {dormitory.city}
                </Link>

                {dormitory.district
                  ? `, ${formatPlaceName(
                      dormitory.district
                    )}`
                  : ""}
              </span>
            </p>

            <div className="flex flex-wrap gap-3">
              <FavoriteDormitoryButton
                dormitoryId={dormitory.id}
                dormitoryName={dormitory.name}
              />

              <ShareDormitoryButton
                title={dormitory.name}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <section className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
              <h2 className="text-xl font-black">
                Yurt bilgileri
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailCard
                  icon={<Users size={20} />}
                  label={
                    displayedCapacityYear
                      ? `Resmî kapasite (${displayedCapacityYear})`
                      : "Kapasite"
                  }
                  value={
                    displayedCapacity !== null
                      ? `${displayedCapacity.toLocaleString(
                          "tr-TR"
                        )} öğrenci`
                      : "Henüz doğrulanmadı"
                  }
                />

                <DetailCard
                  icon={<BedDouble size={20} />}
                  label="Oda tipi"
                  value={
                    displayedRoomTypes.length > 0
                      ? displayedRoomTypes.join(", ")
                      : "Doğrulanmış oda tipi bulunamadı"
                  }
                />

                <DetailCard
                  icon={<Building2 size={20} />}
                  label="Yurt türü"
                  value={dormitory.type}
                />

                <DetailCard
                  icon={<ShieldCheck size={20} />}
                  label="Cinsiyet"
                  value={dormitory.gender}
                />
              </div>

              {displayedCapacitySourceUrl && (
                <a
                  href={displayedCapacitySourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
                  title={
                    displayedCapacitySourceName ??
                    "Resmî kapasite kaynağı"
                  }
                >
                  <ExternalLink size={17} />
                  Kapasite kaynağını aç
                </a>
              )}
            </section>

            <section className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
              <h2 className="text-xl font-black">
                Adres ve iletişim
              </h2>

              <div className="mt-5 space-y-4">
                <InfoRow
                  icon={<MapPin size={20} />}
                  label="Adres"
                  value={
                    dormitory.address ||
                    "Adres bilgisi bulunamadı"
                  }
                />

                <InfoRow
                  icon={<Phone size={20} />}
                  label="Telefon"
                  value={
                    dormitory.phone ||
                    "Telefon bilgisi bulunamadı"
                  }
                  href={
                    dormitory.phone
                      ? `tel:${dormitory.phone.replace(
                          /\s/g,
                          ""
                        )}`
                      : undefined
                  }
                />
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black !text-white transition hover:bg-slate-800"
              >
                <MapPin size={17} />
                Haritada göster
              </a>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
              <h2 className="text-xl font-black">
                Üniversite eşleşmesi
              </h2>

              {nearestUniversity ? (
                <div className="mt-5">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <GraduationCap size={24} />
                  </div>

                  <p className="mt-4 text-lg font-black leading-7">
                    {nearestUniversity.distanceKm !==
                      null
                      ? nearestUniversity.universityName
                      : `${dormitory.city} içindeki üniversiteler`}
                  </p>

                  {nearestUniversity.distanceKm !==
                  null ? (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-black text-emerald-600">
                        Kuş uçuşu mesafe
                      </p>

                      <p className="mt-1 text-2xl font-black text-emerald-800">
                        {nearestUniversity.distanceKm.toLocaleString(
                          "tr-TR",
                          {
                            maximumFractionDigits: 1,
                          }
                        )}{" "}
                        km
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                      <p className="text-sm font-black text-amber-700">
                        Kesin yakınlık henüz
                        hesaplanmadı.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
                  Bu yurt için üniversite
                  eşleşmesi henüz bulunamadı.
                </p>
              )}
            </section>

            <section className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <CalendarDays size={21} />
                </div>

                <div>
                  <p className="text-xs font-black text-slate-500">
                    Veri durumu
                  </p>

                  <p className="font-black">
                    Kaynaklı bilgiler gösteriliyor
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
                Kapasite ve oda tipi gibi bilgiler
                yalnızca doğrulanmış kaynak
                bulunduğunda gösterilir.
              </p>
            </section>
          </aside>
        </div>
        <RecentlyViewedDormitories
          currentDormitoryId={dormitory.id}
        />

        {otherDormitoriesInCity.length > 0 && (
          <section className="mt-6">
            <div>
              <p className="font-black text-indigo-600">
                Aynı şehirdeki seçenekler
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                {dormitory.city} içindeki diğer yurtlar
              </h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Aynı şehirde bulunan diğer resmî yurt
                kayıtlarını da inceleyebilirsin.
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {otherDormitoriesInCity.map(
                (otherDormitory) => {
                  const generatedCapacity =
                    generatedDormitoryCapacityMap.get(
                      otherDormitory.id
                    );

                  const capacity =
                    otherDormitory.capacity ??
                    generatedCapacity?.capacity ??
                    otherDormitory.historicalCapacity ??
                    null;

                  return (
                    <article
                      key={otherDormitory.id}
                      className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-indigo-200"
                    >
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                          {otherDormitory.type}
                        </span>

                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                          {otherDormitory.gender}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-black leading-7">
                        {otherDormitory.name}
                      </h3>

                      <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-slate-500">
                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0 text-indigo-500"
                        />

                        <span>
                          {otherDormitory.district
                            ? formatPlaceName(
                                otherDormitory.district
                              )
                            : otherDormitory.city}
                        </span>
                      </p>

                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-black text-slate-500">
                          Kapasite
                        </p>

                        <p className="mt-1 font-black">
                          {capacity !== null
                            ? `${capacity.toLocaleString(
                                "tr-TR"
                              )} öğrenci`
                            : "Henüz bulunamadı"}
                        </p>
                      </div>

                      <Link
                        href={`/yurtlar/${otherDormitory.id}`}
                        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black !text-white transition hover:bg-indigo-700"
                      >
                        Yurdu incele
                      </Link>
                    </article>
                  );
                }
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur">
      {children}
    </span>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-indigo-600">
        {icon}
      </div>

      <p className="mt-3 text-xs font-black text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-black leading-6">
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <div>
        <p className="text-xs font-black text-slate-500">
          {label}
        </p>

        <p className="mt-1 font-bold leading-6 text-slate-800">
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3 transition hover:bg-slate-50"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3">
      {content}
    </div>
  );
}

function formatPlaceName(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part[0].toLocaleUpperCase("tr-TR") +
        part.slice(1)
    )
    .join(" ");
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

