"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  LoaderCircle,
  Search,
} from "lucide-react";

const scoreTypes = ["TYT", "SAY", "EA", "SÖZ", "DİL"];

type SearchMode = "ranking" | "name";

type SearchSuggestion = {
  code: string;
  programName: string;
  universityName: string;
  academicUnit: string | null;
  scoreType: string;
  level: string;
  latestRanking: number | null;
};

type ApiResponse = {
  results: SearchSuggestion[];
};

export default function RankingSearchForm() {
  const router = useRouter();
  const searchAreaRef = useRef<HTMLDivElement>(null);

  const [searchMode, setSearchMode] = useState<SearchMode>("ranking");
  const [scoreType, setScoreType] = useState("TYT");
  const [ranking, setRanking] = useState("");
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchAreaRef.current &&
        !searchAreaRef.current.contains(event.target as Node)
      ) {
        setSuggestionsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchMode !== "name") {
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSearchLoading(false);
      return;
    }

    const cleanedText = searchText.trim();

    if (cleanedText.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      try {
        setSearchLoading(true);

        const params = new URLSearchParams({
          q: cleanedText,
          limit: "8",
        });

        const response = await fetch(`/api/programlar?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Arama sonuçları alınamadı.");
        }

        const data: ApiResponse = await response.json();

        setSuggestions(data.results);
        setSuggestionsOpen(true);
        setActiveIndex(-1);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setSuggestions([]);
          setSuggestionsOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 220);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [searchText, searchMode]);

  function handleRankingChange(value: string) {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, 7);

    setRanking(onlyNumbers);
    setError("");
  }

  function openProgram(programCode: string) {
    setSuggestionsOpen(false);
    setActiveIndex(-1);
    router.push(`/programlar/${programCode}`);
  }

  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (!suggestionsOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((current) =>
        current >= suggestions.length - 1 ? 0 : current + 1
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1
      );
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();

      const selectedProgram = suggestions[activeIndex];

      if (selectedProgram) {
        openProgram(selectedProgram.code);
      }
    }

    if (event.key === "Escape") {
      setSuggestionsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (searchMode === "ranking") {
      const rankingNumber = Number(ranking);

      if (!ranking || rankingNumber < 1) {
        setError("Geçerli bir başarı sırası yazmalısın.");
        return;
      }

      router.push(
        `/programlar?puanTuru=${encodeURIComponent(
          scoreType
        )}&siralama=${rankingNumber}`
      );

      return;
    }

    const cleanedSearchText = searchText.trim();

    if (cleanedSearchText.length < 2) {
      setError("En az 2 harf yazarak arama yapmalısın.");
      return;
    }

    setSuggestionsOpen(false);

    router.push(`/programlar?q=${encodeURIComponent(cleanedSearchText)}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => {
              setSearchMode("ranking");
              setSuggestionsOpen(false);
              setError("");
            }}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition ${
              searchMode === "ranking"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap size={18} />
            Sıralamaya göre
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchMode("name");
              setError("");
            }}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition ${
              searchMode === "name"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 size={18} />
            Bölüm veya üniversite ara
          </button>
        </div>

        {searchMode === "ranking" ? (
          <>
            <div>
              <p className="mb-3 text-sm font-black text-slate-700">
                Puan türünü seç
              </p>

              <div className="grid grid-cols-5 gap-2">
                {scoreTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setScoreType(type)}
                    className={`h-12 rounded-xl border text-sm font-black transition ${
                      scoreType === type
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="ranking"
                className="mb-3 block text-sm font-black text-slate-700"
              >
                {scoreType} başarı sıralaman
              </label>

              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="ranking"
                  value={
                    ranking
                      ? new Intl.NumberFormat("tr-TR").format(Number(ranking))
                      : ""
                  }
                  onChange={(event) =>
                    handleRankingChange(event.target.value)
                  }
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Örnek: 85.000"
                  aria-invalid={Boolean(error)}
                  className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-4 text-lg font-bold outline-none transition ${
                    error
                      ? "border-rose-400"
                      : "border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Puanını değil, ÖSYM sonucundaki başarı sıranı yaz.
              </p>
            </div>
          </>
        ) : (
          <div ref={searchAreaRef} className="relative">
            <label
              htmlFor="program-search"
              className="mb-3 block text-sm font-black text-slate-700"
            >
              Bölüm, üniversite veya fakülte adı
            </label>

            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="program-search"
                type="search"
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.target.value);
                  setSuggestionsOpen(true);
                  setError("");
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setSuggestionsOpen(true);
                  }
                }}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
                placeholder="Bilgisayar Mühendisliği, ODTÜ, Tıp..."
                aria-invalid={Boolean(error)}
                className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-12 text-base font-bold outline-none transition ${
                  error
                    ? "border-rose-400"
                    : "border-slate-200 focus:border-indigo-500"
                }`}
              />

              {searchLoading && (
                <LoaderCircle
                  size={20}
                  className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-indigo-600"
                />
              )}
            </div>

            {suggestionsOpen && searchText.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-300/60">
                {!searchLoading && suggestions.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <Search
                      size={26}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 text-sm font-bold text-slate-600">
                      Eşleşen program bulunamadı
                    </p>
                  </div>
                ) : (
                  suggestions.map((program, index) => (
                    <button
                      key={program.code}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => openProgram(program.code)}
                      className={`flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition ${
                        activeIndex === index
                          ? "bg-indigo-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <GraduationCap size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black text-slate-900">
                          {program.programName}
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-600">
                          {program.universityName}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                            {program.scoreType}
                          </span>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                            {program.level}
                          </span>

                          {program.latestRanking !== null && (
                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
                              Sıra:{" "}
                              {new Intl.NumberFormat("tr-TR").format(
                                program.latestRanking
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}

                {suggestions.length > 0 && (
                  <button
                    type="submit"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black !text-white transition hover:bg-indigo-600"
                  >
                    Tüm sonuçları göster
                    <ArrowRight size={17} />
                  </button>
                )}
              </div>
            )}

            <p className="mt-2 text-xs leading-5 text-slate-500">
              En az 2 harf yazdığında eşleşen programlar anında gösterilir.
            </p>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
            {error}
          </p>
        )}

        {searchMode === "ranking" && (
          <button
            type="submit"
            disabled={!ranking}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-7 font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {scoreType} bölümlerini bul
            <ArrowRight size={19} />
          </button>
        )}
      </div>
    </form>
  );
}
