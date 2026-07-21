import data from "./dormitory-university-matches.json";

export type DormitoryUniversityMatch = {
  dormitoryId: string;
  dormitoryName: string;
  city: string;
  district: string | null;
  nearestUniversities: {
    universityId: string;
    universityName: string;
    city: string;
    district: string | null;
    relation:
      | "Koordinatla hesaplandı"
      | "Aynı ilçe"
      | "Şehir eşleşmesi";
    distanceKm: number | null;
    score: number;
  }[];
};

export const dormitoryMatches =
  data.matches as DormitoryUniversityMatch[];

export const dormitoryMatchMap = new Map(
  dormitoryMatches.map((match) => [
    match.dormitoryId,
    match,
  ])
);
