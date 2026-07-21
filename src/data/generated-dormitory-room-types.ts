export type GeneratedDormitoryRoomType = {
  dormitoryId: string;
  roomTypes: string[];
  sourceName: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
};

export const generatedDormitoryRoomTypes:
  GeneratedDormitoryRoomType[] = [];

export const generatedDormitoryRoomTypeMap =
  new Map(
    generatedDormitoryRoomTypes.map(
      (record) => [
        record.dormitoryId,
        record,
      ]
    )
  );
