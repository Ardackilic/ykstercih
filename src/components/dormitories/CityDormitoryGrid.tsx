"use client";

import Link from "next/link";
import {
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

export type CityDormitorySummary = {
  city: string;
  slug: string;
  totalDormitories: number;
  femaleDormitories: number;
  maleDormitories: number;
  mixedDormitories: number;
  dormitoriesWithCapacity: number;
  totalCapacity: number;
};

type CityDormitoryGridProps = {
  cities: CityDormitorySummary[];
};

export default function CityDormitoryGrid({
  cities,
}: CityDormitoryGridProps) {
  const [query, setQuery] = useState("");

  const filteredCities = useMemo(() => {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return cities;
    }

    return cities.filter((city) =>
      normalize(
        `${city.city} ${city.city} kyk yurtları öğrenci yurtları`
      ).includes(normalizedQuery)
    );
  }, [cities, query]);

  return (
    <>
      <div className="mt-5 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <label
          htmlFor="city-dormitory-search"
          className="text-sm font-black text-slate-700"
        >
          Şehir ara
        </label>

        <div className="relative mt-3">
          <Search
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="city-dormitory-search"
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Örneğin Tokat, Mersin veya İstanbul"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm font-bold outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Aramayı temizle"
              className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={17} />
            </button>
          )}
        </div>

        <p
          className="mt-3 text-sm font-bold text-slate-500"
          aria-live="polite"
        >
          {filteredCities.length} şehir gösteriliyor
        </p>
      </div>

      {filteredCities.length === 0 ? (
        <div className="mt-5 rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Search size={25} />
          </div>

          <h3 className="mt-4 text-xl font-black">
            Şehir bulunamadı
          </h3>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            Şehir adını farklı bir şekilde yazarak tekrar dene.
          </p>

          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
          >
            Aramayı temizle
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCities.map((city) => (
            <article
              key={city.slug}
              className="flex flex-col rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-indigo-200 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <MapPin size={21} />
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                  {city.totalDormitories} yurt
                </span>
              </div>

              <h3 className="mt-4 text-xl font-black">
                <Link
                  href={`/kyk-yurtlari/${city.slug}`}
                  className="transition hover:text-indigo-600"
                >
                  {city.city} KYK yurtları
                </Link>
              </h3>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniStat
                  label="Kız"
                  value={city.femaleDormitories}
                />

                <MiniStat
                  label="Erkek"
                  value={city.maleDormitories}
                />

                <MiniStat
                  label="Karma"
                  value={city.mixedDormitories}
                />
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black text-slate-500">
                  Doğrulanmış kapasite
                </p>

                <p className="mt-1 font-black">
                  {city.totalCapacity > 0
                    ? `${city.totalCapacity.toLocaleString(
                        "tr-TR"
                      )} öğrenci`
                    : "Henüz bulunamadı"}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  {city.dormitoriesWithCapacity} yurtta kapasite kaydı
                </p>
              </div>

              <div className="mt-auto pt-5">
                <Link
                  href={`/kyk-yurtlari/${city.slug}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black !text-white transition hover:bg-indigo-700"
                >
                  {city.city} yurtlarını incele
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-xs font-black text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-black">
        {value}
      </p>
    </div>
  );
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, " ")
    .trim();
}
