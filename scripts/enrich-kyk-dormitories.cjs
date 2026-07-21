const fs = require("fs");
const path = require("path");

const dormitoriesPath = path.join(
  process.cwd(),
  "src",
  "data",
  "kyk-dormitories.json"
);

const locationsPath = path.join(
  process.cwd(),
  "src",
  "data",
  "university-locations.json"
);

const outputPath = path.join(
  process.cwd(),
  "src",
  "data",
  "dormitory-university-matches.json"
);

function normalize(value) {
  return String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const districtAliases = {
  merkez: [
    "merkez",
    "merkez ilce",
    "merkez mevkii",
    "merkez mahallesi",
  ],
  "onikisubat": ["onikisubat", "oniki subat"],
  "dulkadiroglu": ["dulkadiroglu"],
  "sehitkamil": ["sehitkamil", "sehit kamil"],
  "sahinbey": ["sahinbey", "sahin bey"],
  "yenimahalle": ["yenimahalle", "yeni mahalle"],
  "kecioren": ["kecioren"],
  "cankaya": ["cankaya"],
  "altindag": ["altindag"],
  "mamak": ["mamak"],
  "etimesgut": ["etimesgut"],
  "golbasi": ["golbasi"],
  "sincan": ["sincan"],
  "sariyer": ["sariyer"],
  "besiktas": ["besiktas"],
  "uskudar": ["uskudar"],
  "kadikoy": ["kadikoy"],
  "fatih": ["fatih"],
  "avcilar": ["avcilar"],
  "bagcilar": ["bagcilar"],
  "zeytinburnu": ["zeytinburnu"],
  "pendik": ["pendik"],
  "tuzla": ["tuzla"],
  "beykoz": ["beykoz"],
  "bornova": ["bornova"],
  "buca": ["buca"],
  "konak": ["konak"],
  "cigli": ["cigli"],
  "urla": ["urla"],
  "karsiyaka": ["karsiyaka"],
  "melikgazi": ["melikgazi"],
  "kocasinan": ["kocasinan"],
  "talas": ["talas"],
  "erbaa": ["erbaa"],
  "niksar": ["niksar"],
  "turhal": ["turhal"],
  "zile": ["zile"],
  "resadiye": ["resadiye"],
  "tarsus": ["tarsus"],
  "erdemli": ["erdemli"],
  "silifke": ["silifke"],
  "anamur": ["anamur"],
};

function detectDistrict(address, city) {
  const normalizedAddress = normalize(address);
  const normalizedCity = normalize(city);

  for (const [district, aliases] of Object.entries(
    districtAliases
  )) {
    if (
      aliases.some((alias) =>
        normalizedAddress.includes(normalize(alias))
      )
    ) {
      return district;
    }
  }

  const slashParts = String(address ?? "")
    .split("/")
    .map((part) => normalize(part))
    .filter(Boolean);

  for (const part of slashParts.reverse()) {
    if (
      part &&
      part !== normalizedCity &&
      !part.includes(normalizedCity) &&
      part.length >= 3 &&
      part.length <= 30
    ) {
      return part;
    }
  }

  return null;
}

function calculateDistanceKm(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  const earthRadiusKm = 6371;

  const toRadians = (value) =>
    (value * Math.PI) / 180;

  const latitudeDifference = toRadians(
    latitude2 - latitude1
  );

  const longitudeDifference = toRadians(
    longitude2 - longitude1
  );

  const firstLatitude = toRadians(latitude1);
  const secondLatitude = toRadians(latitude2);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

const dormitoryData = JSON.parse(
  fs.readFileSync(dormitoriesPath, "utf8")
);

const universityData = JSON.parse(
  fs.readFileSync(locationsPath, "utf8")
);

for (const dormitory of dormitoryData.dormitories) {
  if (!dormitory.district) {
    dormitory.district = detectDistrict(
      dormitory.address,
      dormitory.city
    );
  }
}

const matches = dormitoryData.dormitories.map(
  (dormitory) => {
    const sameCityUniversities =
      universityData.universities.filter(
        (university) =>
          normalize(university.city) ===
          normalize(dormitory.city)
      );

    const rankedUniversities =
      sameCityUniversities
        .map((university) => {
          let score = 0;
          let distanceKm = null;
          let relation = "Şehir eşleşmesi";

          if (
            dormitory.latitude !== null &&
            dormitory.longitude !== null &&
            university.latitude !== null &&
            university.longitude !== null
          ) {
            distanceKm = calculateDistanceKm(
              dormitory.latitude,
              dormitory.longitude,
              university.latitude,
              university.longitude
            );

            score += Math.max(0, 100 - distanceKm);
            relation = "Koordinatla hesaplandı";
          }

          if (
            dormitory.district &&
            university.district &&
            normalize(dormitory.district) ===
              normalize(university.district)
          ) {
            score += 50;
            relation = "Aynı ilçe";
          }

          return {
            universityId: university.id,
            universityName: university.name,
            city: university.city,
            district: university.district,
            relation,
            distanceKm:
              distanceKm !== null
                ? Number(distanceKm.toFixed(2))
                : null,
            score,
          };
        })
        .sort((a, b) => {
          if (
            a.distanceKm !== null &&
            b.distanceKm !== null
          ) {
            return a.distanceKm - b.distanceKm;
          }

          if (a.distanceKm !== null) return -1;
          if (b.distanceKm !== null) return 1;

          return a.universityName.localeCompare(
            b.universityName,
            "tr"
          );
        })
        .slice(0, 5);

    return {
      dormitoryId: dormitory.id,
      dormitoryName: dormitory.name,
      city: dormitory.city,
      district: dormitory.district,
      nearestUniversities: rankedUniversities,
    };
  }
);

dormitoryData.metadata.districtsDetected =
  dormitoryData.dormitories.filter(
    (item) => item.district
  ).length;

fs.writeFileSync(
  dormitoriesPath,
  JSON.stringify(dormitoryData, null, 2),
  "utf8"
);

fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      metadata: {
        generatedAt: new Date().toISOString(),
        dormitoryCount: matches.length,
        withDistrict:
          dormitoryData.metadata.districtsDetected,
      },
      matches,
    },
    null,
    2
  ),
  "utf8"
);

console.log("========================================");
console.log("HIZLI YURT EŞLEŞTİRMESİ TAMAMLANDI");
console.log(
  "Toplam yurt:",
  dormitoryData.dormitories.length
);
console.log(
  "İlçesi bulunan:",
  dormitoryData.metadata.districtsDetected
);
console.log("Eşleşme dosyası:", outputPath);
console.log("========================================");
