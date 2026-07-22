"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BedDouble,
  GraduationCap,
  Heart,
  MapPin,
  Users,
} from "lucide-react";

import { allDormitories } from "@/data/all-dormitories";
import { dormitoryMatchMap } from "@/data/dormitory-matches";
import { generatedDormitoryCapacityMap } from "@/data/generated-dormitory-capacities";
import FavoriteDormitoryButton, {
  DORMITORY_FAVORITES_EVENT,
  readDormitoryFavorites,
} from "@/components/dormitories/FavoriteDormitoryButton";


export default function FavoriteDormitoriesPage() {
  const [favoriteIds, setFavoriteIds] =
    useState<string[]>([]);

  const [isReady, setIsReady] =
    useState(false);

  useEffect(() => {
    function refreshFavorites() {
      setFavoriteIds(
        readDormitoryFavorites()
      );
    }

    function refreshWhenVisible() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        refreshFavorites();
      }
    }

    refreshFavorites();
    setIsReady(true);

    window.addEventListener(
      DORMITORY_FAVORITES_EVENT,
      refreshFavorites
    );

    window.addEventListener(
      "storage",
      refreshFavorites
    );

    window.addEventListener(
      "focus",
      refreshFavorites
    );

    document.addEventListener(
      "visibilitychange",
      refreshWhenVisible
    );

    return () => {
      window.removeEventListener(
        DORMITORY_FAVORITES_EVENT,
        refreshFavorites
      );

      window.removeEventListener(
        "storage",
        refreshFavorites
      );

      window.removeEventListener(
        "focus",
        refreshFavorites
      );

      document.removeEventListener(
        "visibilitychange",
        refreshWhenVisible
      );
    };
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

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
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
            className="flex items-center gap-2 font-black text-red-600"
          >
            <GraduationCap size={21} />
            YKS Tercih
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-rose-500 via-pink-500 to-red-600 p-6 text-white shadow-xl sm:p-9">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Heart
              size={28}
              fill="currentColor"
            />
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
            Favori yurtların
          </h1>

          <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-rose-50 sm:text-base">
            Beğendiğin yurtları burada
            saklayabilir, ayrıntılarını yeniden
            inceleyebilir ve daha sonra
            karşılaştırabilirsin.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <span className="text-sm font-black">
                {favoriteDormitories.length} favori
                yurt
              </span>
            </div>

            {favoriteDormitories.length >= 2 && (
              <Link
                href="/yurtlar/karsilastir"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-50"
              >
                Favorileri karşılaştır
              </Link>
            )}
          </div>
        </div>

        {!isReady ? (
          <div className="mt-6 rounded-[26px] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70">
            <p className="font-black text-slate-500">
              Favoriler yükleniyor...
            </p>
          </div>
        ) : favoriteDormitories.length === 0 ? (
          <div className="mt-6 rounded-[26px] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70 sm:p-12">
            <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
              <Heart size={30} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Henüz favori yurt yok
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-6 text-slate-500">
              Yurt listesindeki kalp simgesine
              basarak beğendiğin yurtları buraya
              ekleyebilirsin.
            </p>

            <Link
              href="/yurtlar"
              className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-black !text-white transition hover:bg-red-700"
            >
              Yurtları incele
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {favoriteDormitories.map(
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

                const match =
                  dormitoryMatchMap.get(
                    dormitory.id
                  );

                const nearestUniversity =
                  match?.nearestUniversities?.[0] ??
                  null;

                return (
                  <article
                    key={dormitory.id}
                    className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                            {dormitory.type}
                          </span>

                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                            {dormitory.gender}
                          </span>

                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                            Resmî KYGM
                          </span>
                        </div>

                        <h2 className="mt-3 text-xl font-black">
                          <Link
                            href={`/yurtlar/${dormitory.id}`}
                            className="transition hover:text-red-600"
                          >
                            {dormitory.name}
                          </Link>
                        </h2>

                        <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-slate-500">
                          <MapPin
                            size={17}
                            className="mt-0.5 shrink-0 text-red-500"
                          />

                          <span>
                            {dormitory.city}
                            {dormitory.district
                              ? `, ${dormitory.district}`
                              : ""}
                          </span>
                        </p>
                      </div>

                      <FavoriteDormitoryButton
                        dormitoryId={
                          dormitory.id
                        }
                        dormitoryName={
                          dormitory.name
                        }
                        compact
                      />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-red-600">
                          <Users size={20} />
                        </div>

                        <p className="mt-3 text-xs font-black text-slate-500">
                          {capacityYear
                            ? `Resmî kapasite (${capacityYear})`
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

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-red-600">
                          <BedDouble size={20} />
                        </div>

                        <p className="mt-3 text-xs font-black text-slate-500">
                          Üniversite eşleşmesi
                        </p>

                        <p className="mt-1 font-black leading-6">
                          {nearestUniversity
                            ? nearestUniversity.distanceKm !==
                              null
                              ? nearestUniversity.universityName
                              : `${dormitory.city} içindeki üniversiteler`
                            : "Henüz eşleştirilmedi"}
                        </p>

                        {nearestUniversity?.distanceKm !==
                          null &&
                          nearestUniversity?.distanceKm !==
                            undefined && (
                            <p className="mt-2 text-sm font-black text-emerald-600">
                              {nearestUniversity.distanceKm.toLocaleString(
                                "tr-TR",
                                {
                                  maximumFractionDigits: 1,
                                }
                              )}{" "}
                              km
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                      <Link
                        href={`/yurtlar/${dormitory.id}`}
                        className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black !text-white transition hover:bg-red-700"
                      >
                        Yurdu incele
                      </Link>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}
