export type DormitoryDetailRecord = {
  dormitoryId: string;

  roomTypes?: string[];
  roomTypeSourceName?: string;
  roomTypeSourceUrl?: string;

  bathroom?: string;
  meal?: string;
  internet?: boolean;
  laundry?: boolean;
  studyRoom?: boolean;
  security?: boolean;

  lastCheckedAt: string;
  verified: boolean;
};

/*
  Bu dosyada kapasite tutulmaz.

  Kapasite kayıtları:
  data/verified-dormitory-details/capacities.json

  Buraya yalnızca kaynakla doğrulanmış oda tipi,
  banyo, yemek ve imkân bilgileri eklenir.
*/
export const dormitoryDetails: DormitoryDetailRecord[] = [];

export const dormitoryDetailMap = new Map(
  dormitoryDetails.map((record) => [
    record.dormitoryId,
    record,
  ])
);
