const fs = require("fs");
const path = require("path");

const inputPath = path.join(
  process.cwd(),
  "src",
  "data",
  "programs.json"
);

const outputPath = path.join(
  process.cwd(),
  "src",
  "data",
  "university-locations.json"
);

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const cityAliases = {
  "AFYON": "Afyonkarahisar",
  "AFYONKARAHİSAR": "Afyonkarahisar",
  "İÇEL": "Mersin",
  "KAHRAMAN MARAŞ": "Kahramanmaraş",
  "ŞANLI URFA": "Şanlıurfa",

  "GEBZE": "Kocaeli",

  "LEFKOŞA": "Lefkoşa",
  "GİRNE": "Girne",
  "GAZİMAĞUSA": "Gazimağusa",
  "GÜZELYURT": "Güzelyurt",
  "LEFKE": "Lefke",

  "BAKÜ": "Bakü",
  "BİŞKEK": "Bişkek",
  "TÜRKİSTAN": "Türkistan",
};

const knownCities = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şanlıurfa",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
];

function normalize(value) {
  return String(value ?? "")
    .toLocaleUpperCase("tr-TR")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .map((part) =>
      part
        ? part[0].toLocaleUpperCase("tr-TR") + part.slice(1)
        : part
    )
    .join(" ");
}

function detectCity(universityName) {
  const normalizedName = normalize(universityName);

  const parentheses = [
    ...normalizedName.matchAll(/\(([^)]+)\)/g),
  ].map((match) => match[1].trim());

  for (const value of parentheses.reverse()) {
    const parts = value
      .split("-")
      .map((part) => part.trim())
      .filter(Boolean);

    const candidates = [
      value,
      ...parts,
      ...parts.reverse(),
    ];

    for (const candidate of candidates) {
      const aliased =
        cityAliases[candidate] ??
        titleCase(candidate);

      const matchedTurkeyCity = knownCities.find(
        (city) =>
          normalize(city) === normalize(aliased)
      );

      if (matchedTurkeyCity) {
        return {
          city: matchedTurkeyCity,
          source: "university-name-parentheses",
          confidence: "high",
        };
      }

      if (cityAliases[candidate]) {
        return {
          city: cityAliases[candidate],
          source: "foreign-city-parentheses",
          confidence: "high",
        };
      }
    }
  }

  for (const city of knownCities) {
    if (normalizedName.includes(normalize(city))) {
      return {
        city,
        source: "university-name-text",
        confidence: "medium",
      };
    }
  }

  if (normalizedName.includes("GEBZE TEKNİK ÜNİVERSİTESİ")) {
    return {
      city: "Kocaeli",
      source: "manual-university-override",
      confidence: "high",
    };
  }

  return {
    city: null,
    source: null,
    confidence: "unknown",
  };
}

const universities = new Map();

for (const program of data.programs) {
  if (!universities.has(program.universityName)) {
    universities.set(program.universityName, {
      id: slugify(program.universityName),
      name: program.universityName,
      type: program.universityType,
      programCount: 0,
    });
  }

  universities.get(program.universityName).programCount += 1;
}

const locations = Array.from(universities.values())
  .map((university) => {
    const detected = detectCity(university.name);

    return {
      ...university,
      city: detected.city,
      district: null,
      campusName: "Ana kampüs",
      address: null,
      latitude: null,
      longitude: null,
      locationSource: detected.source,
      cityConfidence: detected.confidence,
      coordinatesVerified: false,
      lastVerifiedAt: null,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "tr"));

const statistics = {
  generatedAt: new Date().toISOString(),
  total: locations.length,
  cityDetected: locations.filter((item) => item.city).length,
  cityMissing: locations.filter((item) => !item.city).length,
  coordinatesReady: locations.filter(
    (item) =>
      item.latitude !== null &&
      item.longitude !== null
  ).length,
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      metadata: statistics,
      universities: locations,
    },
    null,
    2
  ),
  "utf8"
);

console.log("========================================");
console.log("ÜNİVERSİTE KONUM ALTYAPISI OLUŞTURULDU");
console.log("Toplam üniversite:", statistics.total);
console.log("Şehri bulunan:", statistics.cityDetected);
console.log("Şehri bulunamayan:", statistics.cityMissing);
console.log("Koordinatı hazır:", statistics.coordinatesReady);
console.log("Çıktı:", outputPath);
console.log("========================================");

const missing = locations.filter((item) => !item.city);

if (missing.length > 0) {
  console.log("\nŞEHRİ BULUNAMAYAN İLK 20 ÜNİVERSİTE:");

  missing.slice(0, 20).forEach((item) => {
    console.log("-", item.name);
  });
}
