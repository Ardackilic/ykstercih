const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");
const OUTPUT_DIR = path.join(process.cwd(), "src", "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "programs.json");

const sources = [
  {
    file: "tablo3_2023.xls",
    guideYear: 2023,
    resultYear: 2022,
    level: "Ön Lisans",
    rankingIndex: 10,
    scoreIndex: 11,
    conditionsIndex: 9,
  },
  {
    file: "tablo4_2023.xls",
    guideYear: 2023,
    resultYear: 2022,
    level: "Lisans",
    rankingIndex: 11,
    scoreIndex: 12,
    conditionsIndex: 10,
  },
  {
    file: "tablo3_2024.xls",
    guideYear: 2024,
    resultYear: 2023,
    level: "Ön Lisans",
    rankingIndex: 10,
    scoreIndex: 11,
    conditionsIndex: 9,
  },
  {
    file: "tablo4_2024.xls",
    guideYear: 2024,
    resultYear: 2023,
    level: "Lisans",
    rankingIndex: 11,
    scoreIndex: 12,
    conditionsIndex: 10,
  },
  {
    file: "tablo3_2025.xls",
    guideYear: 2025,
    resultYear: 2024,
    level: "Ön Lisans",
    rankingIndex: 10,
    scoreIndex: 11,
    conditionsIndex: 9,
  },
  {
    file: "tablo4_2025.xls",
    guideYear: 2025,
    resultYear: 2024,
    level: "Lisans",
    rankingIndex: 11,
    scoreIndex: 12,
    conditionsIndex: 10,
  },
];

function clean(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nullableNumber(value) {
  let text = clean(value);

  if (
    !text ||
    text === "..." ||
    text === "----" ||
    text === "-" ||
    text === "—"
  ) {
    return null;
  }

  // Türkçe ondalık virgülü destekle.
  if (text.includes(",") && !text.includes(".")) {
    text = text.replace(",", ".");
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function integer(value) {
  const parsed = nullableNumber(value);
  return parsed === null ? null : Math.trunc(parsed);
}

function detectUniversityType(name) {
  const normalized = name.toLocaleLowerCase("tr-TR");

  if (normalized.includes("devlet üniversitesi")) return "Devlet";
  if (normalized.includes("vakıf üniversitesi")) return "Vakıf";
  if (normalized.includes("kktc")) return "KKTC";
  if (normalized.includes("yurt dışı")) return "Yurt Dışı";

  return "Diğer";
}

function cleanUniversityName(name) {
  return clean(name)
    .replace(/\s*\(Devlet Üniversitesi\)\s*/gi, "")
    .replace(/\s*\(Vakıf Üniversitesi\)\s*/gi, "")
    .trim();
}

function detectScholarship(programName) {
  const name = programName.toLocaleLowerCase("tr-TR");

  if (name.includes("tam burslu") || name.includes("(burslu)")) {
    return "Tam Burslu";
  }

  if (name.includes("%50 indirimli") || name.includes("%50 burslu")) {
    return "%50 İndirimli";
  }

  if (name.includes("%25 indirimli") || name.includes("%25 burslu")) {
    return "%25 İndirimli";
  }

  if (name.includes("ücretli")) {
    return "Ücretli";
  }

  return null;
}

function detectLanguage(programName) {
  const match = programName.match(
    /\((İngilizce|Almanca|Fransızca|Arapça|Rusça)\)/i
  );

  return match ? match[1] : "Türkçe";
}

function detectSpecialStatus(programName) {
  const statuses = [];

  if (/KKTC Uyruklu/i.test(programName)) statuses.push("KKTC Uyruklu");
  if (/Okul Birincisi/i.test(programName)) statuses.push("Okul Birincisi");
  if (/Şehit|Gazi/i.test(programName)) statuses.push("Şehit/Gazi Yakını");
  if (/34 Yaş/i.test(programName)) statuses.push("34 Yaş Üstü Kadın");
  if (/Depremzede/i.test(programName)) statuses.push("Depremzede");

  return statuses;
}

function readSource(source) {
  const filePath = path.join(DATA_DIR, source.file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Dosya bulunamadı: ${source.file}`);
  }

  const workbook = XLSX.readFile(filePath);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(firstSheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  let currentUniversity = "";
  let currentUniversityType = "Diğer";
  let currentUnit = "";

  const results = [];

  for (const row of rows.slice(3)) {
    const code = clean(row[0]);
    const name = clean(row[1]);

    if (!code && !name) continue;

    if (!code && /ÜNİVERSİTESİ/i.test(name)) {
      currentUniversity = cleanUniversityName(name);
      currentUniversityType = detectUniversityType(name);
      currentUnit = "";
      continue;
    }

    if (!code && name) {
      currentUnit = name;
      continue;
    }

    if (!/^\d{8,10}$/.test(code)) continue;

    const duration = integer(row[2]);
    const scoreType = clean(row[3]).replace("SOZ", "SÖZ");
    const generalQuota = integer(row[4]);
    const schoolFirstQuota = integer(row[5]);
    const ranking = integer(row[source.rankingIndex]);
    const baseScore = nullableNumber(row[source.scoreIndex]);
    const conditions = clean(row[source.conditionsIndex]);

    results.push({
      code,
      programName: name,
      universityName: currentUniversity || "Bilinmeyen Üniversite",
      universityType: currentUniversityType,
      academicUnit: currentUnit || null,
      level: source.level,
      duration,
      scoreType,
      language: detectLanguage(name),
      scholarship: detectScholarship(name),
      specialStatuses: detectSpecialStatus(name),
      latestGuideYear: source.guideYear,
      history: {
        [source.resultYear]: {
          guideYear: source.guideYear,
          ranking,
          baseScore,
          generalQuota,
          schoolFirstQuota,
          conditions: conditions || null,
        },
      },
    });
  }

  return results;
}

const programsByCode = new Map();

for (const source of sources) {
  console.log(`Okunuyor: ${source.file}`);

  const sourcePrograms = readSource(source);

  for (const program of sourcePrograms) {
    const existing = programsByCode.get(program.code);

    if (!existing) {
      programsByCode.set(program.code, program);
      continue;
    }

    existing.history = {
      ...existing.history,
      ...program.history,
    };

    if (program.latestGuideYear >= existing.latestGuideYear) {
      existing.programName = program.programName;
      existing.universityName = program.universityName;
      existing.universityType = program.universityType;
      existing.academicUnit = program.academicUnit;
      existing.level = program.level;
      existing.duration = program.duration;
      existing.scoreType = program.scoreType;
      existing.language = program.language;
      existing.scholarship = program.scholarship;
      existing.specialStatuses = program.specialStatuses;
      existing.latestGuideYear = program.latestGuideYear;
    }
  }

  console.log(`  ${sourcePrograms.length} program satırı okundu.`);
}

const programs = Array.from(programsByCode.values())
  .map((program) => {
    const years = Object.keys(program.history)
      .map(Number)
      .sort((a, b) => b - a);

    const latestResultYear = years.find((year) => {
      const item = program.history[year];
      return item.ranking !== null || item.baseScore !== null;
    });

    return {
      ...program,
      latestResultYear: latestResultYear ?? null,
      latestRanking:
        latestResultYear !== undefined
          ? program.history[latestResultYear].ranking
          : null,
      latestBaseScore:
        latestResultYear !== undefined
          ? program.history[latestResultYear].baseScore
          : null,
    };
  })
  .sort((a, b) => {
    const universityComparison = a.universityName.localeCompare(
      b.universityName,
      "tr"
    );

    if (universityComparison !== 0) return universityComparison;

    return a.programName.localeCompare(b.programName, "tr");
  });

const universities = new Set(
  programs.map((program) => program.universityName)
);

const statistics = {
  generatedAt: new Date().toISOString(),
  programCount: programs.length,
  universityCount: universities.size,
  resultYears: [2022, 2023, 2024],
  guideYears: [2023, 2024, 2025],
  byLevel: {
    onLisans: programs.filter((program) => program.level === "Ön Lisans")
      .length,
    lisans: programs.filter((program) => program.level === "Lisans").length,
  },
  byUniversityType: programs.reduce((acc, program) => {
    acc[program.universityType] =
      (acc[program.universityType] || 0) + 1;

    return acc;
  }, {}),
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(
    {
      metadata: statistics,
      programs,
    },
    null,
    2
  ),
  "utf8"
);

console.log("\n========================================");
console.log("AKTARIM TAMAMLANDI");
console.log("Program sayısı:", statistics.programCount);
console.log("Üniversite sayısı:", statistics.universityCount);
console.log("Ön lisans:", statistics.byLevel.onLisans);
console.log("Lisans:", statistics.byLevel.lisans);
console.log("Çıktı:", OUTPUT_FILE);
console.log("========================================");
