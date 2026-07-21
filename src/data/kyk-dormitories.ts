export type KykDormitory = {
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
  historicalCapacity?: number | null;
  historicalCapacityYear?: number | null;
  historicalCapacitySourceName?: string | null;
  historicalCapacitySourceUrl?: string | null;
  historicalCapacityVerified?: boolean;
  historicalCapacityLastCheckedAt?: string | null;
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
