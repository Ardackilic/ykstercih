"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  Heart,
  Search,
  Trash2,
} from "lucide-react";

type FavoriteProgram = {
  code: string;
  programName: string;
  universityName: string;
  scoreType: string;
  latestRanking: number | null;
};

const STORAGE_KEY = "tercih-pusula-favorites";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProgram[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadFavorites();
    setReady(true);

    window.addEventListener("favorites-updated", loadFavorites);

    return () => {
      window.removeEventListener("favorites-updated", loadFavorites);
    };
  }, []);

  function loadFavorites() {
    try {
      const storedValue = localStorage.getItem(STORAGE_KEY);
      const parsedValue = storedValue
        ? JSON.parse(storedValue)
        : [];

      setFavorites(Array.isArray(parsedValue) ? parsedValue : []);
    } catch {
      setFavorites([]);
    }
  }

  function removeFavorite(programCode: string) {
    const updatedFavorites = favorites.filter(
      (favorite) => favorite.code !== programCode
    );

    setFavorites(updatedFavorites);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedFavorites)
    );

    window.dispatchEvent(new Event("favorites-updated"));
  }

  function clearFavorites() {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("favorites-updated"));
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 !text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="font-black">YKS Tercih</p>
              <p className="text-xs text-slate-500">Favorilerim</p>
            </div>
          </Link>

          <Link
            href="/programlar"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
          >
            <ArrowLeft size={17} />
            Programlar
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-black text-indigo-600">
              Kaydettiğin programlar
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
              Favorilerim
            </h1>

            <p className="mt-3 text-slate-600">
              Beğendiğin bölümleri burada sakla ve daha sonra karşılaştır.
            </p>
          </div>

          {favorites.length > 0 && (
            <button
              type="button"
              onClick={clearFavorites}
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-600"
            >
              <Trash2 size={17} />
              Tümünü temizle
            </button>
          )}
        </div>

        {!ready && (
          <div className="mt-8 rounded-3xl bg-white p-14 text-center">
            Favoriler yükleniyor...
          </div>
        )}

        {ready && favorites.length === 0 && (
          <div className="mt-8 rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
              <Heart size={30} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Henüz favori eklemedin
            </h2>

            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
              Programları incelerken kalp simgesine dokunarak burada
              saklayabilirsin.
            </p>

            <Link
              href="/programlar"
              className="primary-button mt-6"
            >
              <Search size={18} />
              Programları keşfet
            </Link>
          </div>
        )}

        {ready && favorites.length > 0 && (
          <div className="mt-8 grid gap-4">
            {favorites.map((program) => (
              <article
                key={program.code}
                className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <GraduationCap size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="soft-badge">
                        {program.scoreType || "Belirsiz"}
                      </span>

                      {program.latestRanking !== null && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                          Sıra:{" "}
                          {new Intl.NumberFormat("tr-TR").format(
                            program.latestRanking
                          )}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 text-xl font-black">
                      {program.programName}
                    </h2>

                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                      {program.universityName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFavorite(program.code)}
                    aria-label="Favorilerden çıkar"
                    className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"
                  >
                    <Heart size={20} fill="currentColor" />
                  </button>
                </div>

                <Link
                  href={`/programlar/${program.code}`}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black !text-white transition hover:bg-indigo-600"
                >
                  Programı incele
                  <ChevronRight size={18} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
