const fs = require("fs");
const path = require("path");
const https = require("https");

const inputPath = path.join(
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

const outputPath = inputPath;

const USER_AGENT =
  "TercihPusula/1.0 university-location-research";

const REQUEST_DELAY_MS = 1200;
const MAX_PER_RUN = 20;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
            response.statusCode < 200 ||
            response.statusCode >= 300
          ) {
            reject(
              new Error(
                `HTTP ${response.statusCode}: ${body.slice(0, 200)}`
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
    limit: "3",
    addressdetails: "1",
    countrycodes: "tr",
  });

  const url =
    `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  return requestJson(url);
}

function scoreResult(result, university) {
  const displayName = String(result.display_name || "")
    .toLocaleLowerCase("tr-TR");

  let score = 0;

  const cleanName = cleanUniversityName(university.name)
    .toLocaleLowerCase("tr-TR");

  const importantWords = cleanName
    .split(" ")
    .filter((word) => word.length >= 4)
    .slice(0, 5);

  for (const word of importantWords) {
    if (displayName.includes(word)) {
      score += 2;
    }
  }

  if (
    university.city &&
    displayName.includes(
      university.city.toLocaleLowerCase("tr-TR")
    )
  ) {
    score += 5;
  }

  const resultType = String(result.type || "");
  const resultClass = String(result.class || "");

  if (
    resultType.includes("university") ||
    resultType.includes("college") ||
    resultClass === "amenity"
  ) {
    score += 3;
  }

  return score;
}

async function findUniversity(university) {
  const cleanName = cleanUniversityName(university.name);

  const queries = [
    `${cleanName}, ${university.city || ""}, Türkiye`,
    `${cleanName}, Türkiye`,
  ];

  for (const query of queries) {
    const results = await geocode(query);

    if (!Array.isArray(results) || results.length === 0) {
      continue;
    }

    const ranked = results
      .map((result) => ({
        result,
        score: scoreResult(result, university),
      }))
      .sort((a, b) => b.score - a.score);

    if (ranked[0] && ranked[0].score >= 5) {
      return {
        query,
        score: ranked[0].score,
        result: ranked[0].result,
      };
    }
  }

  return null;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  fs.mkdirSync(path.dirname(cachePath), {
    recursive: true,
  });

  const cache = fs.existsSync(cachePath)
    ? JSON.parse(fs.readFileSync(cachePath, "utf8"))
    : {};

  const pending = data.universities.filter(
    (university) =>
      university.city &&
      university.type !== "KKTC" &&
      university.type !== "Yurt Dışı" &&
      university.latitude === null &&
      !cache[university.id]
  );

  const batch = pending.slice(0, MAX_PER_RUN);

  console.log("Bu çalıştırmada işlenecek:", batch.length);
  console.log("Toplam bekleyen:", pending.length);

  for (let index = 0; index < batch.length; index += 1) {
    const university = batch[index];

    console.log(
      `\n[${index + 1}/${batch.length}] ${university.name}`
    );

    try {
      const match = await findUniversity(university);

      if (!match) {
        cache[university.id] = {
          status: "not-found",
          searchedAt: new Date().toISOString(),
        };

        console.log("  Sonuç bulunamadı.");
      } else {
        const latitude = Number(match.result.lat);
        const longitude = Number(match.result.lon);

        cache[university.id] = {
          status: "found",
          query: match.query,
          score: match.score,
          latitude,
          longitude,
          displayName: match.result.display_name,
          osmType: match.result.osm_type,
          osmId: match.result.osm_id,
          searchedAt: new Date().toISOString(),
        };

        university.latitude = latitude;
        university.longitude = longitude;
        university.address = match.result.display_name;
        university.locationSource = "OpenStreetMap Nominatim";
        university.coordinatesVerified = false;
        university.lastVerifiedAt = null;

        console.log(
          `  Bulundu: ${latitude}, ${longitude}`
        );
        console.log(
          `  Eşleşme puanı: ${match.score}`
        );
      }
    } catch (error) {
      console.error(
        "  Hata:",
        error instanceof Error ? error.message : error
      );
    }

    fs.writeFileSync(
      cachePath,
      JSON.stringify(cache, null, 2),
      "utf8"
    );

    fs.writeFileSync(
      outputPath,
      JSON.stringify(data, null, 2),
      "utf8"
    );

    if (index < batch.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  data.metadata.coordinatesReady =
    data.universities.filter(
      (item) =>
        item.latitude !== null &&
        item.longitude !== null
    ).length;

  fs.writeFileSync(
    outputPath,
    JSON.stringify(data, null, 2),
    "utf8"
  );

  console.log("\n========================================");
  console.log("Bu çalıştırma tamamlandı.");
  console.log(
    "Koordinatı hazır:",
    data.metadata.coordinatesReady
  );
  console.log(
    "Kalan:",
    data.universities.filter(
      (item) =>
        item.city &&
        item.type !== "KKTC" &&
        item.type !== "Yurt Dışı" &&
        item.latitude === null &&
        !cache[item.id]
    ).length
  );
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
