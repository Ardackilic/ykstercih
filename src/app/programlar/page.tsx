"use client";

import Link from "next/link";
import FavoriteButton from "@/components/favorite-button";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  GraduationCap,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const PROGRAMS_SCROLL_KEY =
  "yks-tercih-programs-scroll-position";

const PROGRAMS_RETURN_KEY =
  "yks-tercih-programs-return-pending";

const PROGRAMS_STATE_KEY =
  "yks-tercih-programs-list-state";

type HistoryItem = {
  ranking: number | null;
  baseScore: number | null;
  generalQuota: number | null;
};

type Program = {
  code: string;
  programName: string;
  universityName: string;
  universityType: string;
  academicUnit: string | null;
  level: string;
  duration: number | null;
  scoreType: string;
  language: string;
  scholarship: string | null;
  latestResultYear: number | null;
  latestRanking: number | null;
  latestBaseScore: number | null;
  latestQuota: number | null;
  history: Record<string, HistoryItem>;
};

type ApiResponse = {
  results: Program[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filterOptions: {
    cities: string[];
  };
};

function normalizeScoreType(value: string) {
  const normalized = value
    .trim()
    .toLocaleUpperCase("tr-TR");

  if (normalized === "DIL" || normalized === "DİL") {
    return "DİL";
  }

  if (normalized === "SOZ" || normalized === "SÖZ") {
    return "SÖZ";
  }

  if (
    normalized === "TYT" ||
    normalized === "SAY" ||
    normalized === "EA"
  ) {
    return normalized;
  }

  return "";
}

export default function ProgramsPage() {
  const scrollRestoredRef = useRef(false);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [query, setQuery] = useState("");
  const [scoreType, setScoreType] = useState("");
  const [universityType, setUniversityType] = useState("");
  const [level, setLevel] = useState("");
  const [city, setCity] = useState("");
  const [teachingType, setTeachingType] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [ranking, setRanking] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    const shouldRestore =
      params.get("geri") === "1" ||
      window.sessionStorage.getItem(PROGRAMS_RETURN_KEY) === "1";

    const savedStateRaw =
      window.sessionStorage.getItem(PROGRAMS_STATE_KEY);

    if (shouldRestore && savedStateRaw) {
      try {
        const savedState = JSON.parse(savedStateRaw) as {
          programCode?: string;
          query?: string;
          scoreType?: string;
          universityType?: string;
          level?: string;
          city?: string;
          teachingType?: string;
          ranking?: string;
          page?: number;
          scrollY?: number;
        };

        setQuery(savedState.query ?? "");
        setScoreType(
          normalizeScoreType(savedState.scoreType ?? "")
        );
        setUniversityType(savedState.universityType ?? "");
        setLevel(savedState.level ?? "");
        setCity(savedState.city ?? "");
        setTeachingType(savedState.teachingType ?? "");
        setRanking(savedState.ranking ?? "");
        setPage(
          typeof savedState.page === "number" &&
            savedState.page > 0
            ? savedState.page
            : 1
        );

        setFiltersInitialized(true);
        return;
      } catch {
        window.sessionStorage.removeItem(PROGRAMS_STATE_KEY);
        window.sessionStorage.removeItem(PROGRAMS_RETURN_KEY);
      }
    }

    const urlQuery = params.get("q") ?? "";
    const urlScoreType = normalizeScoreType(
      params.get("puanTuru") ?? ""
    );
    const urlUniversityType =
      params.get("universiteTuru") ?? "";
    const urlLevel = params.get("seviye") ?? "";
    const urlCity = params.get("il") ?? "";
    const urlTeachingType =
      params.get("ogretimSekli") ?? "";
    const urlRanking = (
      params.get("siralama") ?? ""
    ).replace(/\D/g, "");

    setQuery(urlQuery);
    setScoreType(urlScoreType);
    setUniversityType(urlUniversityType);
    setLevel(urlLevel);
    setCity(urlCity);
    setTeachingType(urlTeachingType);
    setRanking(urlRanking);
    setPage(1);
    setFiltersInitialized(true);
  }, []);

  useEffect(() => {
    if (!filtersInitialized) {
      return;
    }

    const controller = new AbortController();

    async function loadPrograms() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (query.trim()) params.set("q", query.trim());
      if (scoreType) params.set("puanTuru", scoreType);
      if (universityType) params.set("universiteTuru", universityType);
      if (level) params.set("seviye", level);
      if (city) params.set("il", city);
      if (teachingType) params.set("ogretimSekli", teachingType);
      if (ranking) params.set("siralama", ranking);

      params.set("sayfa", String(page));
      params.set("limit", "20");

      try {
        const response = await fetch(`/api/programlar?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Programlar yüklenemedi.");
        }

        const data: ApiResponse = await response.json();

        setPrograms(data.results);
        setPagination(data.pagination);
        setCities(data.filterOptions.cities);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    }

    const timeout = setTimeout(loadPrograms, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [
    filtersInitialized,
    query,
    scoreType,
    universityType,
    level,
    city,
    teachingType,
    ranking,
    page,
  ]);

  useEffect(() => {
    if (
      loading ||
      scrollRestoredRef.current ||
      typeof window === "undefined"
    ) {
      return;
    }

    const shouldRestore =
      window.sessionStorage.getItem(PROGRAMS_RETURN_KEY) === "1";

    if (!shouldRestore) {
      scrollRestoredRef.current = true;
      return;
    }

    const savedStateRaw =
      window.sessionStorage.getItem(PROGRAMS_STATE_KEY);

    const storedFallbackScrollY = Number(
      window.sessionStorage.getItem(PROGRAMS_SCROLL_KEY) ?? 0
    );

    let programCode = "";
    let fallbackScrollY = Number.isFinite(storedFallbackScrollY)
      ? storedFallbackScrollY
      : 0;

    if (savedStateRaw) {
      try {
        const savedState = JSON.parse(savedStateRaw) as {
          programCode?: string;
          scrollY?: number;
        };

        programCode = savedState.programCode ?? "";

        if (
          typeof savedState.scrollY === "number" &&
          Number.isFinite(savedState.scrollY)
        ) {
          fallbackScrollY = savedState.scrollY;
        }
      } catch {
        window.sessionStorage.removeItem(PROGRAMS_STATE_KEY);
      }
    }

    scrollRestoredRef.current = true;

    let cancelled = false;
    let attemptCount = 0;
    let retryTimeout: number | undefined;

    const maximumAttempts = 40;
    const retryDelay = 50;

    function clearReturnState() {
      window.sessionStorage.removeItem(PROGRAMS_RETURN_KEY);

      const currentUrl = new URL(window.location.href);

      if (currentUrl.searchParams.has("geri")) {
        currentUrl.searchParams.delete("geri");

        const cleanUrl =
          currentUrl.pathname +
          (currentUrl.searchParams.toString()
            ? `?${currentUrl.searchParams.toString()}`
            : "") +
          currentUrl.hash;

        window.history.replaceState(
          window.history.state,
          "",
          cleanUrl
        );
      }
    }

    function highlightCard(targetCard: HTMLElement) {
      targetCard.classList.add(
        "ring-2",
        "ring-red-400",
        "ring-offset-4"
      );

      window.setTimeout(() => {
        targetCard.classList.remove(
          "ring-2",
          "ring-red-400",
          "ring-offset-4"
        );
      }, 1600);
    }

    function restorePosition() {
      if (cancelled) {
        return;
      }

      const targetCard = programCode
        ? document.getElementById(`program-${programCode}`)
        : null;

      if (targetCard) {
        targetCard.scrollIntoView({
          behavior: "auto",
          block: "start",
          inline: "nearest",
        });

        highlightCard(targetCard);
        clearReturnState();
        return;
      }

      attemptCount += 1;

      if (attemptCount < maximumAttempts) {
        retryTimeout = window.setTimeout(
          restorePosition,
          retryDelay
        );
        return;
      }

      window.scrollTo({
        top: Math.max(0, fallbackScrollY),
        behavior: "auto",
      });

      clearReturnState();
    }

    const firstFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(restorePosition);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);

      if (retryTimeout !== undefined) {
        window.clearTimeout(retryTimeout);
      }
    };
  }, [loading, programs]);

  function saveProgramsPosition(programCode: string) {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(
      PROGRAMS_SCROLL_KEY,
      String(window.scrollY)
    );

    window.sessionStorage.setItem(
      PROGRAMS_STATE_KEY,
      JSON.stringify({
        programCode,
        query,
        scoreType,
        universityType,
        level,
        city,
        teachingType,
        ranking,
        page,
        scrollY: window.scrollY,
      })
    );

    window.sessionStorage.setItem(
      PROGRAMS_RETURN_KEY,
      "1"
    );
  }

  function resetFilters() {
    setQuery("");
    setScoreType("");
    setUniversityType("");
    setLevel("");
    setCity("");
    setTeachingType("");
    setRanking("");
    setPage(1);
  }

  const studentRanking = Number(ranking);

  const groupedPrograms =
    studentRanking > 0
      ? groupProgramsByPreference(
          programs,
          studentRanking
        )
      : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-red-600 !text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="font-black">YKS Tercih</p>
              <p className="text-xs text-slate-500">Gerçek ÖSYM verileri</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold transition hover:border-red-300 hover:text-red-600"
          >
            <ArrowLeft size={17} />
            Ana sayfa
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <p className="font-bold text-red-600">25.959 gerçek program</p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
            Sıralamana uygun programları bul
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Devlet, vakıf, ön lisans ve lisans programlarını gerçek ÖSYM
            verileriyle filtrele ve karşılaştır.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 lg:grid-cols-[290px_1fr] lg:px-8">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 lg:sticky lg:top-5">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-red-600" />
            <h2 className="text-lg font-black">Filtreler</h2>
          </div>

          <FilterField label="Başarı sıralaman">
            <input
              type="number"
              min="1"
              value={ranking}
              onChange={(event) => {
                setRanking(event.target.value);
                setPage(1);
              }}
              placeholder="Örnek: 85000"
              className="filter-input"
            />
          </FilterField>

          <FilterField label="Puan türü">
            <select
              value={scoreType}
              onChange={(event) => {
                setScoreType(event.target.value);
                setPage(1);
              }}
              className="filter-input"
            >
              <option value="">Tümü</option>
              <option value="TYT">TYT</option>
              <option value="SAY">SAY</option>
              <option value="EA">EA</option>
              <option value="SÖZ">SÖZ</option>
              <option value="DİL">DİL</option>
            </select>
          </FilterField>

          <FilterField label="Program seviyesi">
            <select
              value={level}
              onChange={(event) => {
                setLevel(event.target.value);
                setPage(1);
              }}
              className="filter-input"
            >
              <option value="">Tümü</option>
              <option value="Ön Lisans">Ön Lisans</option>
              <option value="Lisans">Lisans</option>
            </select>
          </FilterField>

          <FilterField label="Üniversite türü">
            <select
              value={universityType}
              onChange={(event) => {
                setUniversityType(event.target.value);
                setPage(1);
              }}
              className="filter-input"
            >
              <option value="">Tümü</option>
              <option value="Devlet">Devlet</option>
              <option value="Vakıf">Vakıf</option>
              <option value="KKTC">KKTC</option>
              <option value="Yurt Dışı">Yurt Dışı</option>
            </select>
          </FilterField>

          <FilterField label="İl">
            <select
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setPage(1);
              }}
              className="filter-input"
            >
              <option value="">Tüm iller</option>

              {cities.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Öğretim şekli">
            <select
              value={teachingType}
              onChange={(event) => {
                setTeachingType(event.target.value);
                setPage(1);
              }}
              className="filter-input"
            >
              <option value="">Tümü</option>
              <option value="orgun">Örgün öğretim</option>
              <option value="acikogretim">Açıköğretim</option>
            </select>
          </FilterField>

          <button
            type="button"
            onClick={resetFilters}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold transition hover:border-red-300 hover:text-red-600"
          >
            Filtreleri temizle
          </button>
        </aside>

        <section>
          <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Bölüm, şehir, ilçe veya doğal sorgu ara"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 outline-none transition focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <Filter size={17} className="text-red-600" />
              {format(pagination.total)} program bulundu
            </div>
          </div>

          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto size-9 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
              <p className="mt-4 font-bold text-slate-600">
                Programlar yükleniyor...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-700">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="space-y-6">
                {groupedPrograms ? (
                  <>
                    <PreferenceGroup
                      title="Zor tercihler"
                      description="Geçen yıl senden daha iyi başarı sırasıyla öğrenci alan programlar."
                      count={groupedPrograms.difficult.length}
                      className="border-rose-200 bg-rose-50 text-rose-800"
                    >
                      {groupedPrograms.difficult.map(
                        (program) => (
                          <ProgramCard
                            key={program.code}
                            program={program}
                            studentRanking={studentRanking}
                            onOpenProgram={() => saveProgramsPosition(program.code)}
                          />
                        )
                      )}
                    </PreferenceGroup>

                    <PreferenceGroup
                      title="Sıralamana yakın tercihler"
                      description="Başarı sırana yakın olan ve tercih listende dengeli şekilde bulunabilecek programlar."
                      count={groupedPrograms.near.length}
                      className="border-amber-200 bg-amber-50 text-amber-800"
                    >
                      {groupedPrograms.near.map(
                        (program) => (
                          <ProgramCard
                            key={program.code}
                            program={program}
                            studentRanking={studentRanking}
                            onOpenProgram={() => saveProgramsPosition(program.code)}
                          />
                        )
                      )}
                    </PreferenceGroup>

                    <PreferenceGroup
                      title="Daha güvenli tercihler"
                      description="Geçen yıl senin başarı sırandan daha geride kapatan programlar."
                      count={groupedPrograms.safe.length}
                      className="border-emerald-200 bg-emerald-50 text-emerald-800"
                    >
                      {groupedPrograms.safe.map(
                        (program) => (
                          <ProgramCard
                            key={program.code}
                            program={program}
                            studentRanking={studentRanking}
                            onOpenProgram={() => saveProgramsPosition(program.code)}
                          />
                        )
                      )}
                    </PreferenceGroup>

                    {groupedPrograms.unranked.length > 0 && (
                      <PreferenceGroup
                        title="Sıralama verisi bulunmayanlar"
                        description="2025 başarı sırası oluşmayan veya kontenjanı dolmayan programlar."
                        count={groupedPrograms.unranked.length}
                        className="border-slate-200 bg-slate-100 text-slate-700"
                      >
                        {groupedPrograms.unranked.map(
                          (program) => (
                            <ProgramCard
                              key={program.code}
                              program={program}
                              studentRanking={studentRanking}
                              onOpenProgram={() => saveProgramsPosition(program.code)}
                            />
                          )
                        )}
                      </PreferenceGroup>
                    )}
                  </>
                ) : (
                  programs.map((program) => (
                    <ProgramCard
                      key={program.code}
                      program={program}
                      studentRanking={0}
                      onOpenProgram={() => saveProgramsPosition(program.code)}
                    />
                  ))
                )}

                {programs.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <Search size={38} className="mx-auto text-slate-300" />
                    <h2 className="mt-4 text-xl font-black">
                      Aramana uygun program bulunamadı
                    </h2>
                    <p className="mt-2 text-slate-500">
                      Filtreleri değiştirerek tekrar dene.
                    </p>
                  </div>
                )}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 sm:flex-row">
                  <p className="text-sm font-bold text-slate-600">
                    Sayfa {pagination.page} / {pagination.totalPages}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={17} />
                      Önceki
                    </button>

                    <button
                      type="button"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() =>
                        setPage((value) =>
                          Math.min(pagination.totalPages, value + 1)
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold !text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sonraki
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function PreferenceGroup({
  title,
  description,
  count,
  className,
  children,
}: {
  title: string;
  description: string;
  count: number;
  className: string;
  children: React.ReactNode;
}) {
  if (count === 0) {
    return null;
  }

  return (
    <section>
      <div
        className={`mb-4 rounded-2xl border px-4 py-4 sm:px-5 ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black sm:text-xl">
            {title}
          </h2>

          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black">
            {count} program
          </span>
        </div>

        <p className="mt-1 text-sm font-semibold leading-6 opacity-80">
          {description}
        </p>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

function ProgramCard({
  program,
  studentRanking,
  onOpenProgram,
}: {
  program: Program;
  studentRanking: number;
  onOpenProgram: () => void;
}) {
  const evaluation = getEvaluation(studentRanking, program.latestRanking);
  const years = Object.keys(program.history)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <article
      id={`program-${program.code}`}
      data-program-code={program.code}
      className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-red-200 hover:shadow-lg sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge>{program.scoreType || "Belirsiz"}</Badge>
            <Badge>{program.level}</Badge>
            <Badge>{program.universityType}</Badge>

            {program.duration && <Badge>{program.duration} yıllık</Badge>}

            {program.scholarship && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                {program.scholarship}
              </span>
            )}
          </div>

          <h2 className="text-xl font-black tracking-tight sm:text-2xl">
            {program.programName}
          </h2>

          <p className="mt-2 flex items-start gap-2 font-semibold text-slate-600">
            <Building2 size={17} className="mt-1 shrink-0 text-red-600" />
            {program.universityName}
          </p>

          {program.academicUnit && (
            <p className="mt-2 text-sm text-slate-500">
              {program.academicUnit} · {program.language}
            </p>
          )}
        </div>

        <FavoriteButton
          compact
          program={{
            code: program.code,
            programName: program.programName,
            universityName: program.universityName,
            scoreType: program.scoreType,
            latestRanking: program.latestRanking,
          }}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox
          label={`${program.latestResultYear ?? "Son"} başarı sırası`}
          value={
            program.latestRanking !== null
              ? format(program.latestRanking)
              : "Dolmadı"
          }
        />

        <StatBox
          label="Taban puan"
          value={
            program.latestBaseScore !== null
              ? program.latestBaseScore.toFixed(5)
              : "Yok"
          }
        />

        <StatBox
          label="Kontenjan"
          value={
            program.latestQuota !== null ? String(program.latestQuota) : "Yok"
          }
        />

        <StatBox
          label="Veri yılı"
          value={years.length ? years.join(" · ") : "Yok"}
        />
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {studentRanking > 0 && (
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-black ${evaluation.className}`}
            >
              {evaluation.label}
            </span>
          )}

          <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
            Program kodu: {program.code}
          </span>
        </div>

        <Link
          href={`/programlar/${program.code}`}
          onClick={onOpenProgram}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold !text-white transition hover:bg-red-600 hover:!text-white"
        >
          Programı incele
          <ChevronRight size={17} />
        </Link>
      </div>
    </article>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {children}
    </span>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-words text-lg font-black">{value}</p>
    </div>
  );
}

function getEvaluation(
  studentRanking: number,
  programRanking: number | null
) {
  if (!studentRanking || programRanking === null) {
    return {
      label: "",
      className: "",
    };
  }

  const differenceRatio =
    (programRanking - studentRanking) / studentRanking;

  if (differenceRatio >= 0.25) {
    return {
      label: "Güvenli tercih",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  if (differenceRatio >= -0.1) {
    return {
      label: "Sıralamana yakın",
      className: "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "Zor tercih",
    className: "bg-rose-100 text-rose-700",
  };
}

function getLatestRanking(program: Program) {
  const rows = Object.entries(program.history)
    .map(([year, item]) => ({
      year: Number(year),
      ranking: item.ranking,
    }))
    .filter(
      (
        item
      ): item is {
        year: number;
        ranking: number;
      } => item.ranking !== null
    )
    .sort((a, b) => b.year - a.year);

  return (
    rows[0] ?? {
      year: null,
      ranking: null,
    }
  );
}

function groupProgramsByPreference(
  programs: Program[],
  studentRanking: number
) {
  const difficult: Program[] = [];
  const near: Program[] = [];
  const safe: Program[] = [];
  const unranked: Program[] = [];

  for (const program of programs) {
    const programRanking =
      program.latestRanking;

    if (programRanking === null) {
      unranked.push(program);
      continue;
    }

    const differenceRatio =
      (programRanking - studentRanking) /
      studentRanking;

    /*
     * Program sırası öğrenciden en az %10 daha iyiyse:
     * Zor tercih.
     */
    if (differenceRatio < -0.1) {
      difficult.push(program);
      continue;
    }

    /*
     * Öğrenci sırasının %10 önü ile %25 gerisi:
     * Sıralamaya yakın.
     */
    if (differenceRatio < 0.25) {
      near.push(program);
      continue;
    }

    /*
     * Öğrenciden %25 veya daha geride kapatmışsa:
     * Daha güvenli tercih.
     */
    safe.push(program);
  }

  const sortByRanking = (
    first: Program,
    second: Program
  ) =>
    (first.latestRanking ??
      Number.MAX_SAFE_INTEGER) -
    (second.latestRanking ??
      Number.MAX_SAFE_INTEGER);

  difficult.sort(sortByRanking);
  near.sort(sortByRanking);
  safe.sort(sortByRanking);

  return {
    difficult,
    near,
    safe,
    unranked,
  };
}

function format(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value);
}
