"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  GitCompareArrows,
  GraduationCap,
  Heart,
  MapPin,
  Users,
  X,
} from "lucide-react";

import { allDormitories } from "@/data/all-dormitories";
import { dormitoryMatchMap } from "@/data/dormitory-matches";
import { generatedDormitoryCapacityMap } from "@/data/generated-dormitory-capacities";
import { generatedDormitoryRoomTypeMap } from "@/data/generated-dormitory-room-types";
import { dormitoryDetailMap } from "@/data/dormitory-details";

const STORAGE_KEY =
  "yks-tercih-favorite-dormitories";

const MIN_SELECTION = 2;
const MAX_SELECTION = 4;

function readFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored =
      window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string =>
            typeof item === "string"
        )
      : [];
  } catch {
    return [];
  }
}

export default function CompareDormitoriesPage() {
  const [favoriteIds, setFavoriteIds] =
    useState<string[]>([]);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [isReady, setIsReady] =
    useState(false);

  useEffect(() => {
    const ids = readFavorites();

    setFavoriteIds(ids);
    setSelectedIds(ids.slice(0, MAX_SELECTION));
    setIsReady(true);
  }, []);

  const favoriteDormitories = useMemo(
    () =>
      favoriteIds
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
        ),
    [favoriteIds]
  );

  const selectedDormitories = useMemo(
    () =>
      selectedIds
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
        ),
    [selectedIds]
  );

  function toggleSelection(
    dormitoryId: string
  ) {
    setSelectedIds((current) => {
      if (current.includes(dormitoryId)) {
        return current.filter(
          (id) => id !== dormitoryId
        );
      }

      if (
        current.length >= MAX_SELECTION
      ) {
        return current;
      }

      return [...current, dormitoryId];
    });
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/yurtlar/favoriler"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Favorilere dön
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
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-red-600 via-red-600 to-red-700 p-6 text-white shadow-xl sm:p-9">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <GitCompareArrows size={28} />
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
            Yurtları karşılaştır
          </h1>

          <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-red-100 sm:text-base">
            Favorilerinden en az 2, en fazla 4
            yurt seç. Kapasite, konum ve
            üniversite yakınlığını yan yana
            incele.
          </p>

          <div className="mt-6 inline-flex rounded-2xl bg-white/15 px-4 py-3 text-sm font-black backdrop-blur">
            {selectedIds.length} / {MAX_SELECTION}
            {" "}yurt seçildi
          </div>
        </div>

        {!isReady ? (
          <div className="mt-6 rounded-[26px] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70">
            <p className="font-black text-slate-500">
              Favoriler yükleniyor...
            </p>
          </div>
        ) : favoriteDormitories.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section className="mt-6 rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    Karşılaştırılacak yurtları seç
                  </h2>

                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    En fazla dört yurt seçebilirsin.
                  </p>
                </div>

                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIds([])
                    }
                    className="text-sm font-black text-rose-600"
                  >
                    Seçimi temizle
                  </button>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteDormitories.map(
                  (dormitory) => {
                    const selected =
                      selectedIds.includes(
                        dormitory.id
                      );

                    const selectionDisabled =
                      !selected &&
                      selectedIds.length >=
                        MAX_SELECTION;

                    return (
                      <button
                        key={dormitory.id}
                        type="button"
                        disabled={
                          selectionDisabled
                        }
                        onClick={() =>
                          toggleSelection(
                            dormitory.id
                          )
                        }
                        className={`relative rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-red-500 bg-red-50 ring-4 ring-red-100"
                            : "border-slate-200 bg-white hover:border-red-300"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <div
                          className={`absolute right-4 top-4 flex size-8 items-center justify-center rounded-full ${
                            selected
                              ? "bg-red-600 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {selected ? (
                            <Check size={17} />
                          ) : (
                            <Heart size={16} />
                          )}
                        </div>

                        <div className="pr-10">
                          <p className="text-xs font-black text-red-600">
                            {dormitory.city}
                          </p>

                          <h3 className="mt-1 font-black leading-6">
                            {dormitory.name}
                          </h3>

                          <p className="mt-2 text-sm font-semibold text-slate-500">
                            {dormitory.gender}
                          </p>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </section>

            {selectedDormitories.length <
            MIN_SELECTION ? (
              <div className="mt-6 rounded-[26px] border border-dashed border-red-300 bg-red-50 p-8 text-center">
                <GitCompareArrows
                  size={34}
                  className="mx-auto text-red-500"
                />

                <h2 className="mt-4 text-xl font-black">
                  Karşılaştırma için en az iki
                  yurt seç
                </h2>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Şu anda{" "}
                  {selectedDormitories.length} yurt
                  seçili.
                </p>
              </div>
            ) : (
              <ComparisonTable
                dormitories={
                  selectedDormitories
                }
                onRemove={(id) =>
                  setSelectedIds((current) =>
                    current.filter(
                      (item) => item !== id
                    )
                  )
                }
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}

function ComparisonTable({
  dormitories,
  onRemove,
}: {
  dormitories: typeof allDormitories;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="mt-6 overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="overflow-x-auto">
        <table className="min-w-[850px] w-full border-collapse">
          <thead>
            <tr>
              <th className="w-48 border-b border-r border-slate-200 bg-slate-50 p-4 text-left text-sm font-black text-slate-500">
                Özellik
              </th>

              {dormitories.map(
                (dormitory) => (
                  <th
                    key={dormitory.id}
                    className="min-w-56 border-b border-r border-slate-200 p-4 text-left align-top last:border-r-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-red-600">
                          {dormitory.city}
                        </p>

                        <Link
                          href={`/yurtlar/${dormitory.id}`}
                          className="mt-1 block font-black leading-6 hover:text-red-600"
                        >
                          {dormitory.name}
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onRemove(dormitory.id)
                        }
                        aria-label="Karşılaştırmadan çıkar"
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            <ComparisonRow
              label="Şehir / ilçe"
              dormitories={dormitories}
              getValue={(dormitory) =>
                dormitory.district
                  ? `${dormitory.city}, ${formatPlaceName(
                      dormitory.district
                    )}`
                  : dormitory.city
              }
            />

            <ComparisonRow
              label="Cinsiyet"
              dormitories={dormitories}
              getValue={(dormitory) =>
                dormitory.gender
              }
            />

            <ComparisonRow
              label="Yurt türü"
              dormitories={dormitories}
              getValue={(dormitory) =>
                dormitory.type
              }
            />

            <ComparisonRow
              label="Kapasite"
              dormitories={dormitories}
              getValue={(dormitory) => {
                const generated =
                  generatedDormitoryCapacityMap.get(
                    dormitory.id
                  );

                const capacity =
                  dormitory.capacity ??
                  generated?.capacity ??
                  dormitory.historicalCapacity ??
                  null;

                const year =
                  generated?.capacityYear ??
                  dormitory.historicalCapacityYear ??
                  null;

                return capacity !== null
                  ? `${capacity.toLocaleString(
                      "tr-TR"
                    )} öğrenci${
                      year
                        ? ` (${year})`
                        : ""
                    }`
                  : "Henüz bulunamadı";
              }}
            />

            <ComparisonRow
              label="Oda tipi"
              dormitories={dormitories}
              getValue={(dormitory) => {
                const generated =
                  generatedDormitoryRoomTypeMap.get(
                    dormitory.id
                  );

                const detail =
                  dormitoryDetailMap.get(
                    dormitory.id
                  );

                const roomTypes =
                  generated?.roomTypes?.length
                    ? generated.roomTypes
                    : detail?.roomTypes?.length
                      ? detail.roomTypes
                      : dormitory.roomTypes;

                return roomTypes.length > 0
                  ? roomTypes.join(", ")
                  : "Doğrulanmış veri yok";
              }}
            />

            <ComparisonRow
              label="Yakın üniversite"
              dormitories={dormitories}
              getValue={(dormitory) => {
                const match =
                  dormitoryMatchMap.get(
                    dormitory.id
                  );

                const nearest =
                  match?.nearestUniversities?.[0] ??
                  null;

                if (!nearest) {
                  return "Henüz eşleştirilmedi";
                }

                if (
                  nearest.distanceKm === null
                ) {
                  return `${dormitory.city} içindeki üniversiteler`;
                }

                return nearest.universityName;
              }}
            />

            <ComparisonRow
              label="Kuş uçuşu mesafe"
              dormitories={dormitories}
              getValue={(dormitory) => {
                const match =
                  dormitoryMatchMap.get(
                    dormitory.id
                  );

                const distance =
                  match?.nearestUniversities?.[0]
                    ?.distanceKm ?? null;

                return distance !== null
                  ? `${distance.toLocaleString(
                      "tr-TR",
                      {
                        maximumFractionDigits: 1,
                      }
                    )} km`
                  : "Henüz hesaplanmadı";
              }}
            />

            <ComparisonRow
              label="Adres"
              dormitories={dormitories}
              getValue={(dormitory) =>
                dormitory.address ||
                "Adres bulunamadı"
              }
            />

            <ComparisonRow
              label="Telefon"
              dormitories={dormitories}
              getValue={(dormitory) =>
                dormitory.phone ||
                "Telefon bulunamadı"
              }
            />
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ComparisonRow({
  label,
  dormitories,
  getValue,
}: {
  label: string;
  dormitories: typeof allDormitories;
  getValue: (
    dormitory: (typeof allDormitories)[number]
  ) => string;
}) {
  return (
    <tr>
      <th className="border-b border-r border-slate-200 bg-slate-50 p-4 text-left align-top text-sm font-black text-slate-600">
        {label}
      </th>

      {dormitories.map(
        (dormitory) => (
          <td
            key={dormitory.id}
            className="border-b border-r border-slate-200 p-4 align-top text-sm font-bold leading-6 text-slate-700 last:border-r-0"
          >
            {getValue(dormitory)}
          </td>
        )
      )}
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-[26px] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70 sm:p-12">
      <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
        <Heart size={30} />
      </div>

      <h2 className="mt-5 text-2xl font-black">
        Karşılaştırılacak favori yok
      </h2>

      <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-6 text-slate-500">
        Önce yurtları favorilerine ekle.
        Ardından burada karşılaştırabilirsin.
      </p>

      <Link
        href="/yurtlar"
        className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-black !text-white transition hover:bg-red-700"
      >
        Yurtları incele
      </Link>
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
