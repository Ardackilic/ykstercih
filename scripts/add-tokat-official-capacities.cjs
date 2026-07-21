const fs = require("fs");
const path = require("path");

const filePath = path.join(
  process.cwd(),
  "src",
  "data",
  "kyk-dormitories.json"
);

const data = JSON.parse(
  fs.readFileSync(filePath, "utf8")
);

function normalize(value) {
  return String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
  Bu değerler güncel kapasite iddiası değildir.
  Resmî, geçmiş tarihli işletme yeri listesinde görülen
  kapasite değerleri olarak saklanır.
*/
const officialRecords = [
  {
    matchNames: [
      "AYDOĞAN AYDIN ÖĞRENCİ YURDU",
    ],
    capacity: 1313,
    recordYear: 2019,
  },
  {
    matchNames: [
      "PLEVNE ÖĞRENCİ YURDU",
    ],
    capacity: 628,
    recordYear: 2019,
  },
  {
    matchNames: [
      "ERBAA YURDU",
      "ERBAA YURDU | YAVUZ SULTAN SELİM MAH.",
    ],
    capacity: 490,
    recordYear: 2019,
  },
  {
    matchNames: [
      "TOKAT İBN-İ KEMAL ÖĞRENCİ YURDU",
      "TOKAT İBN-İ KEMAL ÖĞRENCİ YURDU | TOKAT İBN-İ KEMAL",
    ],
    capacity: 822,
    recordYear: 2019,
  },
  {
    matchNames: [
      "ARTOVA ÖĞRENCİ YURDU",
      "ARTOVA YURDU",
    ],
    capacity: 184,
    recordYear: 2019,
  },
];

const sourceUrl =
  "https://kygm.gsb.gov.tr/Public/Edit/images/KYK/se%C3%A7ime%20%C3%A7%C4%B1k%C4%B1lacak%20i%C5%9Fletme%20yerlerinin%20listesi.pdf";

let updated = 0;
const missing = [];

for (const record of officialRecords) {
  const acceptedNames = record.matchNames.map(normalize);

  const dormitory = data.dormitories.find(
    (item) =>
      normalize(item.city) === "tokat" &&
      acceptedNames.some((name) => {
        const dormitoryName = normalize(item.name);

        return (
          dormitoryName === name ||
          dormitoryName.includes(name) ||
          name.includes(dormitoryName)
        );
      })
  );

  if (!dormitory) {
    missing.push(record.matchNames[0]);
    continue;
  }

  dormitory.historicalCapacity = record.capacity;
  dormitory.historicalCapacityYear =
    record.recordYear;

  dormitory.historicalCapacitySourceName =
    "Kredi ve Yurtlar Genel Müdürlüğü";

  dormitory.historicalCapacitySourceUrl =
    sourceUrl;

  dormitory.historicalCapacityVerified = true;
  dormitory.historicalCapacityLastCheckedAt =
    new Date().toISOString();

  updated += 1;

  console.log(
    `Eklendi: ${dormitory.name} → ${record.capacity}`
  );
}

data.metadata.historicalCapacityImport = {
  importedAt: new Date().toISOString(),
  updated,
  missing,
  note:
    "Değerler güncel kapasite olarak değil, geçmiş tarihli resmî kapasite kaydı olarak kullanılmalıdır.",
};

fs.writeFileSync(
  filePath,
  JSON.stringify(data, null, 2),
  "utf8"
);

console.log("");
console.log("========================================");
console.log("TOKAT RESMÎ KAPASİTE KATMANI EKLENDİ");
console.log("Güncellenen:", updated);
console.log("Bulunamayan:", missing.length);
console.log("========================================");
