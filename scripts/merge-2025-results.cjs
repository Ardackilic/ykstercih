const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const ROOT = process.cwd();
const PROGRAMS_FILE = path.join(ROOT, "src", "data", "programs.json");

const sources = [
  {
    file: path.join(
      ROOT,
      "data",
      "osym",
      "results",
      "2025",
      "tablo3_ykd25082025.xlsx"
    ),
    level: "Ön Lisans",
    duration: 2,
  },
  {
    file: path.join(
      ROOT,
      "data",
      "osym",
      "results",
      "2025",
      "tablo4_ykd25082025.xlsx"
    ),
    level: "Lisans",
    duration: 4,
  },
];

function clean(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nullableNumber(value) {
  const text = clean(value);

  if (!text || text === "--" || text === "-" || text === "—") {
    return null;
  }

  const number = Number(text.replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function nullableInteger(value) {
  const number = nullableNumber(value);
  return number === null ? null : Math.trunc(number);
}

function normalizeUniversityType(value) {
  const type = clean(value).toLocaleUpperCase("tr-TR");

  if (type.includes("DEVLET")) return "Devlet";
  if (type.includes("VAKIF")) return "Vakıf";
  if (type.includes("KKTC")) return "KKTC";
  if (type.includes("YURT DIŞI")) return "Yurt Dışı";

  return "Diğer";
}

function detectLanguage(name) {
  const value = clean(name);

  const match = value.match(
    /\((İngilizce|Almanca|Fransızca|Arapça|Rusça)\)/i
  );

  return match ? match[1] : "Türkçe";
}

function detectScholarship(name) {
  const value = clean(name);

  if (/\(Burslu\)/i.test(value)) return "Burslu";
  if (/%50 İndirimli/i.test(value)) return "%50 İndirimli";
  if (/%25 İndirimli/i.test(value)) return "%25 İndirimli";
  if (/%75 İndirimli/i.test(value)) return "%75 İndirimli";
  if (/Ücretli/i.test(value)) return "Ücretli";

  return null;
}

function readResults(source) {
  if (!fs.existsSync(source.file)) {
    throw new Error(`Dosya bulunamadı: ${source.file}`);
  }

  const workbook = XLSX.readFile(source.file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  return rows.slice(3).flatMap((row) => {
    const code = clean(row[0]);

    if (!/^\d{8,10}$/.test(code)) {
      return [];
    }

    return [
      {
        code,
        universityType: normalizeUniversityType(row[1]),
        universityName: clean(row[2]),
        academicUnit: clean(row[3]) || null,
        programName: clean(row[4]),
        scoreType: clean(row[5]).replace("SOZ", "SÖZ"),
        generalQuota: nullableInteger(row[6]),
        placed: nullableInteger(row[7]),
        baseScore: nullableNumber(row[8]),
        highestScore: nullableNumber(row[9]),
        level: source.level,
        duration: source.duration,
      },
    ];
  });
}

if (!fs.existsSync(PROGRAMS_FILE)) {
  throw new Error(`Program verisi bulunamadı: ${PROGRAMS_FILE}`);
}

const data = JSON.parse(fs.readFileSync(PROGRAMS_FILE, "utf8"));
const programs = data.programs ?? [];
const programsByCode = new Map(programs.map((program) => [program.code, program]));

let matched = 0;
let added = 0;

for (const source of sources) {
  const results = readResults(source);

  console.log(
    `${path.basename(source.file)}: ${results.length} sonuç satırı okundu.`
  );

  for (const result of results) {
    let program = programsByCode.get(result.code);

    if (!program) {
      program = {
        code: result.code,
        programName: result.programName,
        universityName: result.universityName,
        universityType: result.universityType,
        academicUnit: result.academicUnit,
        level: result.level,
        duration: result.duration,
        scoreType: result.scoreType,
        language: detectLanguage(result.programName),
        scholarship: detectScholarship(result.programName),
        specialStatuses: [],
        latestGuideYear: 2025,
        history: {},
      };

      programsByCode.set(result.code, program);
      added += 1;
    } else {
      matched += 1;

      program.programName = result.programName || program.programName;
      program.universityName =
        result.universityName || program.universityName;
      program.universityType =
        result.universityType || program.universityType;
      program.academicUnit =
        result.academicUnit || program.academicUnit;
      program.level = result.level || program.level;
      program.duration = program.duration ?? result.duration;
      program.scoreType = result.scoreType || program.scoreType;
      program.latestGuideYear = Math.max(
        Number(program.latestGuideYear || 0),
        2025
      );
    }

    program.history = program.history ?? {};

    const previousGuideData =
      program.history["2024"] ??
      program.history[2024] ??
      {};

    program.history["2025"] = {
      guideYear: 2025,
      ranking: null,
      baseScore: result.baseScore,
      highestScore: result.highestScore,
      generalQuota: result.generalQuota,
      placed: result.placed,
      schoolFirstQuota:
        previousGuideData.schoolFirstQuota ?? null,
      conditions: previousGuideData.conditions ?? null,
    };
  }
}

const mergedPrograms = Array.from(programsByCode.values())
  .map((program) => {
    const resultYears = Object.keys(program.history ?? {})
      .map(Number)
      .filter((year) => {
        const item = program.history[String(year)];

        return (
          item &&
          (item.baseScore !== null ||
            item.ranking !== null ||
            item.generalQuota !== null ||
            item.placed !== null)
        );
      })
      .sort((a, b) => b - a);

    const latestResultYear = resultYears[0] ?? null;
    const latestResult =
      latestResultYear !== null
        ? program.history[String(latestResultYear)]
        : null;

    return {
      ...program,
      latestResultYear,
      latestRanking: latestResult?.ranking ?? null,
      latestBaseScore: latestResult?.baseScore ?? null,
    };
  })
  .sort((a, b) => {
    const universityComparison = a.universityName.localeCompare(
      b.universityName,
      "tr"
    );

    if (universityComparison !== 0) {
      return universityComparison;
    }

    return a.programName.localeCompare(b.programName, "tr");
  });

const universityCount = new Set(
  mergedPrograms.map((program) => program.universityName)
).size;

data.metadata = {
  ...(data.metadata ?? {}),
  generatedAt: new Date().toISOString(),
  programCount: mergedPrograms.length,
  universityCount,
  resultYears: [2022, 2023, 2024, 2025],
  guideYears: [2023, 2024, 2025],
};

data.programs = mergedPrograms;

fs.copyFileSync(
  PROGRAMS_FILE,
  PROGRAMS_FILE.replace(".json", ".before-2025-results.json")
);

fs.writeFileSync(
  PROGRAMS_FILE,
  JSON.stringify(data, null, 2),
  "utf8"
);

console.log("");
console.log(`Eşleşen program: ${matched}`);
console.log(`Yeni eklenen program: ${added}`);
console.log(`Toplam program: ${mergedPrograms.length}`);
console.log("2025 sonuçları programs.json dosyasına eklendi.");
