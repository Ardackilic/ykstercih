"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, X } from "lucide-react";

export default function GuideNoticeModal() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-notice-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white p-6 pt-14 shadow-2xl dark:border-white/10 dark:bg-zinc-950">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Bilgilendirmeyi kapat"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
          <BookOpen className="h-7 w-7" />
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Önemli bilgilendirme
        </p>

        <h2
          id="guide-notice-title"
          className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white"
        >
          2026 YKS kılavuzunu takip edin
        </h2>

        <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-300">
          2026 YKS kılavuzundaki yeni açılan bölümleri ve kontenjan
          değişikliklerini sitemizden takip edebilirsiniz.
        </p>

        <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          ÖSYM tarafından yayımlanan bilgilerde değişiklik olabilir.
          Tercihlerinizi kesinleştirmeden önce güncel ÖSYM kılavuzunu
          kontrol etmeyi unutmayın.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/yeni-acilan-bolumler"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Yeni açılan bölümleri gör
          </Link>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
