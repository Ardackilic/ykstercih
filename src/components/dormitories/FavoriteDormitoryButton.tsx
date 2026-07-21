"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export const DORMITORY_FAVORITES_STORAGE_KEY =
  "yks-tercih-favorite-dormitories";

export const DORMITORY_FAVORITES_EVENT =
  "dormitory-favorites-updated";

export function readDormitoryFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(
      DORMITORY_FAVORITES_STORAGE_KEY
    );

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return Array.from(
      new Set(
        parsed.filter(
          (item): item is string =>
            typeof item === "string" &&
            item.trim().length > 0
        )
      )
    );
  } catch {
    return [];
  }
}

type FavoriteDormitoryButtonProps = {
  dormitoryId: string;
  dormitoryName: string;
  compact?: boolean;
};

export default function FavoriteDormitoryButton({
  dormitoryId,
  dormitoryName,
  compact = false,
}: FavoriteDormitoryButtonProps) {
  const [isFavorite, setIsFavorite] =
    useState(false);

  const [isReady, setIsReady] =
    useState(false);

  useEffect(() => {
    function refreshFavoriteState() {
      setIsFavorite(
        readDormitoryFavorites().includes(
          dormitoryId
        )
      );
    }

    refreshFavoriteState();
    setIsReady(true);

    window.addEventListener(
      DORMITORY_FAVORITES_EVENT,
      refreshFavoriteState
    );

    window.addEventListener(
      "storage",
      refreshFavoriteState
    );

    return () => {
      window.removeEventListener(
        DORMITORY_FAVORITES_EVENT,
        refreshFavoriteState
      );

      window.removeEventListener(
        "storage",
        refreshFavoriteState
      );
    };
  }, [dormitoryId]);

  function toggleFavorite() {
    const favorites =
      readDormitoryFavorites();

    const nextFavorites = favorites.includes(
      dormitoryId
    )
      ? favorites.filter(
          (id) => id !== dormitoryId
        )
      : [...favorites, dormitoryId];

    window.localStorage.setItem(
      DORMITORY_FAVORITES_STORAGE_KEY,
      JSON.stringify(nextFavorites)
    );

    setIsFavorite(
      nextFavorites.includes(dormitoryId)
    );

    window.dispatchEvent(
      new Event(
        DORMITORY_FAVORITES_EVENT
      )
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite();
      }}
      disabled={!isReady}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? `${dormitoryName} favorilerden çıkar`
          : `${dormitoryName} favorilere ekle`
      }
      title={
        isFavorite
          ? "Favorilerden çıkar"
          : "Favorilere ekle"
      }
      className={
        compact
          ? `inline-flex size-11 shrink-0 items-center justify-center rounded-xl border transition ${
              isFavorite
                ? "border-rose-300 bg-rose-100 text-rose-600"
                : "border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            }`
          : `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${
              isFavorite
                ? "bg-rose-100 text-rose-600 ring-1 ring-rose-300"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-rose-600 hover:ring-rose-300"
            }`
      }
    >
      <Heart
        size={19}
        fill={
          isFavorite
            ? "currentColor"
            : "none"
        }
      />

      {!compact && (
        <span>
          {isFavorite
            ? "Favorilerden çıkar"
            : "Favorilere ekle"}
        </span>
      )}
    </button>
  );
}
