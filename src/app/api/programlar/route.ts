import { NextRequest, NextResponse } from "next/server";
import data from "@/data/programs.json";

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
  history: Record<string, HistoryItem>;
};

const programs = data.programs as Program[];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

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

  return normalized;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const query = normalize(params.get("q") ?? "");
  const scoreType = normalizeScoreType(
    params.get("puanTuru") ?? ""
  );
  const universityType = params.get("universiteTuru") ?? "";
  const level = params.get("seviye") ?? "";
  const ranking = Number(params.get("siralama") ?? 0);
  const page = Math.max(1, Number(params.get("sayfa") ?? 1));
  const limit = Math.min(
    50,
    Math.max(10, Number(params.get("limit") ?? 20))
  );

  let filtered = programs.filter((program) => {
    if (scoreType && program.scoreType !== scoreType) return false;

    if (
      universityType &&
      program.universityType !== universityType
    ) {
      return false;
    }

    if (level && program.level !== level) return false;

    if (query) {
      const searchable = normalize(
        `${program.programName} ${program.universityName} ${
          program.academicUnit ?? ""
        }`
      );

      if (!searchable.includes(query)) return false;
    }

    return true;
  });

  filtered.sort((a, b) => {
    if (ranking > 0) {
      const aRanking = a.latestRanking ?? Number.MAX_SAFE_INTEGER;
      const bRanking = b.latestRanking ?? Number.MAX_SAFE_INTEGER;

      return (
        Math.abs(aRanking - ranking) -
        Math.abs(bRanking - ranking)
      );
    }

    const aRanking = a.latestRanking ?? Number.MAX_SAFE_INTEGER;
    const bRanking = b.latestRanking ?? Number.MAX_SAFE_INTEGER;

    return aRanking - bRanking;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;

  const results = filtered.slice(start, start + limit).map((program) => ({
    code: program.code,
    programName: program.programName,
    universityName: program.universityName,
    universityType: program.universityType,
    academicUnit: program.academicUnit,
    level: program.level,
    duration: program.duration,
    scoreType: program.scoreType,
    language: program.language,
    scholarship: program.scholarship,
    latestResultYear: program.latestResultYear,
    latestRanking: program.latestRanking,
    latestBaseScore: program.latestBaseScore,
    latestQuota:
      program.latestResultYear !== null
        ? program.history[String(program.latestResultYear)]?.generalQuota ?? null
        : null,
    history: program.history,
  }));

  return NextResponse.json({
    results,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  });
}
