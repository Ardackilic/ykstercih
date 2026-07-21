"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY =
  "yks-tercih-favorite-dormitories";

function readFavoriteCount(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const stored =
      window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return 0;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return 0;
    }

    return new Set(
      parsed.filter(
        (item): item is string =>
          typeof item === "string"
      )
    ).size;
  } catch {
    return 0;
  }
}

export default function FavoriteDormitoryCountLink() {
  const [favoriteCount, setFavoriteCount] =
    useState(0);

  useEffect(() => {
    function refreshCount() {
      setFavoriteCount(readFavoriteCount());
    }

    refreshCount();

    window.addEventListener(
      "dormitory-favorites-updated",
      refreshCount
    );

    window.addEventListener(
      "storage",
      refreshCount
    );

    return () => {
      window.removeEventListener(
        "dormitory-favorites-updated",
        refreshCount
      );

      window.removeEventListener(
        "storage",
        refreshCount
      );
    };
  }, []);

  return (
    <Link
      href="/yurtlar/favoriler"
      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-black text-rose-600 transition hover:bg-rose-100 sm:px-4"
    >
      <Heart
        size={17}
        fill={
          favoriteCount > 0
            ? "currentColor"
            : "none"
        }
      />

      <span className="hidden sm:inline">
        Favoriler
      </span>

      {favoriteCount > 0 && (
        <span className="flex min-w-6 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-xs font-black !text-white">
          {favoriteCount > 99
            ? "99+"
            : favoriteCount}
        </span>
      )}
    </Link>
  );
}
