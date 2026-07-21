const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const SOURCES_PATH = path.join(
  ROOT,
  "data/official-dormitory-sources/sources.json"
);

const DORMITORIES_PATH = path.join(
  ROOT,
  "src/data/kyk-dormitories.json"
);

const CAPACITIES_PATH = path.join(
  ROOT,
  "data/verified-dormitory-details/capacities.json"
);

const REVIEW_PATH = path.join(
  ROOT,
  "data/verified-dormitory-details/automatic-capacity-review.json"
);

const DOWNLOAD_DIR = path.join(
  ROOT,
  "data/official-dormitory-sources/downloads"
);

fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

function normalize(value) {
  return String(value ?? "")
    .toLocaleUpperCase("tr-TR")
    .replace(/İ/g, "I")
    .replace(/Ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/Ş/g, "S")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C")
    .replace(/[’'`]/g, "")
    .replace(/$begin:math:text$\[\^\)\]\*$end:math:text$/g, " ")
    .replace(/\b(KIZ|ERKEK|KARMA)\b/g, " ")
    .replace(/\b(OGRENCI|YURDU|YURT|MUDURLUGU)\b/g, " ")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(left, right) {
  const leftTokens = normalize(left)
    .split(" ")
    .filter((item) => item.length >= 3);

  const rightTokens = normalize(right)
    .split(" ")
    .filter((item) => item.length >= 3);

  if (!leftTokens.length || !rightTokens.length) {
    return 0;
  }

  const leftSet = new Set(leftTokens);
  const rightSet = new Set(rightTokens);

  let intersection = 0;

  for (const token of leftSet) {
    if (rightSet.has(token)) {
      intersection++;
    }
  }

  const union = new Set([
    ...leftSet,
    ...rightSet,
  ]).size;

  let score = union > 0 ? intersection / union : 0;

  if (normalize(left) === normalize(right)) {
    score += 0.45;
  } else if (
    normalize(left).includes(normalize(right)) ||
    normalize(right).includes(normalize(left))
  ) {
    score += 0.2;
  }

  return Math.min(score, 1);
}

async function downloadFile(source) {
  const extension =
    source.type === "xlsx" ? "xlsx" : "pdf";

  const targetPath = path.join(
    DOWNLOAD_DIR,
    `${source.id}.${extension}`
  );

  const response = await fetch(source.url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 YKSTercih/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `${source.name}: HTTP ${response.status}`
    );
  }

  const buffer = Buffer.from(
    await response.arrayBuffer()
  );

  fs.writeFileSync(targetPath, buffer);

  return targetPath;
}

async function readPdf(filePath) {
  const pdfModule = require("pdf-parse");
  const buffer = fs.readFileSync(filePath);

  if (typeof pdfModule === "function") {
    const result = await pdfModule(buffer);
    return result.text ?? "";
  }

  if (pdfModule.PDFParse) {
    const parser = new pdfModule.PDFParse({
      data: buffer,
    });

    try {
      const result = await parser.getText();
      return result.text ?? "";
    } finally {
      await parser.destroy();
    }
  }

  throw new Error(
    "pdf-parse paketi desteklenen biçimde yüklenemedi."
  );
}

function parseCandidates(
  text,
  source,
  dormitories
) {
  const lines = text
    .split(/\r?\n/)
    .map((line) =>
      line.replace(/\s+/g, " ").trim()
    )
    .filter(Boolean);

  const preparedDormitories = dormitories
    .map((dormitory) => ({
      dormitory,
      normalizedName: normalize(
        dormitory.name
      ),
    }))
    .filter(
      (item) =>
        item.normalizedName.length >= 3
    )
    .sort(
      (a, b) =>
        b.normalizedName.length -
        a.normalizedName.length
    );

  const candidates = [];

  for (
    let index = 0;
    index < lines.length;
    index++
  ) {
    const line = lines[index];

    /*
      Satırların sonunda iki kapasite sütunu var:

      TOPLAM KAPASİTE
      HİZMET VERİLECEK KAPASİTE

      Örnek:
      BACIM SULTAN ... 3000 3000
      SELMAN-I FARİSİ ... 1876 1101
    */
    const numberMatch = line.match(
      /([1-9][0-9.]*)\s+([1-9][0-9.]*)\s*$/
    );

    if (!numberMatch) {
      continue;
    }

    const totalCapacity = Number(
      numberMatch[1].replace(/\./g, "")
    );

    const serviceCapacity = Number(
      numberMatch[2].replace(/\./g, "")
    );

    if (
      !Number.isFinite(totalCapacity) ||
      totalCapacity < 50 ||
      totalCapacity > 20000
    ) {
      continue;
    }

    const lineBeforeNumbers = line
      .slice(0, numberMatch.index)
      .trim();

    const normalizedLine = normalize(
      lineBeforeNumbers
    );

    const matches = preparedDormitories
      .filter((item) => {
        if (!item.normalizedName) {
          return false;
        }

        return (
          normalizedLine ===
            item.normalizedName ||
          normalizedLine.includes(
            item.normalizedName
          )
        );
      })
      .map((item) => {
        let score = 1;

        if (
          normalize(item.dormitory.city) &&
          normalizedLine.includes(
            normalize(item.dormitory.city)
          )
        ) {
          score += 0.2;
        }

        return {
          ...item,
          score,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return (
          b.normalizedName.length -
          a.normalizedName.length
        );
      });

    const best = matches[0];

    if (!best) {
      continue;
    }

    /*
      Aynı satır birden fazla yurtla eşleşiyorsa
      şehir bilgisi ve en uzun isim önceliklidir.
    */
    candidates.push({
      rawName: best.dormitory.name,
      capacity: totalCapacity,
      serviceCapacity,
      capacityYear: source.year,
      sourceName: source.name,
      sourceUrl: source.url,
      detectedCity: best.dormitory.city,
      exactDormitoryId:
        best.dormitory.id,
      exactDormitoryName:
        best.dormitory.name,
      context: line,
    });
  }

  /*
    Aynı belge içinde aynı yurt birkaç işletme
    satırında bulunabilir. Aynı yurdu tek kayda indir.
  */
  const unique = new Map();

  for (const candidate of candidates) {
    const current = unique.get(
      candidate.exactDormitoryId
    );

    if (
      !current ||
      candidate.capacity >
        current.capacity
    ) {
      unique.set(
        candidate.exactDormitoryId,
        candidate
      );
    }
  }

  return [...unique.values()];
}

function findBestMatch(candidate, dormitories) {
  const ranked = dormitories
    .map((dormitory) => ({
      dormitory,
      score: similarity(
        candidate.rawName,
        dormitory.name
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0] ?? null;
  const second = ranked[1] ?? null;

  if (!best) {
    return {
      accepted: false,
      best: null,
      alternatives: [],
    };
  }

  const difference =
    best.score - (second?.score ?? 0);

  return {
    accepted:
      best.score >= 0.88 &&
      difference >= 0.15,
    best,
    alternatives: ranked
      .slice(1, 4)
      .map((item) => ({
        dormitoryId: item.dormitory.id,
        dormitoryName: item.dormitory.name,
        city: item.dormitory.city,
        score: Number(item.score.toFixed(3)),
      })),
  };
}

async function main() {
  const sourceData = JSON.parse(
    fs.readFileSync(SOURCES_PATH, "utf8")
  );

  const dormitoryData = JSON.parse(
    fs.readFileSync(DORMITORIES_PATH, "utf8")
  );

  const capacityData = JSON.parse(
    fs.readFileSync(CAPACITIES_PATH, "utf8")
  );

  const sources = sourceData.sources.filter(
    (source) => source.enabled
  );

  const candidates = [];
  const sourceErrors = [];

  for (const source of sources) {
    console.log(`\nKaynak: ${source.name}`);

    try {
      const filePath = await downloadFile(source);

      if (source.type !== "pdf") {
        console.log("PDF olmayan kaynak şimdilik atlandı.");
        continue;
      }

      const text = await readPdf(filePath);
            const parsed = parseCandidates(
        text,
        source,
        dormitoryData.dormitories
      );

      console.log(
        "Bulunan kapasite adayı:",
        parsed.length
      );

      candidates.push(...parsed);
    } catch (error) {
      console.error(
        "Kaynak işlenemedi:",
        error.message
      );

      sourceErrors.push({
        sourceId: source.id,
        message: error.message,
      });
    }
  }

  const accepted = [];
  const review = [];

  for (const candidate of candidates) {
    const exactDormitory =
      candidate.exactDormitoryId
        ? dormitoryData.dormitories.find(
            (item) =>
              item.id ===
              candidate.exactDormitoryId
          )
        : null;

    const result = exactDormitory
      ? {
          accepted: true,
          best: {
            dormitory: exactDormitory,
            score: 1,
          },
          alternatives: [],
        }
      : findBestMatch(
          candidate,
          dormitoryData.dormitories
        );

    if (result.accepted && result.best) {
      accepted.push({
        dormitoryId:
          result.best.dormitory.id,
        dormitoryName:
          result.best.dormitory.name,
        city:
          result.best.dormitory.city,
        capacity:
          candidate.capacity,
        capacityYear:
          candidate.capacityYear,
        sourceName:
          candidate.sourceName,
        sourceUrl:
          candidate.sourceUrl,
        verifiedAt:
          new Date()
            .toISOString()
            .slice(0, 10),
        matchScore: Number(
          result.best.score.toFixed(3)
        ),
        rawName:
          candidate.rawName,
      });
    } else {
      review.push({
        ...candidate,
        suggestedMatch: result.best
          ? {
              dormitoryId:
                result.best.dormitory.id,
              dormitoryName:
                result.best.dormitory.name,
              city:
                result.best.dormitory.city,
              score: Number(
                result.best.score.toFixed(3)
              ),
            }
          : null,
        alternatives:
          result.alternatives,
      });
    }
  }

  const newestByDormitory = new Map();

  for (const record of accepted) {
    const current = newestByDormitory.get(
      record.dormitoryId
    );

    if (
      !current ||
      record.capacityYear > current.capacityYear ||
      (
        record.capacityYear === current.capacityYear &&
        record.matchScore > current.matchScore
      )
    ) {
      newestByDormitory.set(
        record.dormitoryId,
        record
      );
    }
  }

  const existing = new Map(
    (capacityData.records ?? []).map((record) => [
      record.dormitoryId,
      record,
    ])
  );

  let inserted = 0;
  let updated = 0;
  let kept = 0;

  for (const record of newestByDormitory.values()) {
    const current = existing.get(
      record.dormitoryId
    );

    const nextRecord = {
      dormitoryId:
        record.dormitoryId,
      capacity:
        record.capacity,
      capacityYear:
        record.capacityYear,
      sourceName:
        record.sourceName,
      sourceUrl:
        record.sourceUrl,
      verifiedAt:
        record.verifiedAt,
    };

    if (!current) {
      existing.set(
        record.dormitoryId,
        nextRecord
      );

      inserted++;
      continue;
    }

    if (
      (record.capacityYear ?? 0) >
      (current.capacityYear ?? 0)
    ) {
      existing.set(
        record.dormitoryId,
        nextRecord
      );

      updated++;
    } else {
      kept++;
    }
  }

  capacityData.records = [
    ...existing.values(),
  ].sort((a, b) =>
    a.dormitoryId.localeCompare(
      b.dormitoryId,
      "tr"
    )
  );

  capacityData.metadata = {
    ...capacityData.metadata,
    lastAutomaticImportAt:
      new Date().toISOString(),
    recordCount:
      capacityData.records.length,
  };

  fs.writeFileSync(
    CAPACITIES_PATH,
    JSON.stringify(
      capacityData,
      null,
      2
    ),
    "utf8"
  );

  fs.writeFileSync(
    REVIEW_PATH,
    JSON.stringify(
      {
        generatedAt:
          new Date().toISOString(),
        candidateCount:
          candidates.length,
        automaticallyAcceptedCount:
          newestByDormitory.size,
        inserted,
        updated,
        kept,
        reviewCount:
          review.length,
        sourceErrors,
        review,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log("");
  console.log("========================================");
  console.log("OTOMATİK KAPASİTE TARAMASI TAMAMLANDI");
  console.log("Toplam aday:", candidates.length);
  console.log(
    "Güvenli eşleşme:",
    newestByDormitory.size
  );
  console.log("Yeni eklenen:", inserted);
  console.log("Güncellenen:", updated);
  console.log("Korunan:", kept);
  console.log(
    "İnceleme bekleyen:",
    review.length
  );
  console.log(
    "Toplam kapasite kaydı:",
    capacityData.records.length
  );
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
