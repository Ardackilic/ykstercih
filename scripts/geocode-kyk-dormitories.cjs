const fs = require("fs");
const path = require("path");
const https = require("https");

const dormitoriesPath = path.join(
  process.cwd(),
  "src",
  "data",
  "kyk-dormitories.json"
);

const cachePath = path.join(
  process.cwd(),
  "data",
  "kyk-dormitory-geocode-cache.json"
);

const reviewPath = path.join(
  process.cwd(),
  "data",
  "kyk-dormitory-location-review.json"
);

const USER_AGENT =
  "TercihPusula/1.0 official-KYGM-dormitory-geocode";

const REQUEST_DELAY_MS = 1300;
const MAX_PER_RUN = 20;

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

    request.setTimeout(20000, () => {
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

function cityMatches(result, city) {
  const searchable = normalize(
    [
      result.display_name,
      result.address?.city,
      result.address?.town,
      result.address?.province,
      result.address?.state,
      result.address?.county,
      result.address?.municipality,
    ].join(" ")
  );

  const aliases = {
    mersin: ["mersin", "icel"],
    kocaeli: ["kocaeli", "izmit", "gebze"],
    afyonkarahisar: ["afyonkarahisar", "afyon"],
  };

  const expected = normalize(city);
  const accepted = aliases[expected] ?? [expected];

  return accepted.some((name) =>
    searchable.includes(normalize(name))
  );
}

function scoreResult(result, dormitory) {
  const displayName = normalize(result.display_name);
  const dormitoryName = normalize(dormitory.name);

  let score = 0;

  const words = dormitoryName
    .split(" ")
    .filter(
      (word) =>
        word.length >= 4 &&
        !["ogrenci", "yurdu", "mudurlugu"].includes(word)
    )
    .slice(0, 6);

  for (const word of words) {
    if (displayName.includes(word)) {
      score += 3;
    }
  }

  if (cityMatches(result, dormitory.city)) {
    score += 8;
  } else {
    score -= 12;
  }

  if (
    displayName.includes("yurt") ||
    displayName.includes("ogrenci")
  ) {
    score += 4;
  }

  if (
    normalize(result.type).includes("dormitory") ||
    normalize(result.category || result.class) === "building"
  ) {
    score += 3;
  }

  return score;
}

function createQueries(dormitory) {
  return Array.from(
    new Set([
      `${dormitory.name}, ${dormitory.city}, Türkiye`,
      `${dormitory.address}, ${dormitory.city}, Türkiye`,
      `${dormitory.name} KYK, ${dormitory.city}`,
      `${dormitory.name} Öğrenci Yurdu, ${dormitory.city}`,
    ])
  );
}

async function findDormitory(dormitory) {
  const queries = createQueries(dormitory);
  const candidates = [];

  for (let index = 0; index < queries.length; index += 1) {
    const query = queries[index];
    const results = await geocode(query);

    if (Array.isArray(results)) {
      for (const result of results) {
        candidates.push({
          query,
          result,
          score: scoreResult(result, dormitory),
        });
      }
    }

    if (index < queries.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const best = candidates[0];

  if (
    !best ||
    best.score < 10 ||
    !cityMatches(best.result, dormitory.city)
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
    fs.readFileSync(dormitoriesPath, "utf8")
  );

  const cache = fs.existsSync(cachePath)
    ? JSON.parse(fs.readFileSync(cachePath, "utf8"))
    : {};

  const review = fs.existsSync(reviewPath)
    ? JSON.parse(fs.readFileSync(reviewPath, "utf8"))
    : {};

  const pending = data.dormitories.filter(
    (dormitory) =>
      dormitory.latitude === null &&
      dormitory.longitude === null &&
      !cache[dormitory.id] &&
      !review[dormitory.id]
  );

  const batch = pending.slice(0, MAX_PER_RUN);

  console.log("Bu çalıştırmada işlenecek:", batch.length);
  console.log("Toplam bekleyen:", pending.length);

  for (let index = 0; index < batch.length; index += 1) {
    const dormitory = batch[index];

    console.log(
      `\n[${index + 1}/${batch.length}] ${dormitory.city} - ${dormitory.name}`
    );

    try {
      const result = await findDormitory(dormitory);

      if (!result.match) {
        review[dormitory.id] = {
          name: dormitory.name,
          city: dormitory.city,
          address: dormitory.address,
          status: "manual-review-required",
          candidates: result.candidates.map((candidate) => ({
            query: candidate.query,
            score: candidate.score,
            displayName: candidate.result.display_name,
            latitude: Number(candidate.result.lat),
            longitude: Number(candidate.result.lon),
          })),
          checkedAt: new Date().toISOString(),
        };

        console.log("  Güvenli eşleşme bulunamadı.");
      } else {
        const match = result.match;

        dormitory.latitude = Number(match.result.lat);
        dormitory.longitude = Number(match.result.lon);

        cache[dormitory.id] = {
          status: "found",
          query: match.query,
          score: match.score,
          latitude: dormitory.latitude,
          longitude: dormitory.longitude,
          displayName: match.result.display_name,
          searchedAt: new Date().toISOString(),
        };

        console.log(
          `  Bulundu: ${dormitory.latitude}, ${dormitory.longitude}`
        );
        console.log(`  Eşleşme puanı: ${match.score}`);
      }
    } catch (error) {
      console.error(
        "  Hata:",
        error instanceof Error ? error.message : error
      );
    }

    fs.writeFileSync(
      dormitoriesPath,
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
    data.dormitories.filter(
      (item) =>
        item.latitude !== null &&
        item.longitude !== null
    ).length;

  fs.writeFileSync(
    dormitoriesPath,
    JSON.stringify(data, null, 2),
    "utf8"
  );

  console.log("\n========================================");
  console.log("YURT KOORDİNAT TARAMASI TAMAMLANDI");
  console.log(
    "Koordinatı hazır:",
    data.metadata.coordinatesReady
  );
  console.log(
    "Kalan:",
    data.dormitories.filter(
      (item) =>
        item.latitude === null &&
        item.longitude === null &&
        !cache[item.id] &&
        !review[item.id]
    ).length
  );
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
