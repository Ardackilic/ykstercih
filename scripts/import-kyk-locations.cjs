const fs = require("fs");
const path = require("path");
const https = require("https");
const cheerio = require("cheerio");

const SOURCE_URL =
  "https://kygm.gsb.gov.tr/Sayfalar/2635/2389/yurt-bulunan-il-ve-ilceler.aspx";

const OUTPUT_JSON = path.join(
  process.cwd(),
  "src",
  "data",
  "kyk-locations.json"
);

const OUTPUT_TS = path.join(
  process.cwd(),
  "src",
  "data",
  "kyk-locations.ts"
);

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "TercihPusula/1.0 official-KYGM-data-import",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "tr-TR,tr;q=0.9",
        },
      },
      (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          resolve(fetchPage(new URL(response.headers.location, url).toString()));
          return;
        }

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
                `Sayfa alınamadı. HTTP ${response.statusCode}`
              )
            );
            return;
          }

          resolve(body);
        });
      }
    );

    request.setTimeout(30000, () => {
      request.destroy(
        new Error("KYGM isteği zaman aşımına uğradı.")
      );
    });

    request.on("error", reject);
  });
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseTr(value) {
  return cleanText(value)
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .map((part) => {
      if (!part) return part;

      return (
        part[0].toLocaleUpperCase("tr-TR") +
        part.slice(1)
      );
    })
    .join(" ");
}

function normalizeGender(value) {
  const normalized = cleanText(value).toLocaleUpperCase("tr-TR");

  if (
    normalized.includes("KIZ") &&
    normalized.includes("ERKEK")
  ) {
    return "Kız ve Erkek";
  }

  if (normalized.includes("KIZ")) {
    return "Kız";
  }

  if (normalized.includes("ERKEK")) {
    return "Erkek";
  }

  return titleCaseTr(value);
}

function slugify(value) {
  return String(value)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createRecord(city, district, gender) {
  const normalizedCity = titleCaseTr(city);
  const normalizedDistrict = titleCaseTr(district);
  const normalizedGender = normalizeGender(gender);

  return {
    id: slugify(
      `${normalizedCity}-${normalizedDistrict}-${normalizedGender}`
    ),
    city: normalizedCity,
    district: normalizedDistrict,
    gender: normalizedGender,
    sourceName: "Kredi ve Yurtlar Genel Müdürlüğü",
    sourceUrl: SOURCE_URL,
    verified: true,
    lastCheckedAt: new Date().toISOString(),
  };
}

function parseTableRows($) {
  const records = [];

  $("tr").each((_, row) => {
    const cells = $(row)
      .find("td")
      .map((__, cell) => cleanText($(cell).text()))
      .get()
      .filter(Boolean);

    if (cells.length < 3) {
      return;
    }

    const [city, district, gender] = cells;

    const genderUpper = gender.toLocaleUpperCase("tr-TR");

    if (
      !genderUpper.includes("KIZ") &&
      !genderUpper.includes("ERKEK")
    ) {
      return;
    }

    records.push(createRecord(city, district, gender));
  });

  return records;
}

function parseTextFallback($) {
  const pageText = $("body")
    .text()
    .split(/\r?\n/)
    .map(cleanText)
    .filter(Boolean);

  const records = [];

  for (let index = 0; index < pageText.length - 2; index += 1) {
    const city = pageText[index];
    const district = pageText[index + 1];
    const gender = pageText[index + 2];

    const genderUpper = gender.toLocaleUpperCase("tr-TR");

    if (
      genderUpper === "KIZ" ||
      genderUpper === "ERKEK" ||
      genderUpper === "KIZ VE ERKEK"
    ) {
      records.push(createRecord(city, district, gender));
      index += 2;
    }
  }

  return records;
}

function deduplicate(records) {
  const map = new Map();

  for (const record of records) {
    const key = [
      record.city.toLocaleUpperCase("tr-TR"),
      record.district.toLocaleUpperCase("tr-TR"),
      record.gender.toLocaleUpperCase("tr-TR"),
    ].join("|");

    map.set(key, record);
  }

  return Array.from(map.values()).sort((a, b) => {
    const cityComparison = a.city.localeCompare(b.city, "tr");

    if (cityComparison !== 0) {
      return cityComparison;
    }

    return a.district.localeCompare(b.district, "tr");
  });
}

async function main() {
  console.log("KYGM resmî sayfası indiriliyor...");

  const html = await fetchPage(SOURCE_URL);
  const $ = cheerio.load(html);

  let records = parseTableRows($);

  if (records.length === 0) {
    console.log(
      "Tablo satırı bulunamadı, metin yedeği deneniyor..."
    );

    records = parseTextFallback($);
  }

  records = deduplicate(records);

  if (records.length < 100) {
    throw new Error(
      `Yeterli kayıt çıkarılamadı. Bulunan kayıt: ${records.length}`
    );
  }

  const cities = Array.from(
    new Set(records.map((record) => record.city))
  );

  const metadata = {
    sourceName: "Kredi ve Yurtlar Genel Müdürlüğü",
    sourceUrl: SOURCE_URL,
    importedAt: new Date().toISOString(),
    locationCount: records.length,
    cityCount: cities.length,
    byGender: records.reduce((acc, record) => {
      acc[record.gender] = (acc[record.gender] || 0) + 1;
      return acc;
    }, {}),
  };

  fs.writeFileSync(
    OUTPUT_JSON,
    JSON.stringify(
      {
        metadata,
        locations: records,
      },
      null,
      2
    ),
    "utf8"
  );

  const tsContent = `export type KykLocation = {
  id: string;
  city: string;
  district: string;
  gender: "Kız" | "Erkek" | "Kız ve Erkek" | string;
  sourceName: string;
  sourceUrl: string;
  verified: boolean;
  lastCheckedAt: string;
};

import data from "./kyk-locations.json";

export const kykLocationMetadata = data.metadata;
export const kykLocations = data.locations as KykLocation[];
`;

  fs.writeFileSync(OUTPUT_TS, tsContent, "utf8");

  console.log("");
  console.log("========================================");
  console.log("RESMÎ KYGM KAPSAMI AKTARILDI");
  console.log("Şehir sayısı:", metadata.cityCount);
  console.log("İl/ilçe kaydı:", metadata.locationCount);
  console.log("Cinsiyet dağılımı:", metadata.byGender);
  console.log("JSON:", OUTPUT_JSON);
  console.log("TypeScript:", OUTPUT_TS);
  console.log("========================================");
}

main().catch((error) => {
  console.error("");
  console.error("AKTARIM HATASI:");
  console.error(
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
