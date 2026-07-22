"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Sparkles,
  X,
} from "lucide-react";

const ANNOUNCEMENT_ID = "2026-yks-ozel-kontenjanlar-v1";
const STORAGE_KEY =
  `yks-tercih-announcement-dismissed:${ANNOUNCEMENT_ID}`;

export default function HomeAnnouncement() {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const dismissed =
      window.localStorage.getItem(STORAGE_KEY) === "1";

    if (!dismissed) {
      setIsOpen(true);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeAnnouncement();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function closeAnnouncement() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setIsOpen(false);
  }

  if (!isReady || !isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="yks-announcement-title"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 px-4 py-6 backdrop-blur-md sm:px-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeAnnouncement();
        }
      }}
    >
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-2xl shadow-slate-950/40">
        <button
          type="button"
          onClick={closeAnnouncement}
          aria-label="Duyuruyu kapat"
          className="absolute right-4 top-4 z-20 flex size-11 items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white backdrop-blur transition hover:scale-105 hover:bg-slate-950 sm:right-6 sm:top-6"
        >
          <X size={22} />
        </button>

        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[310px] overflow-hidden bg-gradient-to-br from-red-700 via-red-700 to-red-500 p-7 text-white sm:min-h-[390px] sm:p-10">
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-28 -left-20 size-72 rounded-full bg-red-300/25 blur-3xl" />

            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
                <Sparkles size={17} />
                Güncel YKS duyurusu
              </div>

              <div className="my-auto py-10">
                <div className="flex size-20 items-center justify-center rounded-[26px] border border-white/20 bg-white/15 shadow-xl backdrop-blur">
                  <GraduationCap size={42} />
                </div>

                <p className="mt-7 text-sm font-black uppercase tracking-[0.2em] text-red-100">
                  2026 YKS
                </p>

                <h2
                  id="yks-announcement-title"
                  className="mt-3 max-w-lg text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl"
                >
                  Özel kontenjanları biliyor musun?
                </h2>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-red-100">
                <CalendarDays size={17} />
                2026 YKS başvuru kılavuzu
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-red-600">
              Adaylar için önemli bilgi
            </p>

            <h3 className="mt-3 text-3xl font-black leading-tight tracking-[-0.03em] text-slate-950 sm:text-4xl">
              Bazı adaylara özel kontenjan ve yerleştirme hakları bulunuyor.
            </h3>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              2026 YKS kılavuzunda okul birincileri, 34 yaş üstü kadınlar,
              şehit ve gazi yakınları, engelli adaylar, millî sporcular ve
              TÜBİTAK yarışmalarında derece alan adaylar için özel uygulamalar
              yer alıyor.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Okul birincisi kontenjanı",
                "34 yaş üstü kadın kontenjanı",
                "Şehit ve gazi yakını kontenjanı",
                "Engelli ve millî sporcu hakları",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <BookOpen size={16} />
                  </div>

                  <p className="text-sm font-bold leading-6 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={closeAnnouncement}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-700"
              >
                Anladım, siteye devam et
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={closeAnnouncement}
                className="min-h-12 rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700 transition hover:border-red-300 hover:text-red-600"
              >
                Kapat
              </button>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-400">
              Bu duyuru bilgilendirme amaçlıdır. Başvuru ve tercih işlemlerinde
              ÖSYM tarafından yayımlanan güncel kılavuz ve duyurular esas
              alınmalıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
