"use client";

import Link from "next/link";
import { Clock3, MapPin, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { allDormitories } from "@/data/all-dormitories";
import { generatedDormitoryCapacityMap } from "@/data/generated-dormitory-capacities";

const STORAGE_KEY =
  "yks-tercih-recently-viewed-dormitories";

const MAX_STORED_DORMITORIES = 10;
const MAX_VISIBLE_DORMITORIES = 4;

type RecentlyViewedDormitoriesProps = {
  currentDormitoryId: string;
};

function readRecentlyViewed(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue =
      window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (item): item is string =>
        typeof item === "string"
    );
  } catch {
    return [];
  }
}

export default function RecentlyViewedDormitories({
  currentDormitoryId,
}: RecentlyViewedDormitoriesProps) {
  const [recentIds, setRecentIds] =
    useState<string[]>([]);

  const [isReady, setIsReady] =
    useState(false);

  useEffect(() => {
    const storedIds = readRecentlyViewed();

    const nextIds = [
      currentDormitoryId,
      ...storedIds.filter(
        (id) => id !== currentDormitoryId
      ),
    ].slice(0, MAX_STORED_DORMITORIES);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextIds)
    );

    setRecentIds(nextIds);
    setIsReady(true);
  }, [currentDormitoryId]);

  const recentlyViewedDormitories =
    useMemo(
      () =>
        recentIds
          .filter(
            (id) =>
              id !== currentDormitoryId
          )
          .map((id) =>
            allDormitories.find(
              (dormitory) =>
                dormitory.id === id
            )
          )
          .filter(
            (
              dormitory
            ): dormitory is (typeof allDormitories)[number] =>
              Boolean(dormitory)
          )
          .slice(
            0,
            MAX_VISIBLE_DORMITORIES
          ),
      [recentIds, currentDormitoryId]
    );

  function clearRecentlyViewed() {
    window.localStorage.removeItem(
      STORAGE_KEY
    );

    setRecentIds([currentDormitoryId]);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        currentDormitoryId,
      ])
    );
  }

  if (
    !isReady ||
    recentlyViewedDormitories.length === 0
  ) {
    return null;
  }

  return (
    <section className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-black text-violet-600">
            <Clock3 size={18} />
            Geçmişin
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Son görüntülediğin yurtlar
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Daha önce incelediğin yurtlara
            hızlıca geri dönebilirsin.
          </p>
        </div>

        <button
          type="button"
          onClick={clearRecentlyViewed}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 size={16} />
          Geçmişi temizle
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {recentlyViewedDormitories.map(
          (dormitory) => {
            const generatedCapacity =
              generatedDormitoryCapacityMap.get(
                dormitory.id
              );

            const capacity =
              dormitory.capacity ??
              generatedCapacity?.capacity ??
              dormitory.historicalCapacity ??
              null;

            const capacityYear =
              generatedCapacity?.capacityYear ??
              dormitory.historicalCapacityYear ??
              null;

            return (
              <article
                key={dormitory.id}
                className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-violet-200"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                    {dormitory.gender}
                  </span>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                    {dormitory.type}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-black leading-7">
                  {dormitory.name}
                </h3>

                <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-slate-500">
                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0 text-violet-500"
                  />

                  <span>
                    {dormitory.city}
                    {dormitory.district
                      ? `, ${formatPlaceName(
                          dormitory.district
                        )}`
                      : ""}
                  </span>
                </p>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
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
                      : "Henüz bulunamadı"}
                  </p>
                </div>

                <Link
                  href={`/yurtlar/${dormitory.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-3 text-sm font-black !text-white transition hover:bg-violet-700"
                >
                  Yeniden incele
                </Link>
              </article>
            );
          }
        )}
      </div>
    </section>
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
