const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();

const dormitoriesPath = path.join(
  projectRoot,
  "src/data/kyk-dormitories.json"
);

const sourcePath = path.join(
  projectRoot,
  "data/verified-dormitory-details/capacities.json"
);

const outputPath = path.join(
  projectRoot,
  "src/data/generated-dormitory-capacities.ts"
);

if (!fs.existsSync(dormitoriesPath)) {
  throw new Error(
    "Yurt veri dosyası bulunamadı: src/data/kyk-dormitories.json"
  );
}

if (!fs.existsSync(sourcePath)) {
  throw new Error(
    "Kapasite kaynak dosyası bulunamadı: data/verified-dormitory-details/capacities.json"
  );
}

const dormitoryData = JSON.parse(
  fs.readFileSync(dormitoriesPath, "utf8")
);

const sourceData = JSON.parse(
  fs.readFileSync(sourcePath, "utf8")
);

const records = Array.isArray(sourceData.records)
  ? sourceData.records
  : [];

const dormitoryMap = new Map(
  dormitoryData.dormitories.map((item) => [
    item.id,
    item,
  ])
);

const accepted = [];
const rejected = [];
const duplicateIds = [];
const seenIds = new Set();

for (const record of records) {
  if (!record || typeof record !== "object") {
    rejected.push({
      reason: "Geçersiz kayıt biçimi",
      record,
    });
    continue;
  }

  const {
    dormitoryId,
    capacity,
    capacityYear,
    sourceName,
    sourceUrl,
    verifiedAt,
  } = record;

  if (
    typeof dormitoryId !== "string" ||
    dormitoryId.trim() === ""
  ) {
    rejected.push({
      reason: "dormitoryId eksik",
      record,
    });
    continue;
  }

  if (seenIds.has(dormitoryId)) {
    duplicateIds.push(dormitoryId);
    continue;
  }

  seenIds.add(dormitoryId);

  const dormitory = dormitoryMap.get(dormitoryId);

  if (!dormitory) {
    rejected.push({
      reason: "Yurt ID eşleşmedi",
      dormitoryId,
      record,
    });
    continue;
  }

  if (
    typeof capacity !== "number" ||
    !Number.isFinite(capacity) ||
    capacity <= 0
  ) {
    rejected.push({
      reason: "Kapasite geçersiz",
      dormitoryId,
      record,
    });
    continue;
  }

  if (
    capacityYear !== undefined &&
    capacityYear !== null &&
    (
      typeof capacityYear !== "number" ||
      capacityYear < 2000 ||
      capacityYear > 2100
    )
  ) {
    rejected.push({
      reason: "Kapasite yılı geçersiz",
      dormitoryId,
      record,
    });
    continue;
  }

  if (
    typeof sourceName !== "string" ||
    sourceName.trim() === ""
  ) {
    rejected.push({
      reason: "Kaynak adı eksik",
      dormitoryId,
      record,
    });
    continue;
  }

  if (
    typeof sourceUrl !== "string" ||
    !sourceUrl.startsWith("http")
  ) {
    rejected.push({
      reason: "Kaynak bağlantısı geçersiz",
      dormitoryId,
      record,
    });
    continue;
  }

  accepted.push({
    dormitoryId,
    dormitoryName: dormitory.name,
    capacity: Math.round(capacity),
    capacityYear:
      typeof capacityYear === "number"
        ? capacityYear
        : null,
    capacitySourceName: sourceName.trim(),
    capacitySourceUrl: sourceUrl.trim(),
    verifiedAt:
      typeof verifiedAt === "string" &&
      verifiedAt.trim() !== ""
        ? verifiedAt
        : new Date().toISOString().slice(0, 10),
  });
}

accepted.sort((a, b) =>
  a.dormitoryName.localeCompare(
    b.dormitoryName,
    "tr"
  )
);

const output = `/*
  Bu dosya otomatik oluşturulur.
  Elle değiştirmeyin.

  Kaynak:
  data/verified-dormitory-details/capacities.json

  Oluşturulma zamanı:
  ${new Date().toISOString()}
*/

export type GeneratedDormitoryCapacity = {
  dormitoryId: string;
  dormitoryName: string;
  capacity: number;
  capacityYear: number | null;
  capacitySourceName: string;
  capacitySourceUrl: string;
  verifiedAt: string;
};

export const generatedDormitoryCapacities: GeneratedDormitoryCapacity[] =
  ${JSON.stringify(accepted, null, 2)};

export const generatedDormitoryCapacityMap = new Map(
  generatedDormitoryCapacities.map((record) => [
    record.dormitoryId,
    record,
  ])
);
`;

fs.writeFileSync(outputPath, output, "utf8");

const reviewPath = path.join(
  projectRoot,
  "data/verified-dormitory-details/capacity-import-review.json"
);

fs.writeFileSync(
  reviewPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sourceRecordCount: records.length,
      acceptedCount: accepted.length,
      rejectedCount: rejected.length,
      duplicateCount: duplicateIds.length,
      duplicates: duplicateIds,
      rejected,
    },
    null,
    2
  ),
  "utf8"
);

console.log("");
console.log("========================================");
console.log("TOPLU KAPASİTE AKTARIMI TAMAMLANDI");
console.log("Kaynak kayıt:", records.length);
console.log("Kabul edilen:", accepted.length);
console.log("Reddedilen:", rejected.length);
console.log("Tekrarlanan ID:", duplicateIds.length);
console.log("");
console.log("Çıktı:");
console.log(outputPath);
console.log("");
console.log("Kontrol dosyası:");
console.log(reviewPath);
console.log("========================================");
