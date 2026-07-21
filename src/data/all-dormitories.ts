import {
  kykDormitories,
  type KykDormitory,
} from "@/data/kyk-dormitories";

import type { Dormitory } from "@/data/dormitories";

function convertKykDormitory(
  dormitory: KykDormitory
): Dormitory {
  return {
    id: dormitory.id,
    name: dormitory.name,
    city: dormitory.city,
    district:
      dormitory.district ?? "İlçe bilgisi bulunamadı",
    type: "KYK",
    gender:
      dormitory.gender === "Belirtilmemiş"
        ? "Karma"
        : dormitory.gender,
    roomTypes: dormitory.roomTypes,
    capacity: dormitory.capacity,
    historicalCapacity:
      dormitory.historicalCapacity ?? null,
    historicalCapacityYear:
      dormitory.historicalCapacityYear ?? null,
    historicalCapacitySourceName:
      dormitory.historicalCapacitySourceName ?? null,
    historicalCapacitySourceUrl:
      dormitory.historicalCapacitySourceUrl ?? null,
    historicalCapacityVerified:
      dormitory.historicalCapacityVerified ?? false,
    historicalCapacityLastCheckedAt:
      dormitory.historicalCapacityLastCheckedAt ?? null,
    monthlyPrice: null,
    distanceToCampusKm: null,
    transportTime: null,
    bathroom: dormitory.bathroom,
    meal: dormitory.meal,
    internet: dormitory.internet,
    laundry: dormitory.laundry,
    studyRoom: dormitory.studyRoom,
    security: dormitory.security,
    universityNames: [],
    address: dormitory.address,
    latitude: dormitory.latitude,
    longitude: dormitory.longitude,
    phone: dormitory.phone,
    sourceName: dormitory.sourceName,
    sourceUrl: dormitory.sourceUrl,
    verified: dormitory.verified,
    lastUpdated: dormitory.lastCheckedAt,
  };
}

export const allDormitories: Dormitory[] =
  kykDormitories.map(convertKykDormitory);
