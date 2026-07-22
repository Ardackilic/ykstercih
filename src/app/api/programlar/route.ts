import { NextRequest, NextResponse } from "next/server";
import data from "@/data/programs.json";

type HistoryItem = {
  ranking: number | null;
  baseScore: number | null;
  generalQuota: number | null;
};

type Program = {
  code: string;
  programName: string;
  universityName: string;
  universityType: string;
  academicUnit: string | null;
  level: string;
  duration: number | null;
  scoreType: string;
  language: string;
  scholarship: string | null;
  latestResultYear: number | null;
  latestRanking: number | null;
  latestBaseScore: number | null;
  city: string | null;
  district: string | null;
  isActive2025?: boolean;
  searchText?: string;
  history: Record<string, HistoryItem>;
};

type SearchFields = {
  code: string;
  programName: string;
  universityName: string;
  academicUnit: string;
  city: string;
  district: string;
  universityType: string;
  scoreType: string;
  level: string;
  language: string;
  scholarship: string;
  all: string;
};

type IndexedProgram = {
  program: Program;
  fields: SearchFields;
  tokens: string[];
};

type ParsedQuery = {
  original: string;
  normalized: string;
  searchText: string;
  tokens: string[];
  scoreType: string;
  universityType: string;
  level: string;
  language: string;
  ranking: number;
  categoryKeywords: string[];
};

type ScoredProgram = {
  program: Program;
  score: number;
};

const programs = data.programs as Program[];

const TURKEY_CITIES = [
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
  "Hakkâri",
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
] as const;

const cities = [...TURKEY_CITIES];

const programNames = Array.from(
  new Set(
    programs
      .filter((program) => program.isActive2025 !== false)
      .map((program) => program.programName)
      .filter(Boolean)
  )
).sort((left, right) =>
  left.localeCompare(right, "tr-TR")
);

const PHRASE_ALIASES: Record<string, string> = {
  odtu: "orta dogu teknik universitesi",
  metu: "orta dogu teknik universitesi",
  itu: "istanbul teknik universitesi",
  ytu: "yildiz teknik universitesi",
  bogazici: "bogazici universitesi",
  hacettepe: "hacettepe universitesi",
  marmara: "marmara universitesi",
  ege: "ege universitesi",

  pdr: "rehberlik ve psikolojik danismanlik",
  ftr: "fizyoterapi ve rehabilitasyon",
  ybs: "yonetim bilisim sistemleri",
  ceko: "calisma ekonomisi ve endustri iliskileri",
  besyo: "beden egitimi ve spor",
  iibf: "iktisadi ve idari bilimler fakultesi",

  paramedik: "ilk ve acil yardim",
  "ilk yardim": "ilk ve acil yardim",
  "acil yardim": "ilk ve acil yardim",
  "bilgisayar muh": "bilgisayar muhendisligi",
  "yazilim muh": "yazilim muhendisligi",
  "elektrik elektronik": "elektrik elektronik muhendisligi",
  "psikolojik danismanlik":
    "rehberlik ve psikolojik danismanlik",
};

const CATEGORY_ALIASES: Record<string, string[]> = {
  saglik: [
    "hemsirelik",
    "tip",
    "dis hekimligi",
    "eczacilik",
    "fizyoterapi",
    "beslenme ve diyetetik",
    "ilk ve acil yardim",
    "anestezi",
    "tibbi goruntuleme",
    "tibbi laboratuvar",
    "odyoloji",
    "ergoterapi",
    "ebelik",
  ],
  muhendislik: [
    "muhendisligi",
    "muhendislik",
    "mimarlik",
  ],
  bilisim: [
    "bilgisayar",
    "yazilim",
    "bilisim",
    "yapay zeka",
    "yonetim bilisim",
    "siber guvenlik",
    "bilgi guvenligi",
  ],
  ogretmenlik: [
    "ogretmenligi",
    "egitim fakultesi",
  ],
  hukuk: ["hukuk"],
  havacilik: [
    "havacilik",
    "ucak",
    "pilotaj",
    "hava lojistigi",
  ],
  denizcilik: [
    "denizcilik",
    "gemi",
    "deniz ulastirma",
  ],
  spor: [
    "spor yoneticiligi",
    "antrenorluk",
    "rekreasyon",
    "beden egitimi",
  ],
  sosyal: [
    "psikoloji",
    "sosyoloji",
    "sosyal hizmet",
    "felsefe",
    "tarih",
  ],
};

const STOP_WORDS = new Set([
  "bana",
  "icin",
  "ile",
  "hangi",
  "hangileri",
  "nedir",
  "neler",
  "ne",
  "gelir",
  "gelen",
  "alan",
  "alir",
  "bolum",
  "bolumu",
  "bolumler",
  "bolumleri",
  "program",
  "programlar",
  "programlari",
  "universite",
  "universiteler",
  "universitesi",
  "tercih",
  "tercihler",
  "yaklasik",
  "civari",
  "civarinda",
  "siralama",
  "siralamayla",
  "puan",
  "puani",
  "gore",
  "olan",
  "bul",
  "ara",
]);

const indexedPrograms: IndexedProgram[] = programs.map(
  (program) => {
    const fields: SearchFields = {
      code: normalize(program.code),
      programName: normalize(program.programName),
      universityName: normalize(program.universityName),
      academicUnit: normalize(program.academicUnit ?? ""),
      city: normalize(program.city ?? ""),
      district: normalize(program.district ?? ""),
      universityType: normalize(program.universityType),
      scoreType: normalize(program.scoreType),
      level: normalize(program.level),
      language: normalize(program.language),
      scholarship: normalize(program.scholarship ?? ""),
      all: normalize(
        program.searchText ??
          [
            program.code,
            program.programName,
            program.universityName,
            program.academicUnit,
            program.city,
            program.district,
            program.scoreType,
            program.level,
            program.language,
            program.universityType,
            program.scholarship,
          ]
            .filter(Boolean)
            .join(" ")
      ),
    };

    return {
      program,
      fields,
      tokens: Array.from(
        new Set(fields.all.split(" ").filter(Boolean))
      ),
    };
  }
);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const parsed = parseQuery(params.get("q") ?? "");

  const explicitScoreType = normalizeScoreType(
    params.get("puanTuru") ?? ""
  );

  const explicitUniversityType =
    params.get("universiteTuru") ?? "";

  const explicitLevel = params.get("seviye") ?? "";

  const explicitCity = params.get("il") ?? "";

  const explicitProgram =
    params.get("bolum") ?? "";

  const explicitTeachingType =
    params.get("ogretimSekli") ?? "";

  const explicitRanking = parsePositiveNumber(
    params.get("siralama") ?? ""
  );

  const scoreType =
    explicitScoreType || parsed.scoreType;

  const universityType =
    explicitUniversityType || parsed.universityType;

  const level =
    explicitLevel || parsed.level;

  const ranking =
    explicitRanking || parsed.ranking;

  const page = Math.max(
    1,
    Number(params.get("sayfa") ?? 1)
  );

  const limit = Math.min(
    50,
    Math.max(
      5,
      Number(params.get("limit") ?? 20)
    )
  );

  const scoredPrograms: ScoredProgram[] = [];

  for (const indexed of indexedPrograms) {
    const { program, fields } = indexed;

    if (
      program.isActive2025 === false
    ) {
      continue;
    }

    if (
      scoreType &&
      normalizeScoreType(program.scoreType) !==
        scoreType
    ) {
      continue;
    }

    if (
      universityType &&
      normalize(program.universityType) !==
        normalize(universityType)
    ) {
      continue;
    }

    if (
      level &&
      normalize(program.level) !==
        normalize(level)
    ) {
      continue;
    }

    if (
      explicitCity &&
      normalize(program.city ?? "") !==
        normalize(explicitCity)
    ) {
      continue;
    }

    if (
      explicitProgram &&
      normalize(program.programName) !==
        normalize(explicitProgram)
    ) {
      continue;
    }

    if (
      explicitTeachingType &&
      getTeachingType(program) !==
        explicitTeachingType
    ) {
      continue;
    }

    if (
      parsed.language &&
      !fields.language.includes(parsed.language)
    ) {
      continue;
    }

    if (
      parsed.categoryKeywords.length > 0 &&
      !parsed.categoryKeywords.some((keyword) =>
        fields.all.includes(keyword)
      )
    ) {
      continue;
    }

    const searchScore = calculateSearchScore(
      indexed,
      parsed.searchText,
      parsed.tokens
    );

    if (
      parsed.tokens.length > 0 &&
      searchScore === null
    ) {
      continue;
    }

    let score = searchScore ?? 0;

    if (
      ranking > 0 &&
      program.latestRanking !== null
    ) {
      const distance = Math.abs(
        program.latestRanking - ranking
      );

      const ratio = Math.min(
        distance / Math.max(ranking, 1),
        2
      );

      score += Math.round(
        Math.max(0, 180 - ratio * 110)
      );
    }

    scoredPrograms.push({
      program,
      score,
    });
  }

  scoredPrograms.sort((left, right) => {
    const scoreDifference =
      right.score - left.score;

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    if (ranking > 0) {
      const leftRanking =
        left.program.latestRanking ??
        Number.MAX_SAFE_INTEGER;

      const rightRanking =
        right.program.latestRanking ??
        Number.MAX_SAFE_INTEGER;

      return (
        Math.abs(leftRanking - ranking) -
        Math.abs(rightRanking - ranking)
      );
    }

    return (
      (left.program.latestRanking ??
        Number.MAX_SAFE_INTEGER) -
      (right.program.latestRanking ??
        Number.MAX_SAFE_INTEGER)
    );
  });

  const total = scoredPrograms.length;
  const totalPages = Math.max(
    1,
    Math.ceil(total / limit)
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const start =
    (safePage - 1) * limit;

  const results = scoredPrograms
    .slice(start, start + limit)
    .map(({ program, score }) => ({
      code: program.code,
      programName: program.programName,
      universityName: program.universityName,
      universityType: program.universityType,
      academicUnit: program.academicUnit,
      level: program.level,
      duration: program.duration,
      scoreType: program.scoreType,
      language: program.language,
      scholarship: program.scholarship,
      latestResultYear: program.latestResultYear,
      latestRanking: program.latestRanking,
      latestBaseScore: program.latestBaseScore,
      latestQuota:
        program.latestResultYear !== null
          ? program.history[
              String(program.latestResultYear)
            ]?.generalQuota ?? null
          : null,
      city: program.city,
      district: program.district,
      searchScore: score,
      history: program.history,
    }));

  return NextResponse.json({
    results,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
    filterOptions: {
      cities,
      programNames,
    },
    search: {
      originalQuery: parsed.original,
      normalizedQuery: parsed.normalized,
      effectiveSearchText: parsed.searchText,
      tokens: parsed.tokens,
      detectedFilters: {
        scoreType,
        universityType,
        level,
        city: explicitCity,
        programName: explicitProgram,
        teachingType: explicitTeachingType,
        language: parsed.language,
        ranking,
        categories:
          parsed.categoryKeywords,
      },
    },
  });
}

function getTeachingType(program: Program) {
  const educationText = normalize(
    `${program.programName} ${program.academicUnit ?? ""}`
  );

  if (educationText.includes("acikogretim")) {
    return "acikogretim";
  }

  if (educationText.includes("uzaktan ogretim")) {
    return "uzaktan";
  }

  return "orgun";
}

function parseQuery(rawQuery: string): ParsedQuery {
  const original = rawQuery.trim();
  let normalized = normalize(original);

  normalized = applyPhraseAliases(
    normalized
  );

  const rankingResult =
    extractRanking(normalized);

  normalized = rankingResult.remainingText;

  let scoreType = "";
  let universityType = "";
  let level = "";
  let language = "";

  const scoreTypePatterns: Array<
    [RegExp, string]
  > = [
    [/\btyt\b/g, "TYT"],
    [/\bsayisal\b|\bsay\b/g, "SAY"],
    [/\besit agirlik\b|\bea\b/g, "EA"],
    [/\bsozel\b|\bsoz\b/g, "SÖZ"],
    [/\bdil\b/g, "DİL"],
  ];

  for (const [pattern, value] of scoreTypePatterns) {
    if (pattern.test(normalized)) {
      scoreType = value;
      normalized = normalized.replace(
        pattern,
        " "
      );
      break;
    }
  }

  const universityPatterns: Array<
    [RegExp, string]
  > = [
    [/\bdevlet\b/g, "Devlet"],
    [/\bvakif\b|\bozel universite\b/g, "Vakıf"],
    [/\bkktc\b/g, "KKTC"],
  ];

  for (
    const [pattern, value] of
    universityPatterns
  ) {
    if (pattern.test(normalized)) {
      universityType = value;
      normalized = normalized.replace(
        pattern,
        " "
      );
      break;
    }
  }

  if (
    /\b2 yillik\b|\biki yillik\b|\bon lisans\b|\bonlisans\b/g.test(
      normalized
    )
  ) {
    level = "Ön Lisans";
    normalized = normalized.replace(
      /\b2 yillik\b|\biki yillik\b|\bon lisans\b|\bonlisans\b/g,
      " "
    );
  } else if (
    /\b4 yillik\b|\bdort yillik\b|\blisans\b/g.test(
      normalized
    )
  ) {
    level = "Lisans";
    normalized = normalized.replace(
      /\b4 yillik\b|\bdort yillik\b|\blisans\b/g,
      " "
    );
  }

  if (
    /\bingilizce\b|\benglish\b/g.test(
      normalized
    )
  ) {
    language = "ingilizce";
    normalized = normalized.replace(
      /\bingilizce\b|\benglish\b/g,
      " "
    );
  } else if (
    /\bturkce\b/g.test(normalized)
  ) {
    language = "turkce";
    normalized = normalized.replace(
      /\bturkce\b/g,
      " "
    );
  }

  const categoryKeywords: string[] = [];

  for (
    const [category, keywords] of
    Object.entries(CATEGORY_ALIASES)
  ) {
    const pattern = new RegExp(
      `\\b${escapeRegExp(category)}\\b`,
      "g"
    );

    if (pattern.test(normalized)) {
      categoryKeywords.push(
        ...keywords.map(normalize)
      );

      normalized = normalized.replace(
        pattern,
        " "
      );
    }
  }

  const tokens = Array.from(
    new Set(
      normalized
        .split(" ")
        .map((token) => token.trim())
        .filter(
          (token) =>
            token.length > 0 &&
            !STOP_WORDS.has(token)
        )
    )
  );

  return {
    original,
    normalized: normalize(original),
    searchText: tokens.join(" "),
    tokens,
    scoreType,
    universityType,
    level,
    language,
    ranking: rankingResult.ranking,
    categoryKeywords: Array.from(
      new Set(categoryKeywords)
    ),
  };
}

function applyPhraseAliases(value: string) {
  let result = value;

  const aliases = Object.entries(
    PHRASE_ALIASES
  ).sort(
    ([left], [right]) =>
      right.length - left.length
  );

  for (
    const [alias, replacement] of aliases
  ) {
    const pattern = new RegExp(
      `\\b${escapeRegExp(alias)}\\b`,
      "g"
    );

    result = result.replace(
      pattern,
      normalize(replacement)
    );
  }

  return result
    .replace(/\s+/g, " ")
    .trim();
}

function extractRanking(value: string) {
  let text = value;
  let ranking = 0;

  const numericPatterns = [
    /\b(\d{1,3}(?:[.,]\d{3})+)\b/,
    /\b(\d+(?:[.,]\d+)?)\s*k\b/,
    /\b(\d+(?:[.,]\d+)?)\s*bin\b/,
  ];

  const formattedMatch =
    text.match(numericPatterns[0]);

  if (formattedMatch) {
    ranking = Number(
      formattedMatch[1].replace(
        /[.,]/g,
        ""
      )
    );

    text = text.replace(
      formattedMatch[0],
      " "
    );
  } else {
    const kMatch =
      text.match(numericPatterns[1]);

    if (kMatch) {
      ranking = Math.round(
        Number(
          kMatch[1].replace(",", ".")
        ) * 1000
      );

      text = text.replace(
        kMatch[0],
        " "
      );
    } else {
      const binMatch =
        text.match(numericPatterns[2]);

      if (binMatch) {
        ranking = Math.round(
          Number(
            binMatch[1].replace(",", ".")
          ) * 1000
        );

        text = text.replace(
          binMatch[0],
          " "
        );
      }
    }
  }

  return {
    ranking:
      Number.isFinite(ranking) &&
      ranking > 0
        ? ranking
        : 0,
    remainingText: text
      .replace(/\s+/g, " ")
      .trim(),
  };
}

function calculateSearchScore(
  indexed: IndexedProgram,
  fullQuery: string,
  queryTokens: string[]
): number | null {
  if (queryTokens.length === 0) {
    return 0;
  }

  const { fields, tokens } = indexed;
  let score = 0;

  if (fields.code === fullQuery) {
    score += 700;
  }

  if (
    fullQuery &&
    fields.programName === fullQuery
  ) {
    score += 500;
  }

  if (
    fullQuery &&
    fields.universityName === fullQuery
  ) {
    score += 470;
  }

  if (
    fullQuery &&
    fields.district === fullQuery
  ) {
    score += 390;
  }

  if (
    fullQuery &&
    fields.city === fullQuery
  ) {
    score += 360;
  }

  if (
    fullQuery &&
    fields.programName.startsWith(
      fullQuery
    )
  ) {
    score += 260;
  } else if (
    fullQuery &&
    fields.programName.includes(fullQuery)
  ) {
    score += 210;
  }

  if (
    fullQuery &&
    fields.universityName.includes(
      fullQuery
    )
  ) {
    score += 190;
  }

  if (
    fullQuery &&
    fields.all.includes(fullQuery)
  ) {
    score += 120;
  }

  for (const queryToken of queryTokens) {
    const tokenScore = scoreToken(
      queryToken,
      fields,
      tokens
    );

    if (tokenScore === null) {
      return null;
    }

    score += tokenScore;
  }

  const locationText =
    `${fields.city} ${fields.district}`;

  if (
    queryTokens.length > 1 &&
    queryTokens.every((token) =>
      locationText.includes(token)
    )
  ) {
    score += 300;
  }

  return score;
}

function scoreToken(
  queryToken: string,
  fields: SearchFields,
  searchableTokens: string[]
): number | null {
  if (fields.code === queryToken) {
    return 600;
  }

  const directScores = [
    getFieldScore(
      queryToken,
      fields.programName,
      125,
      100
    ),
    getFieldScore(
      queryToken,
      fields.universityName,
      115,
      92
    ),
    getFieldScore(
      queryToken,
      fields.district,
      120,
      98
    ),
    getFieldScore(
      queryToken,
      fields.city,
      112,
      92
    ),
    getFieldScore(
      queryToken,
      fields.academicUnit,
      90,
      70
    ),
    getFieldScore(
      queryToken,
      fields.language,
      70,
      54
    ),
    getFieldScore(
      queryToken,
      fields.scholarship,
      65,
      50
    ),
  ];

  const directScore = Math.max(
    0,
    ...directScores
  );

  if (directScore > 0) {
    return directScore;
  }

  if (queryToken.length <= 3) {
    return null;
  }

  let bestScore = 0;

  for (
    const candidate of searchableTokens
  ) {
    const allowed =
      getAllowedDistance(
        queryToken,
        candidate
      );

    if (allowed === 0) {
      continue;
    }

    const distance =
      levenshteinDistanceLimited(
        queryToken,
        candidate,
        allowed
      );

    if (distance > allowed) {
      continue;
    }

    const similarity =
      1 -
      distance /
        Math.max(
          queryToken.length,
          candidate.length
        );

    if (similarity < 0.7) {
      continue;
    }

    bestScore = Math.max(
      bestScore,
      Math.round(
        45 + similarity * 40
      )
    );
  }

  return bestScore > 0
    ? bestScore
    : null;
}

function getFieldScore(
  token: string,
  field: string,
  exactScore: number,
  partialScore: number
) {
  if (!field) {
    return 0;
  }

  const words = field.split(" ");

  if (words.includes(token)) {
    return exactScore;
  }

  if (
    words.some(
      (word) =>
        word.startsWith(token) ||
        token.startsWith(word)
    )
  ) {
    return partialScore;
  }

  if (field.includes(token)) {
    return Math.max(
      1,
      partialScore - 10
    );
  }

  return 0;
}

function getAllowedDistance(
  left: string,
  right: string
) {
  const shortest = Math.min(
    left.length,
    right.length
  );

  const difference = Math.abs(
    left.length - right.length
  );

  if (
    shortest <= 3 ||
    difference > 3
  ) {
    return 0;
  }

  if (shortest <= 6) {
    return 1;
  }

  if (shortest <= 10) {
    return 2;
  }

  return 3;
}

function levenshteinDistanceLimited(
  left: string,
  right: string,
  maximumDistance: number
) {
  if (left === right) {
    return 0;
  }

  if (
    Math.abs(
      left.length - right.length
    ) > maximumDistance
  ) {
    return maximumDistance + 1;
  }

  let previous = Array.from(
    {
      length: right.length + 1,
    },
    (_, index) => index
  );

  for (
    let leftIndex = 1;
    leftIndex <= left.length;
    leftIndex += 1
  ) {
    const current = [leftIndex];
    let rowMinimum = leftIndex;

    for (
      let rightIndex = 1;
      rightIndex <= right.length;
      rightIndex += 1
    ) {
      const insertion =
        current[rightIndex - 1] + 1;

      const deletion =
        previous[rightIndex] + 1;

      const substitution =
        previous[rightIndex - 1] +
        (left[leftIndex - 1] ===
        right[rightIndex - 1]
          ? 0
          : 1);

      const value = Math.min(
        insertion,
        deletion,
        substitution
      );

      current[rightIndex] = value;
      rowMinimum = Math.min(
        rowMinimum,
        value
      );
    }

    if (
      rowMinimum > maximumDistance
    ) {
      return maximumDistance + 1;
    }

    previous = current;
  }

  return previous[right.length];
}

function parsePositiveNumber(value: string) {
  const parsed = Number(
    value.replace(/[^\d]/g, "")
  );

  return Number.isFinite(parsed) &&
    parsed > 0
    ? parsed
    : 0;
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeScoreType(
  value: string
) {
  const normalized = value
    .trim()
    .toLocaleUpperCase("tr-TR");

  if (
    normalized === "DIL" ||
    normalized === "DİL"
  ) {
    return "DİL";
  }

  if (
    normalized === "SOZ" ||
    normalized === "SÖZ"
  ) {
    return "SÖZ";
  }

  return normalized;
}

function escapeRegExp(value: string) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}
