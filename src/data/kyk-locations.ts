export type KykLocation = {
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
