"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Dormitory } from "@/data/dormitories";
import { allDormitories as dormitories } from "@/data/all-dormitories";
import {
  kykLocations,
  kykLocationMetadata,
  type KykLocation,
} from "@/data/kyk-locations";
import { dormitoryMatchMap } from "@/data/dormitory-matches";
import { dormitoryDetailMap } from "@/data/dormitory-details";
import { generatedDormitoryCapacityMap } from "@/data/generated-dormitory-capacities";
import { generatedDormitoryRoomTypeMap } from "@/data/generated-dormitory-room-types";
import FavoriteDormitoryButton from "@/components/dormitories/FavoriteDormitoryButton";

type ActiveTab = "regions" | "dormitories";

type CapacityFilter =
  | ""
  | "available"
  | "missing"
  | "500"
  | "1000"
  | "2000";

type CapacityYearFilter =
  | ""
  | "current"
  | "recent"
  | "old"
  | "unknown";

type DormitorySort =
  | "default"
  | "capacity-desc"
  | "capacity-asc"
  | "name-asc";

const DORMITORIES_PER_PAGE = 20;

const cities = Array.from(
  new Set([
    ...kykLocations.map((location) => location.city),
    ...dormitories.map((dormitory) => dormitory.city),
  ])
).sort((a, b) => a.localeCompare(b, "tr"));

function getDormitoryCapacity(
  dormitory: Dormitory
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

function getDormitoryCapacityYear(
  dormitory: Dormitory
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

export default function DormitoriesPage() {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>("regions");

  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [dormitoryType, setDormitoryType] = useState("");
  const [capacityFilter, setCapacityFilter] =
    useState<CapacityFilter>("");
  const [capacityYearFilter, setCapacityYearFilter] =
    useState<CapacityYearFilter>("");
  const [dormitorySort, setDormitorySort] =
    useState<DormitorySort>("default");
  const [currentPage, setCurrentPage] =
    useState(1);

  const [urlInitialized, setUrlInitialized] =
    useState(false);

  const skipNextPageResetRef =
    useRef(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredRegions = useMemo(() => {
    const normalizedQuery = normalize(query);

    return kykLocations.filter((location) => {
      if (city && location.city !== city) return false;

      if (
        gender &&
        !genderMatches(location.gender, gender)
      ) {
        return false;
      }

      if (normalizedQuery) {
        const searchable = normalize(
          `${location.city} ${location.district} ${location.gender}`
        );

        if (!searchable.includes(normalizedQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [query, city, gender]);

  const filteredDormitories = useMemo(() => {
    const normalizedQuery = normalize(query);

    const filtered = dormitories.filter(
      (dormitory) => {
        if (city && dormitory.city !== city) {
          return false;
        }

        if (
          dormitoryType &&
          dormitory.type !== dormitoryType
        ) {
          return false;
        }

        if (
          gender &&
          dormitory.gender !== gender &&
          dormitory.gender !== "Karma"
        ) {
          return false;
        }

        const capacity =
          getDormitoryCapacity(dormitory);

        if (
          capacityFilter === "available" &&
          capacity === null
        ) {
          return false;
        }

        if (
          capacityFilter === "missing" &&
          capacity !== null
        ) {
          return false;
        }

        if (
          capacityFilter === "500" &&
          (capacity === null || capacity < 500)
        ) {
          return false;
        }

        if (
          capacityFilter === "1000" &&
          (capacity === null || capacity < 1000)
        ) {
          return false;
        }

        if (
          capacityFilter === "2000" &&
          (capacity === null || capacity < 2000)
        ) {
          return false;
        }

        const capacityYear =
          getDormitoryCapacityYear(dormitory);

        if (
          capacityYearFilter === "current" &&
          (capacityYear === null ||
            capacityYear < 2025)
        ) {
          return false;
        }

        if (
          capacityYearFilter === "recent" &&
          (capacityYear === null ||
            capacityYear < 2020 ||
            capacityYear > 2024)
        ) {
          return false;
        }

        if (
          capacityYearFilter === "old" &&
          (capacityYear === null ||
            capacityYear > 2019)
        ) {
          return false;
        }

        if (
          capacityYearFilter === "unknown" &&
          capacityYear !== null
        ) {
          return false;
        }

        if (normalizedQuery) {
          const searchable = normalize(
            [
              dormitory.name,
              dormitory.city,
              dormitory.district,
              dormitory.gender,
              dormitory.type,
              ...dormitory.universityNames,
            ].join(" ")
          );

          if (
            !searchable.includes(normalizedQuery)
          ) {
            return false;
          }
        }

        return true;
      }
    );

    return [...filtered].sort((left, right) => {
      if (dormitorySort === "name-asc") {
        return left.name.localeCompare(
          right.name,
          "tr"
        );
      }

      if (
        dormitorySort === "capacity-desc" ||
        dormitorySort === "capacity-asc"
      ) {
        const leftCapacity =
          getDormitoryCapacity(left);

        const rightCapacity =
          getDormitoryCapacity(right);

        if (
          leftCapacity === null &&
          rightCapacity === null
        ) {
          return left.name.localeCompare(
            right.name,
            "tr"
          );
        }

        if (leftCapacity === null) return 1;
        if (rightCapacity === null) return -1;

        return dormitorySort === "capacity-desc"
          ? rightCapacity - leftCapacity
          : leftCapacity - rightCapacity;
      }

      return 0;
    });
  }, [
    query,
    city,
    gender,
    dormitoryType,
    capacityFilter,
    capacityYearFilter,
    dormitorySort,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredDormitories.length /
        DORMITORIES_PER_PAGE
    )
  );

  const paginatedDormitories = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      DORMITORIES_PER_PAGE;

    return filteredDormitories.slice(
      startIndex,
      startIndex + DORMITORIES_PER_PAGE
    );
  }, [filteredDormitories, currentPage]);

  useEffect(() => {
    if (!urlInitialized) {
      return;
    }

    if (skipNextPageResetRef.current) {
      skipNextPageResetRef.current = false;
      return;
    }

    setCurrentPage(1);
  }, [
    query,
    city,
    gender,
    dormitoryType,
    capacityFilter,
    capacityYearFilter,
    dormitorySort,
    activeTab,
    urlInitialized,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const parameters = new URLSearchParams(
      window.location.search
    );

    const urlTab = parameters.get("tab");
    const urlQuery = parameters.get("query");
    const urlCity = parameters.get("city");
    const urlGender = parameters.get("gender");
    const urlType = parameters.get("type");
    const urlCapacity = parameters.get("capacity");
    const urlCapacityYear =
      parameters.get("capacityYear");
    const urlSort = parameters.get("sort");
    const urlPage = Number(
      parameters.get("page")
    );

    skipNextPageResetRef.current = true;

    if (
      urlTab === "regions" ||
      urlTab === "dormitories"
    ) {
      setActiveTab(urlTab);
    }

    if (urlQuery) {
      setQuery(urlQuery);
    }

    if (urlCity) {
      setCity(urlCity);
    }

    if (
      urlGender === "Kız" ||
      urlGender === "Erkek" ||
      urlGender === "Karma"
    ) {
      setGender(urlGender);
    }

    if (
      urlType === "KYK" ||
      urlType === "Özel" ||
      urlType === "Üniversite"
    ) {
      setDormitoryType(urlType);
    }

    if (
      urlCapacity === "available" ||
      urlCapacity === "missing" ||
      urlCapacity === "500" ||
      urlCapacity === "1000" ||
      urlCapacity === "2000"
    ) {
      setCapacityFilter(urlCapacity);
    }

    if (
      urlCapacityYear === "current" ||
      urlCapacityYear === "recent" ||
      urlCapacityYear === "old" ||
      urlCapacityYear === "unknown"
    ) {
      setCapacityYearFilter(
        urlCapacityYear
      );
    }

    if (
      urlSort === "default" ||
      urlSort === "capacity-desc" ||
      urlSort === "capacity-asc" ||
      urlSort === "name-asc"
    ) {
      setDormitorySort(urlSort);
    }

    if (
      Number.isInteger(urlPage) &&
      urlPage > 0
    ) {
      setCurrentPage(urlPage);
    }

    setUrlInitialized(true);
  }, []);

  useEffect(() => {
    if (!urlInitialized) {
      return;
    }

    const parameters = new URLSearchParams();

    if (activeTab !== "regions") {
      parameters.set("tab", activeTab);
    }

    if (query.trim()) {
      parameters.set("query", query.trim());
    }

    if (city) {
      parameters.set("city", city);
    }

    if (gender) {
      parameters.set("gender", gender);
    }

    if (
      activeTab === "dormitories" &&
      dormitoryType
    ) {
      parameters.set("type", dormitoryType);
    }

    if (
      activeTab === "dormitories" &&
      capacityFilter
    ) {
      parameters.set(
        "capacity",
        capacityFilter
      );
    }

    if (
      activeTab === "dormitories" &&
      capacityYearFilter
    ) {
      parameters.set(
        "capacityYear",
        capacityYearFilter
      );
    }

    if (
      activeTab === "dormitories" &&
      dormitorySort !== "default"
    ) {
      parameters.set("sort", dormitorySort);
    }

    if (
      activeTab === "dormitories" &&
      currentPage > 1
    ) {
      parameters.set(
        "page",
        String(currentPage)
      );
    }

    const queryString =
      parameters.toString();

    const nextUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(
      null,
      "",
      nextUrl
    );
  }, [
    activeTab,
    query,
    city,
    gender,
    dormitoryType,
    capacityFilter,
    capacityYearFilter,
    dormitorySort,
    currentPage,
    urlInitialized,
  ]);

  const activeFilterCount = [
    city,
    gender,
    activeTab === "dormitories"
      ? dormitoryType
      : "",
    activeTab === "dormitories"
      ? capacityFilter
      : "",
    activeTab === "dormitories"
      ? capacityYearFilter
      : "",
    activeTab === "dormitories" &&
    dormitorySort !== "default"
      ? dormitorySort
      : "",
  ].filter(Boolean).length;

  function clearFilters() {
    setQuery("");
    setCity("");
    setGender("");
    setDormitoryType("");
    setCapacityFilter("");
    setCapacityYearFilter("");
    setDormitorySort("default");
    setCurrentPage(1);
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 !text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="font-black">YKS Tercih</p>
              <p className="text-xs text-slate-500">
                Yurt ve konaklama rehberi
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/yurtlar/favoriler"
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-600 transition hover:bg-rose-100"
            >
              Favoriler
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
            >
              <ArrowLeft size={17} />

              <span className="hidden sm:inline">
                Ana sayfa
              </span>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pt-7 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-red-600 via-red-600 to-red-700 p-6 text-white shadow-xl sm:p-9">
          <div className="absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <BedDouble size={28} />
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              Üniversitene yakın konaklama seçeneklerini bul
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-red-100 sm:text-base">
              Önce şehir veya ilçe ara. Ardından KYK bulunan
              bölgeleri ve doğrulanan yurtları kolayca incele.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <HeroStat
                label="KYK bulunan bölge"
                value={kykLocationMetadata.locationCount}
              />

              <HeroStat
                label="Şehir"
                value={kykLocationMetadata.cityCount}
              />

              <HeroStat
                label="Detaylı yurt kaydı"
                value={dormitories.length}
              />

              <HeroStat
                label="Üniversite konumu"
                value="188+"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-5">
          <div className="relative">
            <Search
              size={21}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Şehir, ilçe, üniversite veya yurt adı ara..."
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-base font-semibold outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Aramayı temizle"
                className="absolute right-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("regions")}
              className={`rounded-xl px-3 py-3 text-sm font-black transition ${
                activeTab === "regions"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              KYK bulunan bölgeler
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("dormitories")}
              className={`rounded-xl px-3 py-3 text-sm font-black transition ${
                activeTab === "dormitories"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Detaylı yurt kayıtları
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setFiltersOpen((current) => !current)
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600"
            >
              <SlidersHorizontal size={17} />
              Filtreler

              {activeFilterCount > 0 && (
                <span className="flex size-6 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                  {activeFilterCount}
                </span>
              )}

              <ChevronDown
                size={16}
                className={`transition ${
                  filtersOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {(query || activeFilterCount > 0) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-black text-rose-600"
              >
                Aramayı ve filtreleri temizle
              </button>
            )}
          </div>

          {filtersOpen && (
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-6">
              <FilterSelect
                label="Şehir"
                value={city}
                onChange={setCity}
              >
                <option value="">Tüm şehirler</option>

                {cities.map((cityName) => (
                  <option
                    key={cityName}
                    value={cityName}
                  >
                    {cityName}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                label="Kız / erkek"
                value={gender}
                onChange={setGender}
              >
                <option value="">Tümü</option>
                <option value="Kız">Kız</option>
                <option value="Erkek">Erkek</option>

                {activeTab === "dormitories" && (
                  <option value="Karma">Karma</option>
                )}
              </FilterSelect>

              {activeTab === "dormitories" && (
                <>
                  <FilterSelect
                    label="Yurt türü"
                    value={dormitoryType}
                    onChange={setDormitoryType}
                  >
                    <option value="">
                      Tüm türler
                    </option>
                    <option value="KYK">KYK</option>
                    <option value="Özel">
                      Özel
                    </option>
                    <option value="Üniversite">
                      Üniversite
                    </option>
                  </FilterSelect>

                  <FilterSelect
                    label="Kapasite"
                    value={capacityFilter}
                    onChange={(value) =>
                      setCapacityFilter(
                        value as CapacityFilter
                      )
                    }
                  >
                    <option value="">
                      Tüm kapasite kayıtları
                    </option>
                    <option value="available">
                      Kapasitesi bulunanlar
                    </option>
                    <option value="missing">
                      Kapasitesi bulunmayanlar
                    </option>
                    <option value="500">
                      En az 500 öğrenci
                    </option>
                    <option value="1000">
                      En az 1.000 öğrenci
                    </option>
                    <option value="2000">
                      En az 2.000 öğrenci
                    </option>
                  </FilterSelect>

                  <FilterSelect
                    label="Kayıt yılı"
                    value={capacityYearFilter}
                    onChange={(value) =>
                      setCapacityYearFilter(
                        value as CapacityYearFilter
                      )
                    }
                  >
                    <option value="">
                      Tüm kayıt yılları
                    </option>
                    <option value="current">
                      2025 ve sonrası
                    </option>
                    <option value="recent">
                      2020–2024
                    </option>
                    <option value="old">
                      2019 ve öncesi
                    </option>
                    <option value="unknown">
                      Yılı bilinmeyen
                    </option>
                  </FilterSelect>

                  <FilterSelect
                    label="Sıralama"
                    value={dormitorySort}
                    onChange={(value) =>
                      setDormitorySort(
                        value as DormitorySort
                      )
                    }
                  >
                    <option value="default">
                      Varsayılan sıralama
                    </option>
                    <option value="capacity-desc">
                      Kapasite: yüksekten düşüğe
                    </option>
                    <option value="capacity-asc">
                      Kapasite: düşükten yükseğe
                    </option>
                    <option value="name-asc">
                      Yurt adına göre
                    </option>
                  </FilterSelect>
                </>
              )}
            </div>
          )}
        </div>

        {activeTab === "regions" ? (
          <OfficialRegions
            locations={filteredRegions}
            query={query}
          />
        ) : (
          <DormitoryResults
            dormitories={paginatedDormitories}
            allDormitories={filteredDormitories}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </section>
    </main>
  );
}

function OfficialRegions({
  locations,
  query,
}: {
  locations: KykLocation[];
  query: string;
}) {
  return (
    <section className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-black text-emerald-600">
            <CheckCircle2 size={18} />
            Resmî KYGM verisi
          </div>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            {locations.length} bölge bulundu
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Bu sonuçlar ilçede KYK yurdu bulunduğunu gösterir.
            Ayrıntılı yurt adı, adres, telefon ve cinsiyet bilgileri
            diğer sekmede yer alır.
          </p>
        </div>
      </div>

      {locations.length === 0 ? (
        <EmptyResult
          text={
            query
              ? `"${query}" için KYK bölgesi bulunamadı.`
              : "Filtrelere uygun KYK bölgesi bulunamadı."
          }
        />
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <article
              key={location.id}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-red-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <MapPin size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    {location.city}
                  </p>

                  <h3 className="mt-1 text-lg font-black">
                    {location.district}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                      {location.gender}
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      Resmî kayıt
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function DormitoryResults({
  dormitories,
  allDormitories,
  currentPage,
  totalPages,
  onPageChange,
}: {
  dormitories: Dormitory[];
  allDormitories: Dormitory[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const capacityValues = allDormitories
    .map((dormitory) =>
      getDormitoryCapacity(dormitory)
    )
    .filter(
      (capacity): capacity is number =>
        capacity !== null
    );

  const capacityAvailableCount =
    capacityValues.length;

  const capacityMissingCount =
    allDormitories.length -
    capacityAvailableCount;

  const averageCapacity =
    capacityValues.length > 0
      ? Math.round(
          capacityValues.reduce(
            (total, capacity) =>
              total + capacity,
            0
          ) / capacityValues.length
        )
      : null;

  return (
    <section className="mt-6">
      <div>
        <p className="font-black text-red-600">
          Ayrıntılı yurt kayıtları
        </p>

        <h2 className="mt-2 text-2xl font-black sm:text-3xl">
          {allDormitories.length} kayıt bulundu
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Resmî KYGM kaynağından alınan yurt adı, adresi,
          telefon ve cinsiyet bilgileri gösterilir. Eksik alanlar
          doğrulandıkça sisteme eklenecektir.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ResultStat
          label="Toplam sonuç"
          value={allDormitories.length}
        />

        <ResultStat
          label="Kapasitesi bulunan"
          value={capacityAvailableCount}
        />

        <ResultStat
          label="Kapasitesi bulunmayan"
          value={capacityMissingCount}
        />

        <ResultStat
          label="Ortalama kapasite"
          value={
            averageCapacity !== null
              ? `${averageCapacity.toLocaleString(
                  "tr-TR"
                )} öğrenci`
              : "Veri yok"
          }
        />
      </div>

      {allDormitories.length === 0 ? (
        <EmptyResult text="Aramana uygun detaylı yurt kaydı bulunamadı." />
      ) : (
        <>
          <div className="mt-5 grid gap-4">
          {dormitories.map((dormitory) => {
            const match =
              dormitoryMatchMap.get(dormitory.id);

            const nearestUniversity =
              match?.nearestUniversities[0] ?? null;

            const detail =
              dormitoryDetailMap.get(dormitory.id);

            const generatedCapacity =
              generatedDormitoryCapacityMap.get(
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

            const displayedCapacitySourceUrl =
              generatedCapacity?.capacitySourceUrl ??
              dormitory.historicalCapacitySourceUrl ??
              null;

            const displayedCapacitySourceName =
              generatedCapacity?.capacitySourceName ??
              dormitory.historicalCapacitySourceName ??
              null;

            const generatedRoomType =
              generatedDormitoryRoomTypeMap.get(
                dormitory.id
              );

            const displayedRoomTypes =
              generatedRoomType?.roomTypes?.length
                ? generatedRoomType.roomTypes
                : detail?.roomTypes?.length
                  ? detail.roomTypes
                  : dormitory.roomTypes;

            return (
              <article
                key={dormitory.id}
                className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <SimpleBadge>
                        {dormitory.type}
                      </SimpleBadge>

                      <SimpleBadge>
                        {dormitory.gender}
                      </SimpleBadge>

                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                        Resmî KYGM
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-black">
                      <Link
                        href={`/yurtlar/${dormitory.id}`}
                        className="transition hover:text-red-600"
                      >
                        {dormitory.name}
                      </Link>
                    </h3>

                    <p className="mt-2 flex items-start gap-2 text-sm font-semibold leading-6 text-slate-500">
                      <MapPin
                        size={16}
                        className="mt-1 shrink-0 text-red-600"
                      />

                      <span>
                        {dormitory.city}

                        {dormitory.district &&
                        dormitory.district !==
                          "İlçe bilgisi bulunamadı" &&
                        normalize(dormitory.district) !==
                          normalize(dormitory.city)
                          ? `, ${formatPlaceName(
                              dormitory.district
                            )}`
                          : ""}
                      </span>
                    </p>

                    {dormitory.address && (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {dormitory.address}
                      </p>
                    )}

                    {dormitory.phone && (
                      <p className="mt-2 text-sm font-black text-red-600">
                        Telefon: {dormitory.phone}
                      </p>
                    )}
                  </div>

                  {nearestUniversity?.distanceKm !== null &&
                    nearestUniversity?.distanceKm !== undefined && (
                      <div className="rounded-2xl bg-red-50 px-5 py-3 text-center">
                        <p className="text-xs font-black text-red-500">
                          Kampüse uzaklık
                        </p>

                        <p className="mt-1 text-xl font-black text-red-700">
                          {nearestUniversity.distanceKm.toLocaleString(
                            "tr-TR",
                            {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            }
                          )} km
                        </p>
                      </div>
                    )}
                </div>

                <div className={`mt-5 grid gap-3 ${
                  displayedRoomTypes.length > 0
                    ? "md:grid-cols-3"
                    : "md:grid-cols-2"
                }`}>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold text-slate-500">
                      {displayedCapacity !== null
                        ? displayedCapacityYear
                          ? `Resmî kapasite kaydı (${displayedCapacityYear})`
                          : "Kapasite"
                        : "Kapasite"}
                    </p>

                    <p className="mt-1 text-sm font-black leading-5">
                      {displayedCapacity !== null
                        ? `${displayedCapacity.toLocaleString(
                            "tr-TR"
                          )} öğrenci`
                        : "Henüz bulunamadı"}
                    </p>

                    {displayedCapacityYear && (
                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${
                          displayedCapacityYear >= 2025
                            ? "bg-emerald-100 text-emerald-700"
                            : displayedCapacityYear >= 2020
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {displayedCapacityYear >= 2025
                          ? `${displayedCapacityYear} resmî kayıt`
                          : displayedCapacityYear >= 2020
                            ? `${displayedCapacityYear} tarihli kayıt`
                            : `${displayedCapacityYear} eski resmî kayıt`}
                      </span>
                    )}

                    {displayedCapacitySourceUrl && (
                      <a
                        href={displayedCapacitySourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-xs font-black text-red-600 hover:text-red-800"
                        title={
                          displayedCapacitySourceName ??
                          "Resmî kapasite kaynağı"
                        }
                      >
                        Resmî kaynağı gör
                      </a>
                    )}
                  </div>

                  {displayedRoomTypes.length > 0 && (
                    <SmallInfo
                      label="Oda tipi"
                      value={displayedRoomTypes.join(", ")}
                    />
                  )}

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold text-slate-500">
                      Üniversite eşleşmesi
                    </p>

                    <p className="mt-1 text-sm font-black leading-5">
                      {nearestUniversity?.distanceKm !== null &&
                      nearestUniversity?.distanceKm !== undefined
                        ? nearestUniversity.universityName
                        : nearestUniversity
                          ? `${dormitory.city} içindeki üniversiteler`
                          : "Henüz eşleştirilmedi"}
                    </p>

                    {nearestUniversity && (
                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${
                          nearestUniversity.distanceKm !== null
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {nearestUniversity.distanceKm !== null
                          ? "Koordinatla hesaplandı"
                          : "Kesin yakınlık hesaplanmadı"}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:flex-row">
            <p className="text-sm font-bold text-slate-500">
              Sayfa{" "}
              <span className="text-slate-950">
                {currentPage}
              </span>{" "}
              / {totalPages}
              <span className="ml-2 text-slate-400">
                ({allDormitories.length} kayıt)
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => {
                  onPageChange(currentPage - 1);
                  window.scrollTo({
                    top: 500,
                    behavior: "smooth",
                  });
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Önceki
              </button>

              <div className="hidden items-center gap-1 sm:flex">
                {getVisiblePageNumbers(
                  currentPage,
                  totalPages
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => {
                      onPageChange(page);
                      window.scrollTo({
                        top: 500,
                        behavior: "smooth",
                      });
                    }}
                    className={`flex size-10 items-center justify-center rounded-xl text-sm font-black transition ${
                      page === currentPage
                        ? "bg-red-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => {
                  onPageChange(currentPage + 1);
                  window.scrollTo({
                    top: 500,
                    behavior: "smooth",
                  });
                }}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
        </>
      )}
    </section>
  );
}

function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number
): number[] {
  const maximumVisiblePages = 5;

  let startPage = Math.max(
    1,
    currentPage - 2
  );

  let endPage = Math.min(
    totalPages,
    startPage + maximumVisiblePages - 1
  );

  startPage = Math.max(
    1,
    endPage - maximumVisiblePages + 1
  );

  return Array.from(
    {
      length: endPage - startPage + 1,
    },
    (_, index) => startPage + index
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 outline-none focus:border-red-500"
      >
        {children}
      </select>
    </label>
  );
}

function ResultStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
      <p className="text-xs font-black text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <p className="text-xs font-bold text-red-100">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black">
        {value}
      </p>
    </div>
  );
}

function SmallInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black leading-5">
        {value}
      </p>
    </div>
  );
}

function SimpleBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
      {children}
    </span>
  );
}

function EmptyResult({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-[26px] bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200">
      <Search
        size={34}
        className="mx-auto text-slate-300"
      />

      <h3 className="mt-4 text-xl font-black">
        Sonuç bulunamadı
      </h3>

      <p className="mt-2 text-slate-500">{text}</p>
    </div>
  );
}

function genderMatches(
  recordGender: string,
  selectedGender: string
) {
  if (!selectedGender) return true;

  if (recordGender === "Kız ve Erkek") {
    return (
      selectedGender === "Kız" ||
      selectedGender === "Erkek"
    );
  }

  return recordGender === selectedGender;
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

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim();
}
