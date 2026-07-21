"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

type FavoriteProgram = {
  code: string;
  programName: string;
  universityName: string;
  scoreType: string;
  latestRanking: number | null;
};

const STORAGE_KEY = "tercih-pusula-favorites";

export default function FavoriteButton({
  program,
  compact = false,
}: {
  program: FavoriteProgram;
  compact?: boolean;
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const favorites = getFavorites();

    setIsFavorite(
      favorites.some((favorite) => favorite.code === program.code)
    );

    setReady(true);
  }, [program.code]);

  function toggleFavorite() {
    const favorites = getFavorites();

    if (favorites.some((favorite) => favorite.code === program.code)) {
      const updatedFavorites = favorites.filter(
        (favorite) => favorite.code !== program.code
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedFavorites)
      );

      setIsFavorite(false);
    } else {
      const updatedFavorites = [program, ...favorites];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedFavorites)
      );

      setIsFavorite(true);
    }

    window.dispatchEvent(new Event("favorites-updated"));
  }

  if (!ready) {
    return (
      <button
        type="button"
        disabled
        className={
          compact
            ? "flex size-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-300"
            : "flex w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-5 py-3 font-black text-white opacity-70"
        }
      >
        <Heart size={19} />
        {!compact && "Favorilere ekle"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"
      }
      className={
        compact
          ? `flex size-12 shrink-0 items-center justify-center rounded-2xl border transition ${
              isFavorite
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-slate-200 bg-white text-slate-400 hover:border-rose-200 hover:text-rose-500"
            }`
          : `flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-black transition lg:w-auto ${
              isFavorite
                ? "border-white bg-white text-rose-600"
                : "border-white/30 bg-white/15 text-white backdrop-blur hover:bg-white/25"
            }`
      }
    >
      <Heart
        size={19}
        fill={isFavorite ? "currentColor" : "none"}
      />

      {!compact &&
        (isFavorite ? "Favorilerden çıkar" : "Favorilere ekle")}
    </button>
  );
}

function getFavorites(): FavoriteProgram[] {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}
