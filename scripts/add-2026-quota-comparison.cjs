const fs = require("fs");
const path = require("path");

const file = path.join(
  process.cwd(),
  "src",
  "data",
  "programs.json"
);

const backup = path.join(
  process.cwd(),
  "src",
  "data",
  `programs-before-quota-comparison-${Date.now()}.json`
);

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

if (!fs.existsSync(file)) {
  throw new Error(`Dosya bulunamadı: ${file}`);
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));

if (!Array.isArray(data.programs)) {
  throw new Error("programs alanı dizi değil.");
}

fs.copyFileSync(file, backup);

let increased = 0;
let decreased = 0;
let unchanged = 0;
let newPrograms = 0;
let removedPrograms = 0;
let unknown = 0;

for (const program of data.programs) {
  const quota2025 = toNumber(
    program.history?.["2025"]?.generalQuota
  );

  const quota2026 = toNumber(
    program.guide2026?.generalQuota
  );

  let status = "unknown";
  let difference = null;
  let percentage = null;
  let label = "Karşılaştırma yapılamadı";

  if (
    program.isActive2026 === true &&
    quota2026 !== null &&
    quota2025 === null
  ) {
    status = "new";
    label = "Yeni açılan program";
    newPrograms += 1;
  } else if (
    program.isActive2026 === false &&
    quota2025 !== null
  ) {
    status = "removed";
    difference = -quota2025;
    percentage = -100;
    label = "2026 kılavuzunda yer almıyor";
    removedPrograms += 1;
  } else if (
    quota2025 !== null &&
    quota2026 !== null
  ) {
    difference = quota2026 - quota2025;

    if (quota2025 > 0) {
      percentage = Number(
        ((difference / quota2025) * 100).toFixed(2)
      );
    }

    if (difference > 0) {
      status = "increased";
      label = `${difference} kontenjan arttı`;
      increased += 1;
    } else if (difference < 0) {
      status = "decreased";
      label = `${Math.abs(difference)} kontenjan azaldı`;
      decreased += 1;
    } else {
      status = "unchanged";
      label = "Kontenjan değişmedi";
      unchanged += 1;
    }
  } else {
    unknown += 1;
  }

  program.quotaComparison2026 = {
    quota2025,
    quota2026,
    difference,
    percentage,
    status,
    label,
  };
}

data.metadata = {
  ...(data.metadata || {}),

  quotaComparison2026: {
    increased,
    decreased,
    unchanged,
    newPrograms,
    removedPrograms,
    unknown,
  },
};

fs.writeFileSync(
  file,
  JSON.stringify(data, null, 2),
  "utf8"
);

console.log("");
console.log("======================================");
console.log("KONTENJAN KARŞILAŞTIRMASI EKLENDİ");
console.log("======================================");
console.log("Kontenjanı artan:", increased);
console.log("Kontenjanı azalan:", decreased);
console.log("Değişmeyen:", unchanged);
console.log("Yeni program:", newPrograms);
console.log("2026'da bulunmayan:", removedPrograms);
console.log("Karşılaştırılamayan:", unknown);
console.log("");
console.log("Yedek:", backup);
console.log("Çıktı:", file);
console.log("======================================");
