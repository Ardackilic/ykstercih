const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const ROOT = process.cwd();
const PROGRAMS_FILE = path.join(ROOT, "src", "data", "programs.json");
const BACKUP_FILE = path.join(
  ROOT,
  "src",
  "data",
  `programs-backup-${Date.now()}.json`
);

const RESULT_FILES = [
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

  if (
    !text ||
    text === "--" ||
    text === "-" ||
    text === "—" ||
    text === "..."
  ) {
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
  const text = clean(value).toLocaleUpperCase("tr-TR");

  if (text.includes("DEVLET")) return "Devlet";
  if (text.includes("VAKIF")) return "Vakıf";
  if (text.includes("KKTC")) return "KKTC";
  if (text.includes("YURT DIŞI")) return "Yurt Dışı";

  return "Diğer";
}

function detectLanguage(name) {
  const text = clean(name);

  const match = text.match(
    /\((İngilizce|Almanca|Fransızca|Arapça|Rusça)\)/i
  );

  return match ? match[1] : "Türkçe";
}

function detectScholarship(name) {
  const text = clean(name);

  if (/\(Burslu\)/i.test(text)) return "Burslu";
  if (/%75 İndirimli/i.test(text)) return "%75 İndirimli";
  if (/%50 İndirimli/i.test(text)) return "%50 İndirimli";
  if (/%25 İndirimli/i.test(text)) return "%25 İndirimli";
  if (/\(Ücretli\)/i.test(text)) return "Ücretli";

  return null;
}

function detectSpecialStatuses(name) {
  const statuses = [];
  const text = clean(name);

  if (/Okul Birincisi/i.test(text)) statuses.push("Okul Birincisi");
  if (/Şehit|Gazi/i.test(text)) statuses.push("Şehit/Gazi Yakını");
  if (/34 Yaş/i.test(text)) statuses.push("34 Yaş Üstü Kadın");
  if (/Depremzede/i.test(text)) statuses.push("Depremzede");

  return statuses;
}

function read2025Results(source) {
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

  const results = [];

  for (const row of rows.slice(3)) {
    const code = clean(row[0]);

    if (!/^\d{8,10}$/.test(code)) {
      continue;
    }

    const universityType = normalizeUniversityType(row[1]);
    const universityName = clean(row[2]);
    const academicUnit = clean(row[3]) || null;
    const programName = clean(row[4]);
    const scoreType = clean(row[5]).replace("SOZ", "SÖZ");

    if (!universityName || !programName) {
      continue;
    }

    results.push({
      code,
      programName,
      universityName,
      universityType,
      academicUnit,
      level: source.level,
      duration: source.duration,
      scoreType,
      language: detectLanguage(programName),
      scholarship: detectScholarship(programName),
      specialStatuses: detectSpecialStatuses(programName),
      latestGuideYear: 2025,
      history: {
        "2025": {
          guideYear: 2025,
          ranking: null,
          baseScore: nullableNumber(row[8]),
          highestScore: nullableNumber(row[9]),
          generalQuota: nullableInteger(row[6]),
          placed: nullableInteger(row[7]),
          schoolFirstQuota: nullableInteger(row[10]),
          schoolFirstPlaced: nullableInteger(row[11]),
          schoolFirstBaseScore: nullableNumber(row[12]),
          schoolFirstHighestScore: nullableNumber(row[13]),
          earthquakeQuota: nullableInteger(row[14]),
          earthquakePlaced: nullableInteger(row[15]),
          over34Quota: nullableInteger(row[18]),
          over34Placed: nullableInteger(row[19]),
          martyrVeteranQuota: nullableInteger(row[22]),
          martyrVeteranPlaced: nullableInteger(row[23]),
          conditions: null,
        },
      },
    });
  }

  return results;
}

let oldData = {
  metadata: {},
  programs: [],
};

if (fs.existsSync(PROGRAMS_FILE)) {
  fs.copyFileSync(PROGRAMS_FILE, BACKUP_FILE);
  oldData = JSON.parse(fs.readFileSync(PROGRAMS_FILE, "utf8"));
}

const oldProgramsByCode = new Map(
  (oldData.programs ?? []).map((program) => [
    String(program.code),
    program,
  ])
);

const newProgramsByCode = new Map();

for (const source of RESULT_FILES) {
  const programs = read2025Results(source);

  console.log(
    `${path.basename(source.file)}: ${programs.length} program okundu`
  );

  for (const program of programs) {
    const oldProgram = oldProgramsByCode.get(program.code);

    const oldHistory = oldProgram?.history ?? {};

    const safeOldHistory = Object.fromEntries(
      Object.entries(oldHistory).filter(([year]) => Number(year) < 2025)
    );

    const mergedProgram = {
      ...program,
      history: {
        ...safeOldHistory,
        ...program.history,
      },
      latestResultYear: 2025,
      latestRanking: null,
      latestBaseScore: program.history["2025"].baseScore,
      latestQuota: program.history["2025"].generalQuota,
      latestPlaced: program.history["2025"].placed,
      isActive2025: true,
    };

    newProgramsByCode.set(program.code, mergedProgram);
  }
}

const programs = Array.from(newProgramsByCode.values()).sort((a, b) => {
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
  programs.map((program) => program.universityName)
).size;

const byLevel = {
  onLisans: programs.filter(
    (program) => program.level === "Ön Lisans"
  ).length,
  lisans: programs.filter(
    (program) => program.level === "Lisans"
  ).length,
};

const byUniversityType = programs.reduce((acc, program) => {
  acc[program.universityType] =
    (acc[program.universityType] || 0) + 1;

  return acc;
}, {});

const output = {
  metadata: {
    generatedAt: new Date().toISOString(),
    programCount: programs.length,
    universityCount,
    resultYears: [2022, 2023, 2024, 2025],
    latestResultYear: 2025,
    latestGuideYear: 2025,
    byLevel,
    byUniversityType,
    source: "ÖSYM 2025 Merkezi Yerleştirme Tablo-3 ve Tablo-4",
  },
  programs,
};

fs.writeFileSync(
  PROGRAMS_FILE,
  JSON.stringify(output, null, 2),
  "utf8"
);

console.log("");
console.log(`Eski veri yedeği: ${BACKUP_FILE}`);
console.log(`Toplam güncel program: ${programs.length}`);
console.log(`Üniversite sayısı: ${universityCount}`);
console.log("2025 verisi sıfırdan oluşturuldu.");
