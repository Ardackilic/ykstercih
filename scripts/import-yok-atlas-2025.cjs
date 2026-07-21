const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const API_URL =
  "https://yokatlas.yok.gov.tr/api/tercih-kilavuz/search";

const PROGRAMS_FILE = path.join(
  ROOT,
  "src",
  "data",
  "programs.json"
);

const SNAPSHOT_FILE = path.join(
  ROOT,
  "data",
  "yok-atlas-2025-compact.json"
);

const BACKUP_FILE = path.join(
  ROOT,
  "src",
  "data",
  `programs-before-yok-atlas-${Date.now()}.json`
);

const PAGE_SIZE = 500;
const MAX_RETRIES = 4;

function wait(milliseconds) {
  return new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );
}

function nullableNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-"
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function nullableInteger(value) {
  const number = nullableNumber(value);

  return number === null
    ? null
    : Math.trunc(number);
}

async function fetchPage(page, attempt = 1) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        origin: "https://yokatlas.yok.gov.tr",
        referer: "https://yokatlas.yok.gov.tr/",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140 Safari/537.36",
      },
      body: JSON.stringify({
        filters: {},
        direction: "ASC",
        page,
        size: PAGE_SIZE,
        sortBy: "basariSirasi",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data.content)) {
      throw new Error(
        "YÖK Atlas beklenen JSON yapısını döndürmedi."
      );
    }

    if (Number(data.yil) !== 2025) {
      throw new Error(
        `Beklenmeyen veri yılı: ${data.yil}`
      );
    }

    return data;
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      throw error;
    }

    console.log(
      `Sayfa ${page} alınamadı. ` +
      `${attempt + 1}. deneme yapılacak...`
    );

    await wait(attempt * 1500);

    return fetchPage(page, attempt + 1);
  }
}

async function main() {
  if (!fs.existsSync(PROGRAMS_FILE)) {
    throw new Error(
      `Program dosyası bulunamadı: ${PROGRAMS_FILE}`
    );
  }

  console.log("YÖK Atlas 2025 verileri indiriliyor...");
  console.log("");

  const firstPage = await fetchPage(0);

  console.log(
    `Toplam YÖK Atlas kaydı: ${firstPage.totalElements}`
  );

  console.log(
    `Toplam sayfa: ${firstPage.totalPages}`
  );

  const allRows = [...firstPage.content];

  for (
    let page = 1;
    page < firstPage.totalPages;
    page += 1
  ) {
    const data = await fetchPage(page);

    allRows.push(...data.content);

    console.log(
      `Sayfa ${page + 1}/${firstPage.totalPages} ` +
      `alındı — toplam ${allRows.length} kayıt`
    );

    await wait(100);
  }

  const compactRows = allRows
    .map((row) => ({
      code: String(row.kilavuzKodu ?? "").trim(),
      year: nullableInteger(row.yil),
      tableType: row.tabloTuru ?? null,
      universityName: row.universiteAdi ?? null,
      academicUnit: row.fymkAdi ?? null,
      programName: row.birimAdi ?? null,
      level: row.birimTuruAdi ?? null,
      scoreType: row.puanTuru ?? null,
      duration: nullableInteger(row.ogrenimSuresi),
      language: row.ogrenimDiliAdi ?? null,
      scholarship: row.bursOraniAdi ?? null,
      universityType: row.universiteTuru ?? null,
      city: row.ilAdi ?? null,
      district: row.ilceAdi ?? null,
      quota: nullableInteger(row.kontenjan),
      placed: nullableInteger(row.gkY),
      baseScore: nullableNumber(row.minPuan),
      ranking: nullableInteger(row.basariSirasi),
      conditions: row.kosul ?? null,
      minimumRankingLimit:
        nullableInteger(row.minBasariSirasi),
      accreditation: row.akreditasyon ?? null,
      accreditationDescription:
        row.akreditasyonAck ?? null,
      tuitionFee: nullableNumber(row.ucret),
    }))
    .filter((row) => /^\d{8,10}$/.test(row.code));

  fs.mkdirSync(
    path.dirname(SNAPSHOT_FILE),
    { recursive: true }
  );

  fs.writeFileSync(
    SNAPSHOT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "YÖK Atlas Tercih Sihirbazı",
        year: 2025,
        count: compactRows.length,
        programs: compactRows,
      },
      null,
      2
    ),
    "utf8"
  );

  const currentData = JSON.parse(
    fs.readFileSync(PROGRAMS_FILE, "utf8")
  );

  fs.copyFileSync(
    PROGRAMS_FILE,
    BACKUP_FILE
  );

  const atlasByCode = new Map(
    compactRows.map((row) => [
      row.code,
      row,
    ])
  );

  let matched = 0;
  let rankingAdded = 0;
  let scoreUpdated = 0;
  let quotaUpdated = 0;
  let placedUpdated = 0;

  for (const program of currentData.programs) {
    const code = String(program.code);
    const atlas = atlasByCode.get(code);

    if (!atlas) {
      continue;
    }

    matched += 1;

    program.history =
      program.history ?? {};

    const current2025 =
      program.history["2025"] ?? {};

    if (atlas.ranking !== null) {
      current2025.ranking = atlas.ranking;
      program.latestRanking = atlas.ranking;
      rankingAdded += 1;
    }

    if (atlas.baseScore !== null) {
      current2025.baseScore =
        atlas.baseScore;

      program.latestBaseScore =
        atlas.baseScore;

      scoreUpdated += 1;
    }

    if (atlas.quota !== null) {
      current2025.generalQuota =
        atlas.quota;

      program.latestQuota =
        atlas.quota;

      quotaUpdated += 1;
    }

    if (atlas.placed !== null) {
      current2025.placed =
        atlas.placed;

      program.latestPlaced =
        atlas.placed;

      placedUpdated += 1;
    }

    current2025.guideYear = 2025;
    current2025.conditions =
      atlas.conditions ??
      current2025.conditions ??
      null;

    current2025.minimumRankingLimit =
      atlas.minimumRankingLimit;

    current2025.accreditation =
      atlas.accreditation;

    current2025.accreditationDescription =
      atlas.accreditationDescription;

    current2025.tuitionFee =
      atlas.tuitionFee;

    program.history["2025"] =
      current2025;

    program.latestResultYear = 2025;
    program.latestGuideYear = 2025;

    program.duration =
      atlas.duration ??
      program.duration;

    program.scoreType =
      atlas.scoreType ??
      program.scoreType;

    program.language =
      atlas.language ??
      program.language;

    program.scholarship =
      atlas.scholarship ??
      program.scholarship;
  }

  currentData.metadata = {
    ...(currentData.metadata ?? {}),
    generatedAt: new Date().toISOString(),
    latestResultYear: 2025,
    latestGuideYear: 2025,
    source:
      "ÖSYM 2025 sonuçları + YÖK Atlas 2025 başarı sıraları",
    yokAtlasMatchedPrograms: matched,
    yokAtlasRankingCount: rankingAdded,
  };

  fs.writeFileSync(
    PROGRAMS_FILE,
    JSON.stringify(
      currentData,
      null,
      2
    ),
    "utf8"
  );

  console.log("");
  console.log("İŞLEM TAMAMLANDI");
  console.log("------------------------------");
  console.log(
    `YÖK Atlas kayıt sayısı: ${compactRows.length}`
  );
  console.log(
    `Eşleşen program: ${matched}`
  );
  console.log(
    `2025 sıralaması eklenen: ${rankingAdded}`
  );
  console.log(
    `2025 puanı güncellenen: ${scoreUpdated}`
  );
  console.log(
    `Kontenjanı güncellenen: ${quotaUpdated}`
  );
  console.log(
    `Yerleşeni güncellenen: ${placedUpdated}`
  );
  console.log("");
  console.log(
    `Yedek: ${BACKUP_FILE}`
  );
  console.log(
    `YÖK Atlas özeti: ${SNAPSHOT_FILE}`
  );
}

main().catch((error) => {
  console.error("");
  console.error("HATA:");
  console.error(error);
  process.exit(1);
});
