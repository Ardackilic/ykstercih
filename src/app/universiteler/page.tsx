"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  GraduationCap,
  Search,
} from "lucide-react";

type University = {
  name: string;
  type: string;
  programCount: number;
  lisansCount: number;
  onLisansCount: number;
  scoreTypes: string[];
  bestRanking: number | null;
};

type ApiResponse = {
  results: University[];
  total: number;
};

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUniversities() {
      setLoading(true);

      const params = new URLSearchParams();

      if (query.trim()) params.set("q", query.trim());
      if (type) params.set("tur", type);

      const response = await fetch(
        `/api/universiteler?${params.toString()}`,
        {
          signal: controller.signal,
        }
      );

      const data: ApiResponse = await response.json();

      setUniversities(data.results);
      setLoading(false);
    }

    const timeout = setTimeout(loadUniversities, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, type]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 !text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="font-black">TercihPusula</p>
              <p className="text-xs text-slate-500">Üniversiteler</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
          >
            <ArrowLeft size={17} />
            Ana sayfa
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="rounded-[32px] bg-gradient-to-br from-indigo-600 to-violet-600 p-7 text-white shadow-xl sm:p-10">
          <p className="font-black text-indigo-100">
            Türkiye’deki üniversiteler
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-5xl">
            Üniversiteleri keşfet
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-indigo-100">
            Devlet ve vakıf üniversitelerini program sayılarına,
            puan türlerine ve başarı sıralamalarına göre incele.
          </p>
        </div>

        <div className="mt-7 grid gap-4 rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Üniversite adı ara"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="filter-input"
          >
            <option value="">Tüm üniversiteler</option>
            <option value="Devlet">Devlet</option>
            <option value="Vakıf">Vakıf</option>
            <option value="KKTC">KKTC</option>
            <option value="Yurt Dışı">Yurt Dışı</option>
          </select>
        </div>

        {loading ? (
          <div className="mt-7 rounded-3xl bg-white p-14 text-center">
            Üniversiteler yükleniyor...
          </div>
        ) : (
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {universities.map((university) => (
              <article
                key={university.name}
                className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Building2 size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="soft-badge">
                        {university.type}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                        {university.programCount} program
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-black leading-7">
                      {university.name}
                    </h2>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <Stat
                    label="Lisans"
                    value={university.lisansCount}
                  />

                  <Stat
                    label="Ön lisans"
                    value={university.onLisansCount}
                  />

                  <Stat
                    label="En iyi sıra"
                    value={
                      university.bestRanking !== null
                        ? new Intl.NumberFormat("tr-TR").format(
                            university.bestRanking
                          )
                        : "—"
                    }
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {university.scoreTypes.map((scoreType) => (
                    <span
                      key={scoreType}
                      className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700"
                    >
                      {scoreType}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/universiteler/${encodeURIComponent(
                    university.name
                  )}`}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black !text-white hover:bg-indigo-600"
                >
                  Üniversiteyi incele
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

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-lg font-black">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}
