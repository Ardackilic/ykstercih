const fs = require("fs");
const path = require("path");
const https = require("https");

const locationsPath = path.join(
  process.cwd(),
  "src",
  "data",
  "university-locations.json"
);

const cachePath = path.join(
  process.cwd(),
  "data",
  "university-geocode-cache.json"
);

const reviewPath = path.join(
  process.cwd(),
  "data",
  "university-location-review.json"
);

const USER_AGENT =
  "TercihPusula/1.0 university-location-research";

const REQUEST_DELAY_MS = 1400;
const MAX_PER_RUN = 20;

const manualAliases = {
  "ANKARA HACI BAYRAM VELİ ÜNİVERSİTESİ": [
    "Ankara Hacı Bayram Veli Üniversitesi Rektörlüğü",
    "Hacı Bayram Veli Üniversitesi Beşevler Yerleşkesi",
  ],

  "ANKARA MEDİPOL ÜNİVERSİTESİ": [
    "Ankara Medipol Üniversitesi Anafartalar Kampüsü",
    "Ankara Medipol Üniversitesi Rektörlüğü",
  ],

  "SANKO ÜNİVERSİTESİ (GAZİANTEP)": [
    "SANKO Üniversitesi Gaziantep",
    "Sani Konukoğlu Üniversitesi Gaziantep",
  ],

  "SELÇUK ÜNİVERSİTESİ (KONYA)": [
    "Selçuk Üniversitesi Alaeddin Keykubat Kampüsü",
    "Selçuk Üniversitesi Rektörlüğü Konya",
  ],

  "SİVAS BİLİM VE TEKNOLOJİ ÜNİVERSİTESİ": [
    "Sivas Bilim ve Teknoloji Üniversitesi",
    "Sivas Science and Technology University",
  ],

  "SÜLEYMAN DEMİREL ÜNİVERSİTESİ (ISPARTA)": [
    "Süleyman Demirel Üniversitesi Doğu Kampüsü",
    "Süleyman Demirel Üniversitesi Rektörlüğü",
  ],

  "TARSUS ÜNİVERSİTESİ (MERSİN)": [
    "Tarsus Üniversitesi Mersin",
    "Tarsus Üniversitesi Rektörlüğü",
  ],

  "TED ÜNİVERSİTESİ (ANKARA)": [
    "TED Üniversitesi Kolej Ankara",
    "TED University Ankara",
  ],

  "TOBB EKONOMİ VE TEKNOLOJİ ÜNİVERSİTESİ (ANKARA)": [
    "TOBB ETÜ Ankara",
    "TOBB University of Economics and Technology",
  ],

  "TOKAT GAZİOSMANPAŞA ÜNİVERSİTESİ": [
    "Tokat Gaziosmanpaşa Üniversitesi Taşlıçiftlik Kampüsü",
    "Gaziosmanpaşa Üniversitesi Tokat",
  ],

  "TOROS ÜNİVERSİTESİ (MERSİN)": [
    "Toros Üniversitesi 45 Evler Kampüsü",
    "Toros University Mersin",
  ],

  "TRAKYA ÜNİVERSİTESİ (EDİRNE)": [
    "Trakya Üniversitesi Balkan Yerleşkesi",
    "Trakya Üniversitesi Rektörlüğü Edirne",
  ],

  "TÜRK HAVA KURUMU ÜNİVERSİTESİ (ANKARA)": [
    "Türk Hava Kurumu Üniversitesi Etimesgut",
    "University of Turkish Aeronautical Association",
  ],

  "TÜRK-ALMAN ÜNİVERSİTESİ (İSTANBUL)": [
    "Türk Alman Üniversitesi Beykoz",
    "Turkish-German University Istanbul",
  ],

  "ÜSKÜDAR ÜNİVERSİTESİ (İSTANBUL)": [
    "Üsküdar Üniversitesi Altunizade Yerleşkesi",
    "Uskudar University Istanbul",
  ],

  "YAŞAR ÜNİVERSİTESİ (İZMİR)": [
    "Yaşar Üniversitesi Selçuk Yaşar Kampüsü",
    "Yasar University Bornova İzmir",
  ],

  "YEDİTEPE ÜNİVERSİTESİ (İSTANBUL)": [
    "Yeditepe Üniversitesi 26 Ağustos Yerleşimi",
    "Yeditepe University Ataşehir",
  ],

  "YILDIZ TEKNİK ÜNİVERSİTESİ (İSTANBUL)": [
    "Yıldız Teknik Üniversitesi Davutpaşa Kampüsü",
    "Yıldız Technical University Davutpasa",
  ],

  "YÜKSEK İHTİSAS ÜNİVERSİTESİ (ANKARA)": [
    "Yüksek İhtisas Üniversitesi Balgat",
    "Yüksek İhtisas Üniversitesi Rektörlüğü",
  ],

  "ZONGULDAK BÜLENT ECEVİT ÜNİVERSİTESİ": [
    "Zonguldak Bülent Ecevit Üniversitesi İncivez Kampüsü",
    "Bülent Ecevit Üniversitesi Zonguldak",
  ],
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(value) {
  return String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanUniversityName(name) {
  return String(name)
    .replace(/\([^)]*\)/g, " ")
    .replace(/\*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
      },
      (response) => {
        let body = "";

        response.setEncoding("utf8");

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          if (
            !response.statusCode ||
            response.statusCode < 200 ||
            response.statusCode >= 300
          ) {
            reject(
              new Error(
                `HTTP ${response.statusCode}: ${body.slice(0, 180)}`
              )
            );
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.setTimeout(15000, () => {
      request.destroy(new Error("İstek zaman aşımına uğradı."));
    });

    request.on("error", reject);
  });
}

async function geocode(query) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "5",
    addressdetails: "1",
    countrycodes: "tr",
  });

  return requestJson(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`
  );
}

function cityMatches(result, expectedCity) {
  if (!expectedCity) return true;

  const address = result.address || {};

  const searchable = normalize(
    [
      result.display_name,
      address.city,
      address.town,
      address.province,
      address.state,
      address.county,
      address.municipality,
    ].join(" ")
  );

  const expected = normalize(expectedCity);

  const specialCityAliases = {
    kocaeli: ["kocaeli", "izmit", "gebze"],
    mersin: ["mersin", "icel", "tarsus"],
    istanbul: ["istanbul"],
    izmir: ["izmir"],
    ankara: ["ankara"],
  };

  const acceptedNames =
    specialCityAliases[expected] ?? [expected];

  return acceptedNames.some((name) =>
    searchable.includes(normalize(name))
  );
}

function scoreResult(result, university, queryIndex) {
  const displayName = normalize(result.display_name);
  const cleanName = normalize(cleanUniversityName(university.name));

  const words = cleanName
    .split(" ")
    .filter(
      (word) =>
        word.length >= 4 &&
        !["universitesi", "universite"].includes(word)
    )
    .slice(0, 6);

  let score = 0;

  for (const word of words) {
    if (displayName.includes(word)) {
      score += 3;
    }
  }

  if (cityMatches(result, university.city)) {
    score += 8;
  } else {
    score -= 12;
  }

  const type = normalize(result.type);
  const category = normalize(result.category || result.class);

  if (
    type.includes("university") ||
    type.includes("college") ||
    category === "amenity"
  ) {
    score += 5;
  }

  if (
    displayName.includes("universite") ||
    displayName.includes("university")
  ) {
    score += 4;
  }

  if (queryIndex < 2) {
    score += 2;
  }

  return score;
}

function isTurkeyUniversity(university) {
  const type = normalize(university.type);
  const name = normalize(university.name);
  const city = normalize(university.city);

  const foreignMarkers = [
    "azerbaycan",
    "kazakistan",
    "kirgizistan",
    "arnavutluk",
    "makedonya",
    "bosna",
    "hersek",
    "kktc",
  ];

  if (
    type.includes("yurt disi") ||
    type.includes("kktc")
  ) {
    return false;
  }

  if (
    foreignMarkers.some((marker) =>
      name.includes(marker)
    )
  ) {
    return false;
  }

  const foreignCities = [
    "baku",
    "biskek",
    "turkistan",
    "lefkoşa",
    "girne",
    "gazimagusa",
    "guzelyurt",
    "lefke",
  ];

  if (
    foreignCities.some((foreignCity) =>
      city.includes(normalize(foreignCity))
    )
  ) {
    return false;
  }

  return true;
}

function createQueries(university) {
  const cleanName = cleanUniversityName(university.name);

  const aliases = manualAliases[university.name] ?? [];

  return Array.from(
    new Set([
      ...aliases,
      `${cleanName}, ${university.city}, Türkiye`,
      `${cleanName} Rektörlüğü, ${university.city}`,
      `${cleanName} Ana Kampüs, ${university.city}`,
      `${cleanName} Kampüsü, ${university.city}`,
      `${cleanName}, Türkiye`,
    ])
  );
}

async function findUniversity(university) {
  const queries = createQueries(university);
  const candidates = [];

  for (let queryIndex = 0; queryIndex < queries.length; queryIndex += 1) {
    const query = queries[queryIndex];
    const results = await geocode(query);

    if (Array.isArray(results)) {
      for (const result of results) {
        candidates.push({
          query,
          result,
          score: scoreResult(result, university, queryIndex),
        });
      }
    }

    if (queryIndex < queries.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const best = candidates[0];

  if (
    !best ||
    best.score < 12 ||
    !cityMatches(best.result, university.city)
  ) {
    return {
      match: null,
      candidates: candidates.slice(0, 5),
    };
  }

  return {
    match: best,
    candidates: candidates.slice(0, 5),
  };
}

async function main() {
  const data = JSON.parse(
    fs.readFileSync(locationsPath, "utf8")
  );

  const cache = fs.existsSync(cachePath)
    ? JSON.parse(fs.readFileSync(cachePath, "utf8"))
    : {};

  const review = fs.existsSync(reviewPath)
    ? JSON.parse(fs.readFileSync(reviewPath, "utf8"))
    : {};

  const pending = data.universities.filter(
    (university) =>
      university.city &&
      isTurkeyUniversity(university) &&
      university.latitude === null &&
      !review[university.id]
  );

  const batch = pending.slice(0, MAX_PER_RUN);

  console.log("Bu çalıştırmada işlenecek:", batch.length);
  console.log("Koordinatı eksik toplam:", pending.length);

  for (let index = 0; index < batch.length; index += 1) {
    const university = batch[index];

    console.log(
      `\n[${index + 1}/${batch.length}] ${university.name}`
    );

    try {
      const searchResult = await findUniversity(university);
      const match = searchResult.match;

      if (!match) {
        review[university.id] = {
          universityName: university.name,
          city: university.city,
          status: "manual-review-required",
          candidates: searchResult.candidates.map((candidate) => ({
            query: candidate.query,
            score: candidate.score,
            displayName: candidate.result.display_name,
            latitude: Number(candidate.result.lat),
            longitude: Number(candidate.result.lon),
          })),
          checkedAt: new Date().toISOString(),
        };

        cache[university.id] = {
          status: "retry-not-found",
          searchedAt: new Date().toISOString(),
        };

        console.log("  Güvenli eşleşme bulunamadı.");
      } else {
        const latitude = Number(match.result.lat);
        const longitude = Number(match.result.lon);

        university.latitude = latitude;
        university.longitude = longitude;
        university.address = match.result.display_name;
        university.locationSource =
          "OpenStreetMap Nominatim - second pass";
        university.coordinatesVerified = false;
        university.lastVerifiedAt = null;

        cache[university.id] = {
          status: "found-second-pass",
          query: match.query,
          score: match.score,
          latitude,
          longitude,
          displayName: match.result.display_name,
          osmType: match.result.osm_type,
          osmId: match.result.osm_id,
          searchedAt: new Date().toISOString(),
        };

        delete review[university.id];

        console.log(
          `  Bulundu: ${latitude}, ${longitude}`
        );
        console.log(`  Eşleşme puanı: ${match.score}`);
        console.log(`  Adres: ${match.result.display_name}`);
      }
    } catch (error) {
      console.error(
        "  Hata:",
        error instanceof Error ? error.message : error
      );
    }

    fs.writeFileSync(
      locationsPath,
      JSON.stringify(data, null, 2),
      "utf8"
    );

    fs.writeFileSync(
      cachePath,
      JSON.stringify(cache, null, 2),
      "utf8"
    );

    fs.writeFileSync(
      reviewPath,
      JSON.stringify(review, null, 2),
      "utf8"
    );

    if (index < batch.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  data.metadata.coordinatesReady =
    data.universities.filter(
      (university) =>
        university.latitude !== null &&
        university.longitude !== null
    ).length;

  fs.writeFileSync(
    locationsPath,
    JSON.stringify(data, null, 2),
    "utf8"
  );

  const remaining = data.universities.filter(
    (university) =>
      university.city &&
      isTurkeyUniversity(university) &&
      university.latitude === null
  );

  console.log("\n========================================");
  console.log("İKİNCİ TUR TAMAMLANDI");
  console.log(
    "Koordinatı hazır:",
    data.metadata.coordinatesReady
  );
  console.log("Kalan:", remaining.length);
  console.log(
    "Elle kontrol dosyası:",
    reviewPath
  );
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
