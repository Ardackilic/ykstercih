const fs = require("fs");
const path = require("path");
const https = require("https");
const cheerio = require("cheerio");

const OUTPUT_JSON = path.join(
  process.cwd(),
  "src",
  "data",
  "kyk-dormitories.json"
);

const OUTPUT_TS = path.join(
  process.cwd(),
  "src",
  "data",
  "kyk-dormitories.ts"
);

const CACHE_DIR = path.join(
  process.cwd(),
  "data",
  "kyk-dormitory-cache"
);

const BASE_URL =
  "https://kygm.gsb.gov.tr/Ajax/gettesis.aspx";

const provinces = [
  { plate: 1, city: "Adana" },
  { plate: 2, city: "Adıyaman" },
  { plate: 3, city: "Afyonkarahisar" },
  { plate: 4, city: "Ağrı" },
  { plate: 5, city: "Amasya" },
  { plate: 6, city: "Ankara" },
  { plate: 7, city: "Antalya" },
  { plate: 8, city: "Artvin" },
  { plate: 9, city: "Aydın" },
  { plate: 10, city: "Balıkesir" },
  { plate: 11, city: "Bilecik" },
  { plate: 12, city: "Bingöl" },
  { plate: 13, city: "Bitlis" },
  { plate: 14, city: "Bolu" },
  { plate: 15, city: "Burdur" },
  { plate: 16, city: "Bursa" },
  { plate: 17, city: "Çanakkale" },
  { plate: 18, city: "Çankırı" },
  { plate: 19, city: "Çorum" },
  { plate: 20, city: "Denizli" },
  { plate: 21, city: "Diyarbakır" },
  { plate: 22, city: "Edirne" },
  { plate: 23, city: "Elazığ" },
  { plate: 24, city: "Erzincan" },
  { plate: 25, city: "Erzurum" },
  { plate: 26, city: "Eskişehir" },
  { plate: 27, city: "Gaziantep" },
  { plate: 28, city: "Giresun" },
  { plate: 29, city: "Gümüşhane" },
  { plate: 30, city: "Hakkari" },
  { plate: 31, city: "Hatay" },
  { plate: 32, city: "Isparta" },
  { plate: 33, city: "Mersin" },
  { plate: 34, city: "İstanbul" },
  { plate: 35, city: "İzmir" },
  { plate: 36, city: "Kars" },
  { plate: 37, city: "Kastamonu" },
  { plate: 38, city: "Kayseri" },
  { plate: 39, city: "Kırklareli" },
  { plate: 40, city: "Kırşehir" },
  { plate: 41, city: "Kocaeli" },
  { plate: 42, city: "Konya" },
  { plate: 43, city: "Kütahya" },
  { plate: 44, city: "Malatya" },
  { plate: 45, city: "Manisa" },
  { plate: 46, city: "Kahramanmaraş" },
  { plate: 47, city: "Mardin" },
  { plate: 48, city: "Muğla" },
  { plate: 49, city: "Muş" },
  { plate: 50, city: "Nevşehir" },
  { plate: 51, city: "Niğde" },
  { plate: 52, city: "Ordu" },
  { plate: 53, city: "Rize" },
  { plate: 54, city: "Sakarya" },
  { plate: 55, city: "Samsun" },
  { plate: 56, city: "Siirt" },
  { plate: 57, city: "Sinop" },
  { plate: 58, city: "Sivas" },
  { plate: 59, city: "Tekirdağ" },
  { plate: 60, city: "Tokat" },
  { plate: 61, city: "Trabzon" },
  { plate: 62, city: "Tunceli" },
  { plate: 63, city: "Şanlıurfa" },
  { plate: 64, city: "Uşak" },
  { plate: 65, city: "Van" },
  { plate: 66, city: "Yozgat" },
  { plate: 67, city: "Zonguldak" },
  { plate: 68, city: "Aksaray" },
  { plate: 69, city: "Bayburt" },
  { plate: 70, city: "Karaman" },
  { plate: 71, city: "Kırıkkale" },
  { plate: 72, city: "Batman" },
  { plate: 73, city: "Şırnak" },
  { plate: 74, city: "Bartın" },
  { plate: 75, city: "Ardahan" },
  { plate: 76, city: "Iğdır" },
  { plate: 77, city: "Yalova" },
  { plate: 78, city: "Karabük" },
  { plate: 79, city: "Kilis" },
  { plate: 80, city: "Osmaniye" },
  { plate: 81, city: "Düzce" },
];

const REQUEST_DELAY_MS = 900;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function requestText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "TercihPusula/1.0 official-KYGM-dormitory-import",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "tr-TR,tr;q=0.9",
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
                `HTTP ${response.statusCode}: ${body.slice(0, 160)}`
              )
            );
            return;
          }

          resolve(body);
        });
      }
    );

    request.setTimeout(30000, () => {
      request.destroy(new Error("İstek zaman aşımına uğradı."));
    });

    request.on("error", reject);
  });
}

function normalizeGender(value, name) {
  const text = `${value} ${name}`.toLocaleUpperCase("tr-TR");

  if (text.includes("KIZ")) return "Kız";
  if (text.includes("ERKEK")) return "Erkek";

  return "Belirtilmemiş";
}

function extractField(text, fieldName, nextFields = []) {
  const normalizedText = normalize(text);

  const endAlternatives = nextFields
    .map((field) => `${field}\\s*:`)
    .join("|");

  const pattern = endAlternatives
    ? new RegExp(
        `${fieldName}\\s*:\\s*(.*?)(?=${endAlternatives}|$)`,
        "i"
      )
    : new RegExp(`${fieldName}\\s*:\\s*(.*)$`, "i");

  const match = normalizedText.match(pattern);

  return match ? normalize(match[1]) : null;
}

function cleanPhone(value) {
  if (!value || value === "-" || value === ".") {
    return null;
  }

  return normalize(value);
}

function parseProvinceHtml(html, province) {
  const $ = cheerio.load(html);
  const results = [];

  const candidateElements = $(
    ".tesis, .yurt, .item, .card, li, .col-md-4, .col-md-6"
  );

  const blocks = [];

  candidateElements.each((_, element) => {
    const text = normalize($(element).text());

    if (
      text.includes("Tipi") &&
      text.includes("Telefon") &&
      text.includes("Adres")
    ) {
      blocks.push({
        text,
        html: $.html(element),
      });
    }
  });

  if (blocks.length === 0) {
    const bodyHtml = $("body").html() || html;

    const splitParts = bodyHtml
      .split(/(?=<img|<h[1-6]|<strong|<div)/i)
      .map((part) => ({
        text: normalize(cheerio.load(part).text()),
        html: part,
      }))
      .filter(
        (part) =>
          part.text.includes("Tipi") &&
          part.text.includes("Telefon") &&
          part.text.includes("Adres")
      );

    blocks.push(...splitParts);
  }

  for (const block of blocks) {
    const block$ = cheerio.load(block.html);

    let name =
      normalize(
        block$("h1,h2,h3,h4,h5,strong,b")
          .first()
          .text()
      ) || null;

    if (!name) {
      const typeIndex = block.text.indexOf("Tipi");

      if (typeIndex > 0) {
        name = normalize(block.text.slice(0, typeIndex));
      }
    }

    if (!name || name.length < 4) {
      continue;
    }

    name = name
      .replace(/^Image\s*/i, "")
      .replace(/\s+Image$/i, "")
      .trim();

    const genderText = extractField(block.text, "Tipi", [
      "Telefon",
      "Faks",
      "Adres",
    ]);

    const phone = cleanPhone(
      extractField(block.text, "Telefon", [
        "Faks",
        "Adres",
      ])
    );

    const fax = cleanPhone(
      extractField(block.text, "Faks", ["Adres"])
    );

    const address = extractField(block.text, "Adres");

    if (!address) {
      continue;
    }

    results.push({
      id: slugify(`${province.city}-${name}`),
      name,
      city: province.city,
      plateCode: province.plate,
      district: null,
      type: "KYK",
      gender: normalizeGender(genderText, name),
      phone,
      fax,
      address,
      latitude: null,
      longitude: null,
      roomTypes: [],
      capacity: null,
      bathroom: null,
      meal: null,
      internet: null,
      laundry: null,
      studyRoom: null,
      security: null,
      sourceName: "Kredi ve Yurtlar Genel Müdürlüğü",
      sourceUrl:
        `${BASE_URL}?il=${encodeURIComponent(
          province.city.toLocaleLowerCase("tr-TR")
        )}&plaka_kodu=${province.plate}`,
      verified: true,
      lastCheckedAt: new Date().toISOString(),
    });
  }

  const unique = new Map();

  for (const result of results) {
    const key = normalize(
      `${result.city}|${result.name}|${result.address}`
    ).toLocaleUpperCase("tr-TR");

    unique.set(key, result);
  }

  return Array.from(unique.values());
}

async function fetchProvince(province) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const cacheFile = path.join(
    CACHE_DIR,
    `${String(province.plate).padStart(2, "0")}-${slugify(
      province.city
    )}.html`
  );

  let html;

  if (fs.existsSync(cacheFile)) {
    html = fs.readFileSync(cacheFile, "utf8");
    console.log("  Önbellekten okundu.");
  } else {
    const url =
      `${BASE_URL}?il=${encodeURIComponent(
        province.city.toLocaleLowerCase("tr-TR")
      )}&plaka_kodu=${province.plate}`;

    html = await requestText(url);
    fs.writeFileSync(cacheFile, html, "utf8");
  }

  return parseProvinceHtml(html, province);
}

async function main() {
  const allDormitories = [];
  const failures = [];

  for (let index = 0; index < provinces.length; index += 1) {
    const province = provinces[index];

    console.log(
      `[${index + 1}/${provinces.length}] ${province.city}`
    );

    try {
      const records = await fetchProvince(province);

      allDormitories.push(...records);

      console.log(`  ${records.length} yurt kaydı bulundu.`);
    } catch (error) {
      failures.push({
        city: province.city,
        plate: province.plate,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });

      console.error(
        "  Hata:",
        error instanceof Error ? error.message : error
      );
    }

    if (index < provinces.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  const unique = new Map();

  for (const dormitory of allDormitories) {
    const key = normalize(
      `${dormitory.city}|${dormitory.name}|${dormitory.address}`
    ).toLocaleUpperCase("tr-TR");

    unique.set(key, dormitory);
  }

  const dormitories = Array.from(unique.values()).sort(
    (a, b) => {
      const cityComparison = a.city.localeCompare(
        b.city,
        "tr"
      );

      if (cityComparison !== 0) {
        return cityComparison;
      }

      return a.name.localeCompare(b.name, "tr");
    }
  );

  const metadata = {
    sourceName: "Kredi ve Yurtlar Genel Müdürlüğü",
    importedAt: new Date().toISOString(),
    cityCount: new Set(
      dormitories.map((item) => item.city)
    ).size,
    dormitoryCount: dormitories.length,
    byGender: dormitories.reduce((acc, item) => {
      acc[item.gender] = (acc[item.gender] || 0) + 1;
      return acc;
    }, {}),
    failures,
  };

  fs.writeFileSync(
    OUTPUT_JSON,
    JSON.stringify(
      {
        metadata,
        dormitories,
      },
      null,
      2
    ),
    "utf8"
  );

  const typeScript = `export type KykDormitory = {
  id: string;
  name: string;
  city: string;
  plateCode: number;
  district: string | null;
  type: "KYK";
  gender: "Kız" | "Erkek" | "Belirtilmemiş";
  phone: string | null;
  fax: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  roomTypes: string[];
  capacity: number | null;
  bathroom: string | null;
  meal: string | null;
  internet: boolean | null;
  laundry: boolean | null;
  studyRoom: boolean | null;
  security: boolean | null;
  sourceName: string;
  sourceUrl: string;
  verified: boolean;
  lastCheckedAt: string;
};

import data from "./kyk-dormitories.json";

export const kykDormitoryMetadata = data.metadata;
export const kykDormitories =
  data.dormitories as KykDormitory[];
`;

  fs.writeFileSync(OUTPUT_TS, typeScript, "utf8");

  console.log("");
  console.log("========================================");
  console.log("GERÇEK KYK YURTLARI AKTARILDI");
  console.log("Şehir:", metadata.cityCount);
  console.log("Yurt:", metadata.dormitoryCount);
  console.log("Cinsiyet:", metadata.byGender);
  console.log("Başarısız şehir:", failures.length);
  console.log("JSON:", OUTPUT_JSON);
  console.log("TypeScript:", OUTPUT_TS);
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
