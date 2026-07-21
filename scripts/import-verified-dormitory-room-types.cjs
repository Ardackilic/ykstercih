const fs = require("fs");
const path = require("path");

const root = process.cwd();

const sourcePath = path.join(
  root,
  "data/verified-dormitory-details/room-types.json"
);

const dormitoriesPath = path.join(
  root,
  "src/data/kyk-dormitories.json"
);

const outputPath = path.join(
  root,
  "src/data/generated-dormitory-room-types.ts"
);

const reviewPath = path.join(
  root,
  "data/verified-dormitory-details/room-type-import-review.json"
);

const sourceData = JSON.parse(
  fs.readFileSync(sourcePath, "utf8")
);

const dormitoryData = JSON.parse(
  fs.readFileSync(dormitoriesPath, "utf8")
);

const dormitoryMap = new Map(
  dormitoryData.dormitories.map((item) => [
    item.id,
    item,
  ])
);

const accepted = [];
const rejected = [];
const seen = new Set();

for (const record of sourceData.records ?? []) {
  if (!record.dormitoryId) {
    rejected.push({
      record,
      reason: "dormitoryId eksik",
    });

    continue;
  }

  if (seen.has(record.dormitoryId)) {
    rejected.push({
      record,
      reason: "Aynı yurt için tekrarlanan kayıt",
    });

    continue;
  }

  const dormitory = dormitoryMap.get(
    record.dormitoryId
  );

  if (!dormitory) {
    rejected.push({
      record,
      reason: "Yurt ID bulunamadı",
    });

    continue;
  }

  const roomTypes = Array.isArray(
    record.roomTypes
  )
    ? record.roomTypes
        .map((item) =>
          String(item).trim()
        )
        .filter(Boolean)
    : [];

  if (roomTypes.length === 0) {
    rejected.push({
      record,
      reason: "Oda tipi boş",
    });

    continue;
  }

  seen.add(record.dormitoryId);

  accepted.push({
    dormitoryId: record.dormitoryId,
    roomTypes,
    sourceName:
      record.sourceName ?? null,
    sourceUrl:
      record.sourceUrl ?? null,
    verifiedAt:
      record.verifiedAt ?? null,
  });
}

const ts = `export type GeneratedDormitoryRoomType = {
  dormitoryId: string;
  roomTypes: string[];
  sourceName: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
};

export const generatedDormitoryRoomTypes:
  GeneratedDormitoryRoomType[] = ${JSON.stringify(
    accepted,
    null,
    2
  )};

export const generatedDormitoryRoomTypeMap =
  new Map(
    generatedDormitoryRoomTypes.map(
      (record) => [
        record.dormitoryId,
        record,
      ]
    )
  );
`;

fs.writeFileSync(
  outputPath,
  ts,
  "utf8"
);

fs.writeFileSync(
  reviewPath,
  JSON.stringify(
    {
      generatedAt:
        new Date().toISOString(),
      sourceRecordCount:
        sourceData.records?.length ?? 0,
      acceptedCount:
        accepted.length,
      rejectedCount:
        rejected.length,
      rejected,
    },
    null,
    2
  ),
  "utf8"
);

console.log("");
console.log("========================================");
console.log("ODA TİPİ AKTARIMI TAMAMLANDI");
console.log(
  "Kaynak kayıt:",
  sourceData.records?.length ?? 0
);
console.log("Kabul edilen:", accepted.length);
console.log("Reddedilen:", rejected.length);
console.log("Çıktı:", outputPath);
console.log("========================================");
