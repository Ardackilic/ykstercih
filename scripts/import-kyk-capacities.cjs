const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const dormitoriesPath = path.join(
  process.cwd(),
  "src",
  "data",
  "kyk-dormitories.json"
);

const workbookPath = path.join(
  process.cwd(),
  "data",
  "official-capacity-sources",
  "kygm-capacity.xlsx"
);

const reviewPath = path.join(
  process.cwd(),
  "data",
  "kyk-capacity-review.json"
);

const sourceUrl =
  "https://kygm.gsb.gov.tr/Public/Edit/images/KYK/DUYURULAR/nobetci_yurt_listesi.xlsx";

function cleanText(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  return cleanText(value)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9çğıöşü\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCity(value) {
  const normalized = normalize(value);

  const aliases = {
    icel: "mersin",
    afyon: "afyonkarahisar",
    kmaras: "kahramanmaras",
    "k maras": "kahramanmaras",
    urfa: "sanliurfa",
  };

  return aliases[normalized] ?? normalized;
}

function normalizeDormitoryName(value) {
  return normalize(value)
    .replace(/\bkyk\b/g, " ")
    .replace(/\bogrenci\b/g, " ")
    .replace(/\byurdu\b/g, " ")
    .replace(/\byurt\b/g, " ")
    .replace(/\bmudurlugu\b/g, " ")
    .replace(/\bkiz\b/g, " ")
    .replace(/\berkek\b/g, " ")
    .replace(/\byeni\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCapacity(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.round(value);

    return rounded > 0 ? rounded : null;
  }

  const text = cleanText(value)
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/[^\d]/g, "");

  if (!text) {
    return null;
  }

  const parsed = Number(text);

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0 ||
    parsed > 20000
  ) {
    return null;
  }

  return parsed;
}

function similarityScore(sourceName, targetName) {
  const source = normalizeDormitoryName(sourceName);
  const target = normalizeDormitoryName(targetName);

  if (!source || !target) {
    return 0;
  }

  if (source === target) {
    return 100;
  }

  if (
    source.includes(target) ||
    target.includes(source)
  ) {
    const shorter = Math.min(source.length, target.length);
    const longer = Math.max(source.length, target.length);

    return 75 + Math.round((shorter / longer) * 20);
  }

  const sourceWords = new Set(
    source.split(" ").filter((word) => word.length >= 3)
  );

  const targetWords = new Set(
    target.split(" ").filter((word) => word.length >= 3)
  );

  if (sourceWords.size === 0 || targetWords.size === 0) {
    return 0;
  }

  let commonWords = 0;

  for (const word of sourceWords) {
    if (targetWords.has(word)) {
      commonWords += 1;
    }
  }

  const unionSize = new Set([
    ...sourceWords,
    ...targetWords,
  ]).size;

  return Math.round((commonWords / unionSize) * 100);
}

function detectColumns(rows) {
  let headerIndex = -1;
  let cityColumn = -1;
  let districtColumn = -1;
  let nameColumn = -1;
  let capacityColumn = -1;

  for (
    let rowIndex = 0;
    rowIndex < Math.min(rows.length, 30);
    rowIndex += 1
  ) {
    const row = rows[rowIndex].map((cell) =>
      normalize(cell)
    );

    row.forEach((cell, columnIndex) => {
      if (
        cityColumn === -1 &&
        (cell === "il adi" ||
          cell === "il" ||
          cell.includes("il adi"))
      ) {
        cityColumn = columnIndex;
      }

      if (
        districtColumn === -1 &&
        (cell === "ilce adi" ||
          cell === "ilce" ||
          cell.includes("ilce adi"))
      ) {
        districtColumn = columnIndex;
      }

      if (
        nameColumn === -1 &&
        (cell.includes("yurdun adi") ||
          cell.includes("yurt adi") ||
          cell.includes("yurdun ismi"))
      ) {
        nameColumn = columnIndex;
      }

      if (
        capacityColumn === -1 &&
        (cell === "kapasite" ||
          cell.includes("yurt kapasitesi") ||
          cell.includes("toplam kapasite"))
      ) {
        capacityColumn = columnIndex;
      }
    });

    if (
      nameColumn !== -1 &&
      capacityColumn !== -1
    ) {
      headerIndex = rowIndex;
      break;
    }
  }

  return {
    headerIndex,
    cityColumn,
    districtColumn,
    nameColumn,
    capacityColumn,
  };
}

function extractCapacityRecords(workbook) {
  const records = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: true,
    });

    const columns = detectColumns(rows);

    if (
      columns.headerIndex === -1 ||
      columns.nameColumn === -1 ||
      columns.capacityColumn === -1
    ) {
      console.log(
        `Atlandı: ${sheetName} — uygun başlık bulunamadı.`
      );

      continue;
    }

    console.log(
      `Okunuyor: ${sheetName}, başlık satırı ${
        columns.headerIndex + 1
      }`
    );

    let currentCity = "";
    let currentDistrict = "";

    for (
      let rowIndex = columns.headerIndex + 1;
      rowIndex < rows.length;
      rowIndex += 1
    ) {
      const row = rows[rowIndex];

      const city =
        columns.cityColumn !== -1
          ? cleanText(row[columns.cityColumn])
          : "";

      const district =
        columns.districtColumn !== -1
          ? cleanText(row[columns.districtColumn])
          : "";

      if (city) currentCity = city;
      if (district) currentDistrict = district;

      const name = cleanText(row[columns.nameColumn]);
      const capacity = parseCapacity(
        row[columns.capacityColumn]
      );

      if (!name || capacity === null) {
        continue;
      }

      records.push({
        sheetName,
        rowNumber: rowIndex + 1,
        city: city || currentCity,
        district: district || currentDistrict,
        name,
        capacity,
      });
    }
  }

  return records;
}

if (!fs.existsSync(dormitoriesPath)) {
  throw new Error("KYK yurt veri dosyası bulunamadı.");
}

if (!fs.existsSync(workbookPath)) {
  throw new Error("Kapasite Excel dosyası bulunamadı.");
}

const dormitoryData = JSON.parse(
  fs.readFileSync(dormitoriesPath, "utf8")
);

const workbook = XLSX.readFile(workbookPath);
const capacityRecords = extractCapacityRecords(workbook);

console.log(
  "\nExcel'den çıkarılan kapasite kaydı:",
  capacityRecords.length
);

const review = [];
const matchedDormitoryIds = new Set();

let exactMatches = 0;
let strongMatches = 0;
let updated = 0;
let unchanged = 0;

for (const capacityRecord of capacityRecords) {
  const recordCity = normalizeCity(capacityRecord.city);

  const candidates = dormitoryData.dormitories
    .filter((dormitory) => {
      if (!recordCity) {
        return true;
      }

      return (
        normalizeCity(dormitory.city) === recordCity
      );
    })
    .map((dormitory) => ({
      dormitory,
      score: similarityScore(
        capacityRecord.name,
        dormitory.name
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  const second = candidates[1];

  const scoreDifference =
    best && second ? best.score - second.score : 100;

  const safeMatch =
    best &&
    (
      best.score >= 95 ||
      (best.score >= 82 && scoreDifference >= 12)
    );

  if (!safeMatch) {
    review.push({
      source: capacityRecord,
      reason: best
        ? "Güvenli eşleşme bulunamadı"
        : "Aynı şehirde yurt bulunamadı",
      candidates: candidates.slice(0, 5).map((candidate) => ({
        id: candidate.dormitory.id,
        name: candidate.dormitory.name,
        city: candidate.dormitory.city,
        score: candidate.score,
      })),
    });

    continue;
  }

  const dormitory = best.dormitory;

  if (matchedDormitoryIds.has(dormitory.id)) {
    review.push({
      source: capacityRecord,
      reason: "Aynı yurt başka satırla daha önce eşleşti",
      candidates: [
        {
          id: dormitory.id,
          name: dormitory.name,
          city: dormitory.city,
          score: best.score,
        },
      ],
    });

    continue;
  }

  matchedDormitoryIds.add(dormitory.id);

  if (best.score >= 95) {
    exactMatches += 1;
  } else {
    strongMatches += 1;
  }

  if (dormitory.capacity === capacityRecord.capacity) {
    unchanged += 1;
  } else {
    dormitory.capacity = capacityRecord.capacity;
    updated += 1;
  }

  dormitory.capacitySourceName =
    "Kredi ve Yurtlar Genel Müdürlüğü";

  dormitory.capacitySourceUrl = sourceUrl;
  dormitory.capacitySourceSheet =
    capacityRecord.sheetName;

  dormitory.capacitySourceRow =
    capacityRecord.rowNumber;

  dormitory.capacityVerified = true;
  dormitory.capacityLastCheckedAt =
    new Date().toISOString();
}

dormitoryData.metadata.capacityImport = {
  importedAt: new Date().toISOString(),
  sourceUrl,
  sourceFile: path.relative(
    process.cwd(),
    workbookPath
  ),
  sourceRecordCount: capacityRecords.length,
  exactMatches,
  strongMatches,
  updated,
  unchanged,
  reviewCount: review.length,
  dormitoriesWithCapacity:
    dormitoryData.dormitories.filter(
      (item) =>
        typeof item.capacity === "number" &&
        item.capacity > 0
    ).length,
};

fs.writeFileSync(
  dormitoriesPath,
  JSON.stringify(dormitoryData, null, 2),
  "utf8"
);

fs.writeFileSync(
  reviewPath,
  JSON.stringify(
    {
      metadata: {
        createdAt: new Date().toISOString(),
        sourceUrl,
        reviewCount: review.length,
      },
      review,
    },
    null,
    2
  ),
  "utf8"
);

console.log("");
console.log("========================================");
console.log("KAPASİTE AKTARIMI TAMAMLANDI");
console.log("Kaynak satır:", capacityRecords.length);
console.log("Tam eşleşme:", exactMatches);
console.log("Güçlü eşleşme:", strongMatches);
console.log("Güncellenen yurt:", updated);
console.log("Aynı kalan:", unchanged);
console.log(
  "Kapasitesi bulunan toplam yurt:",
  dormitoryData.metadata.capacityImport
    .dormitoriesWithCapacity
);
console.log("Elle kontrol:", review.length);
console.log("İnceleme dosyası:", reviewPath);
console.log("========================================");
