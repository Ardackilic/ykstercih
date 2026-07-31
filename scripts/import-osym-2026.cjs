const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const ROOT = process.cwd();

const PROGRAMS_FILE = path.join(
  ROOT,
  "src",
  "data",
  "programs.json"
);

const BACKUP_FILE = path.join(
  ROOT,
  "src",
  "data",
  `programs-before-2026-${Date.now()}.json`
);

const SOURCES = [
  {
    file: path.join(
      ROOT,
      "data",
      "osym",
      "2026",
      "tablo-3-29u1s7pl.xls"
    ),
    level: "Ön Lisans",
    rankingIndex: 9,
    scoreIndex: 10,
    conditionsIndex: 8,
  },
  {
    file: path.join(
      ROOT,
      "data",
      "osym",
      "2026",
      "tablo-4-hohu0j-30164357.xls"
    ),
    level: "Lisans",
    rankingIndex: 10,
    scoreIndex: 11,
    conditionsIndex: 9,
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
    text === "-" ||
    text === "--" ||
    text === "—" ||
    text === "..." ||
    text === "----"
  ) {
    return null;
  }

  text = text.replace(/\s/g, "");

  if (text.includes(",") && !text.includes(".")) {
    text = text.replace(",", ".");
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : null;
}

function nullableInteger(value) {
  const number = nullableNumber(value);

  return number === null ? null : Math.trunc(number);
}

function normalizeScoreType(value) {
  return clean(value)
    .replace(/^SOZ$/i, "SÖZ")
    .toLocaleUpperCase("tr-TR");
}

function detectUniversityType(value) {
  const text = clean(value).toLocaleUpperCase("tr-TR");

  if (text.includes("DEVLET ÜNİVERSİTESİ")) return "Devlet";
  if (text.includes("VAKIF ÜNİVERSİTESİ")) return "Vakıf";
  if (text.includes("KKTC")) return "KKTC";
  if (text.includes("YURT DIŞI")) return "Yurt Dışı";

  return "Diğer";
}

function cleanUniversityName(value) {
  return clean(value)
    .replace(/\s*\(Devlet Üniversitesi\)\s*/gi, "")
    .replace(/\s*\(Vakıf Üniversitesi\)\s*/gi, "")
    .trim();
}

function detectLanguage(name) {
  const match = clean(name).match(
    /\((İngilizce|Almanca|Fransızca|Arapça|Rusça)\)/i
  );

  return match ? match[1] : "Türkçe";
}

function detectScholarship(name) {
  const text = clean(name);

  if (/\(Burslu\)|Tam Burslu/i.test(text)) {
    return "Burslu";
  }

  if (/%75\s*(İndirimli|Burslu)/i.test(text)) {
    return "%75 İndirimli";
  }

  if (/%50\s*(İndirimli|Burslu)/i.test(text)) {
    return "%50 İndirimli";
  }

  if (/%25\s*(İndirimli|Burslu)/i.test(text)) {
    return "%25 İndirimli";
  }

  if (/Ücretli/i.test(text)) {
    return "Ücretli";
  }

  return null;
}

function detectSpecialStatuses(name) {
  const statuses = [];
  const text = clean(name);

  if (/KKTC Uyruklu/i.test(text)) {
    statuses.push("KKTC Uyruklu");
  }

  if (/Okul Birincisi/i.test(text)) {
    statuses.push("Okul Birincisi");
  }

  if (/Şehit|Gazi/i.test(text)) {
    statuses.push("Şehit/Gazi Yakını");
  }

  if (/34 Yaş/i.test(text)) {
    statuses.push("34 Yaş Üstü Kadın");
  }

  if (/Depremzede/i.test(text)) {
    statuses.push("Depremzede");
  }

  return statuses;
}

function createSearchText(program) {
  return [
    program.code,
    program.programName,
    program.universityName,
    program.academicUnit,
    program.city,
    program.district,
    program.scoreType,
    program.level,
    program.language,
    program.scholarship,
    program.universityType,
  ]
    .filter(Boolean)
    .join(" ");
}

function readGuide(source) {
  if (!fs.existsSync(source.file)) {
    throw new Error(
      `2026 dosyası bulunamadı:\n${source.file}`
    );
  }

  const workbook = XLSX.readFile(source.file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  let currentUniversity = "";
  let currentUniversityType = "Diğer";
  let currentUnit = "";

  const programs = [];

  for (const row of rows.slice(3)) {
    const code = clean(row[0]);
    const name = clean(row[1]);

    if (!code && !name) {
      continue;
    }

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

    if (!/^\d{8,10}$/.test(code)) {
      continue;
    }

    programs.push({
      code,
      programName: name,
      universityName:
        currentUniversity || "Bilinmeyen Üniversite",
      universityType: currentUniversityType,
      academicUnit: currentUnit || null,
      level: source.level,
      duration: nullableInteger(row[2]),
      scoreType: normalizeScoreType(row[3]),
      language: detectLanguage(name),
      scholarship: detectScholarship(name),
      specialStatuses: detectSpecialStatuses(name),

      guide2026: {
        guideYear: 2026,

        generalQuota: nullableInteger(row[4]),
        schoolFirstQuota: nullableInteger(row[5]),

        previousResultYear: 2025,
        previousRanking: nullableInteger(
          row[source.rankingIndex]
        ),
        previousBaseScore: nullableNumber(
          row[source.scoreIndex]
        ),

        conditions:
          clean(row[source.conditionsIndex]) || null,
      },
    });
  }

  return programs;
}

if (!fs.existsSync(PROGRAMS_FILE)) {
  throw new Error(
    `programs.json bulunamadı:\n${PROGRAMS_FILE}`
  );
}

const oldData = JSON.parse(
  fs.readFileSync(PROGRAMS_FILE, "utf8")
);

if (!Array.isArray(oldData.programs)) {
  throw new Error(
    "programs.json içindeki programs alanı bir dizi değil."
  );
}

fs.copyFileSync(PROGRAMS_FILE, BACKUP_FILE);

console.log("Yedek oluşturuldu:");
console.log(BACKUP_FILE);
console.log("");

const programsByCode = new Map();

for (const oldProgram of oldData.programs) {
  programsByCode.set(String(oldProgram.code), {
    ...oldProgram,
    isActive2026: false,
  });
}

let matchedCount = 0;
let addedCount = 0;
let guideProgramCount = 0;

for (const source of SOURCES) {
  const guidePrograms = readGuide(source);

  console.log(
    `${path.basename(source.file)}: ` +
      `${guidePrograms.length} program okundu.`
  );

  guideProgramCount += guidePrograms.length;

  for (const guideProgram of guidePrograms) {
    const existing = programsByCode.get(guideProgram.code);

    if (existing) {
      matchedCount += 1;

      const history = {
        ...(existing.history ?? {}),
      };

      const old2025 = {
        ...(history["2025"] ?? history[2025] ?? {}),
      };

      /*
       * 2026 kılavuzunda gösterilen sıralama ve taban puan
       * 2025 yerleştirme sonucudur.
       *
       * Kontenjan ise 2026 kontenjanıdır. Bu nedenle 2026
       * kontenjanını history["2025"] içine yazmıyoruz.
       */
      history["2025"] = {
        ...old2025,

        ranking:
          guideProgram.guide2026.previousRanking ??
          old2025.ranking ??
          null,

        baseScore:
          guideProgram.guide2026.previousBaseScore ??
          old2025.baseScore ??
          null,
      };

      const updated = {
        ...existing,

        programName:
          guideProgram.programName ||
          existing.programName,

        universityName:
          guideProgram.universityName ||
          existing.universityName,

        universityType:
          guideProgram.universityType ||
          existing.universityType,

        academicUnit:
          guideProgram.academicUnit ??
          existing.academicUnit ??
          null,

        level:
          guideProgram.level ||
          existing.level,

        duration:
          guideProgram.duration ??
          existing.duration ??
          null,

        scoreType:
          guideProgram.scoreType ||
          existing.scoreType,

        language: guideProgram.language,
        scholarship: guideProgram.scholarship,

        specialStatuses:
          guideProgram.specialStatuses,

        latestGuideYear: 2026,

        guide2026: guideProgram.guide2026,

        history,

        latestResultYear: 2025,

        latestRanking:
          history["2025"]?.ranking ?? null,

        latestBaseScore:
          history["2025"]?.baseScore ?? null,

        /*
         * Sitedeki mevcut latestQuota alanı güncel
         * kontenjanı temsil etsin.
         */
        latestQuota:
          guideProgram.guide2026.generalQuota,

        /*
         * latestPlaced 2025 yerleştirme sonucudur.
         * Mevcut değeri korunur.
         */
        latestPlaced:
          history["2025"]?.placed ??
          existing.latestPlaced ??
          null,

        isActive2026: true,
      };

      updated.searchText = createSearchText(updated);

      programsByCode.set(guideProgram.code, updated);
      continue;
    }

    addedCount += 1;

    const newProgram = {
      code: guideProgram.code,
      programName: guideProgram.programName,
      universityName: guideProgram.universityName,
      universityType: guideProgram.universityType,
      academicUnit: guideProgram.academicUnit,
      level: guideProgram.level,
      duration: guideProgram.duration,
      scoreType: guideProgram.scoreType,
      language: guideProgram.language,
      scholarship: guideProgram.scholarship,
      specialStatuses:
        guideProgram.specialStatuses,

      latestGuideYear: 2026,

      guide2026: guideProgram.guide2026,

      history: {
        "2025": {
          guideYear: 2026,
          ranking:
            guideProgram.guide2026.previousRanking,
          baseScore:
            guideProgram.guide2026.previousBaseScore,
          generalQuota: null,
          placed: null,
          schoolFirstQuota: null,
          conditions: null,
        },
      },

      latestResultYear:
        guideProgram.guide2026.previousRanking !== null ||
        guideProgram.guide2026.previousBaseScore !== null
          ? 2025
          : null,

      latestRanking:
        guideProgram.guide2026.previousRanking,

      latestBaseScore:
        guideProgram.guide2026.previousBaseScore,

      latestQuota:
        guideProgram.guide2026.generalQuota,

      latestPlaced: null,

      isActive2025: false,
      isActive2026: true,

      city: null,
      district: null,
    };

    newProgram.searchText = createSearchText(newProgram);

    programsByCode.set(newProgram.code, newProgram);
  }
}

const programs = Array.from(programsByCode.values()).sort(
  (a, b) => {
    const universityComparison =
      String(a.universityName).localeCompare(
        String(b.universityName),
        "tr"
      );

    if (universityComparison !== 0) {
      return universityComparison;
    }

    return String(a.programName).localeCompare(
      String(b.programName),
      "tr"
    );
  }
);

const activePrograms = programs.filter(
  (program) => program.isActive2026
);

const universityCount = new Set(
  activePrograms.map(
    (program) => program.universityName
  )
).size;

const byLevel = {
  onLisans: activePrograms.filter(
    (program) => program.level === "Ön Lisans"
  ).length,

  lisans: activePrograms.filter(
    (program) => program.level === "Lisans"
  ).length,
};

const byUniversityType = activePrograms.reduce(
  (acc, program) => {
    const type = program.universityType || "Diğer";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  },
  {}
);

const metadata = {
  ...(oldData.metadata ?? {}),

  generatedAt: new Date().toISOString(),

  programCount: programs.length,
  activeProgramCount2026: activePrograms.length,
  universityCount,

  resultYears: [2022, 2023, 2024, 2025],
  latestResultYear: 2025,

  guideYears: [2023, 2024, 2025, 2026],
  latestGuideYear: 2026,

  byLevel,
  byUniversityType,

  source:
    "ÖSYM 2026 YKS Tablo-3 ve Tablo-4; " +
    "2025 yerleştirme sonuçları korunmuştur.",
};

const output = {
  metadata,
  programs,
};

fs.writeFileSync(
  PROGRAMS_FILE,
  JSON.stringify(output, null, 2),
  "utf8"
);

console.log("");
console.log("========================================");
console.log("2026 AKTARIMI TAMAMLANDI");
console.log("========================================");
console.log("Kılavuz satırı:", guideProgramCount);
console.log("Eşleşen eski program:", matchedCount);
console.log("Yeni eklenen program:", addedCount);
console.log("Aktif 2026 programı:", activePrograms.length);
console.log("Toplam arşiv programı:", programs.length);
console.log("Aktif üniversite:", universityCount);
console.log("Ön lisans:", byLevel.onLisans);
console.log("Lisans:", byLevel.lisans);
console.log("");
console.log("Yedek:", BACKUP_FILE);
console.log("Çıktı:", PROGRAMS_FILE);
console.log("========================================");
