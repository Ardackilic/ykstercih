import { NextRequest, NextResponse } from "next/server";
import data from "@/data/programs.json";

type Program = {
  code: string;
  programName: string;
  universityName: string;
  universityType: string;
  level: string;
  scoreType: string;
  latestRanking: number | null;
};

const programs = data.programs as Program[];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = normalize(params.get("q") ?? "");
  const type = params.get("tur") ?? "";

  const universityMap = new Map<
    string,
    {
      name: string;
      type: string;
      programCount: number;
      lisansCount: number;
      onLisansCount: number;
      scoreTypes: Set<string>;
      bestRanking: number | null;
    }
  >();

  for (const program of programs) {
    const existing = universityMap.get(program.universityName);

    if (!existing) {
      universityMap.set(program.universityName, {
        name: program.universityName,
        type: program.universityType,
        programCount: 1,
        lisansCount: program.level === "Lisans" ? 1 : 0,
        onLisansCount: program.level === "Ön Lisans" ? 1 : 0,
        scoreTypes: new Set(program.scoreType ? [program.scoreType] : []),
        bestRanking: program.latestRanking,
      });

      continue;
    }

    existing.programCount += 1;

    if (program.level === "Lisans") existing.lisansCount += 1;
    if (program.level === "Ön Lisans") existing.onLisansCount += 1;
    if (program.scoreType) existing.scoreTypes.add(program.scoreType);

    if (
      program.latestRanking !== null &&
      (existing.bestRanking === null ||
        program.latestRanking < existing.bestRanking)
    ) {
      existing.bestRanking = program.latestRanking;
    }
  }

  const results = Array.from(universityMap.values())
    .filter((university) => {
      if (type && university.type !== type) return false;

      if (query && !normalize(university.name).includes(query)) {
        return false;
      }

      return true;
    })
    .map((university) => ({
      ...university,
      scoreTypes: Array.from(university.scoreTypes),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  return NextResponse.json({
    results,
    total: results.length,
  });
}
