"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronRight,
  GraduationCap,
  ListChecks,
  Search,
  Trash2,
} from "lucide-react";

type PreferenceProgram = {
  code: string;
  programName: string;
  universityName: string;
  scoreType: string;
  latestRanking: number | null;
};

const STORAGE_KEY = "tercih-pusula-preferences";
const MAX_PREFERENCES = 24;

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<PreferenceProgram[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadPreferences();
    setReady(true);

    window.addEventListener(
      "preferences-updated",
      loadPreferences
    );

    return () => {
      window.removeEventListener(
        "preferences-updated",
        loadPreferences
      );
    };
  }, []);

  function loadPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];

      setPreferences(Array.isArray(parsed) ? parsed : []);
    } catch {
      setPreferences([]);
    }
  }

  function savePreferences(updated: PreferenceProgram[]) {
    setPreferences(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("preferences-updated"));
  }

  function moveProgram(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= preferences.length
    ) {
      return;
    }

    const updated = [...preferences];
    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];

    savePreferences(updated);
  }

  function removeProgram(code: string) {
    savePreferences(
      preferences.filter((program) => program.code !== code)
    );
  }

  function clearPreferences() {
    savePreferences([]);
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
              <p className="text-xs text-slate-500">
                Tercih listem
              </p>
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
        <div className="rounded-[30px] bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-black text-indigo-100">
                24 tercihlik kişisel listen
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-5xl">
                Tercih listem
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-indigo-100">
                Programları istediğin sıraya getir. En çok istediğin
                bölüm en üstte olsun.
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur">
              <p className="text-3xl font-black">
                {preferences.length}/{MAX_PREFERENCES}
              </p>
              <p className="text-xs font-bold text-indigo-100">
                tercih eklendi
              </p>
            </div>
          </div>
        </div>

        {!ready && (
          <div className="mt-8 rounded-3xl bg-white p-14 text-center">
            Tercihlerin yükleniyor...
          </div>
        )}

        {ready && preferences.length === 0 && (
          <div className="mt-8 rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
              <ListChecks size={30} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Tercih listen henüz boş
            </h2>

            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
              Program detay sayfasındaki “Tercih listeme ekle”
              butonuyla bölümleri buraya ekleyebilirsin.
            </p>

            <Link href="/programlar" className="primary-button mt-6">
              <Search size={18} />
              Programları keşfet
            </Link>
          </div>
        )}

        {ready && preferences.length > 0 && (
          <>
            <div className="mt-8 space-y-4">
              {preferences.map((program, index) => (
                <article
                  key={program.code}
                  className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
                >
                  <div className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <span className="soft-badge">
                          {program.scoreType || "Belirsiz"}
                        </span>

                        {program.latestRanking !== null && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                            Son sıra:{" "}
                            {new Intl.NumberFormat("tr-TR").format(
                              program.latestRanking
                            )}
                          </span>
                        )}
                      </div>

                      <h2 className="mt-3 text-lg font-black sm:text-xl">
                        {program.programName}
                      </h2>

                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                        {program.universityName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveProgram(index, "up")}
                      className="flex h-11 items-center justify-center rounded-xl border border-slate-200 disabled:opacity-30"
                      aria-label="Yukarı taşı"
                    >
                      <ArrowUp size={18} />
                    </button>

                    <button
                      type="button"
                      disabled={index === preferences.length - 1}
                      onClick={() => moveProgram(index, "down")}
                      className="flex h-11 items-center justify-center rounded-xl border border-slate-200 disabled:opacity-30"
                      aria-label="Aşağı taşı"
                    >
                      <ArrowDown size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeProgram(program.code)}
                      className="flex h-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
                      aria-label="Tercihten çıkar"
                    >
                      <Trash2 size={18} />
                    </button>

                    <Link
                      href={`/programlar/${program.code}`}
                      className="flex h-11 items-center justify-center rounded-xl bg-slate-950 !text-white"
                      aria-label="Programı incele"
                    >
                      <ChevronRight size={19} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-slate-500">
                Tercih sıralaman otomatik olarak cihazında saklanır.
              </p>

              <button
                type="button"
                onClick={clearPreferences}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-black text-rose-600"
              >
                <Trash2 size={17} />
                Listeyi temizle
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
