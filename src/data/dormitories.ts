export type Dormitory = {
  id: string;
  name: string;
  city: string;
  district: string;
  type: "KYK" | "Özel" | "Üniversite";
  gender: "Kız" | "Erkek" | "Karma";
  roomTypes: string[];
  capacity: number | null;
  historicalCapacity?: number | null;
  historicalCapacityYear?: number | null;
  historicalCapacitySourceName?: string | null;
  historicalCapacitySourceUrl?: string | null;
  historicalCapacityVerified?: boolean;
  historicalCapacityLastCheckedAt?: string | null;
  monthlyPrice: number | null;
  distanceToCampusKm: number | null;
  transportTime: string | null;
  bathroom: string | null;
  meal: string | null;
  internet: boolean | null;
  laundry: boolean | null;
  studyRoom: boolean | null;
  security: boolean | null;
  universityNames: string[];
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  verified: boolean;
  lastUpdated: string | null;
};

/*
  Bu kayıtlar ekran ve veri yapısını test etmek için geçici örneklerdir.
  Gerçek KYK ve özel yurt kayıtları sonraki adımda ayrı veri aktarımıyla
  eklenecektir.
*/
export const dormitories: Dormitory[] = [
  {
    id: "demo-kayseri-erkek-1",
    name: "Örnek Kayseri Erkek Öğrenci Yurdu",
    city: "Kayseri",
    district: "Kocasinan",
    type: "KYK",
    gender: "Erkek",
    roomTypes: ["4 kişilik", "6 kişilik"],
    capacity: 1200,
    monthlyPrice: null,
    distanceToCampusKm: 3.2,
    transportTime: "Toplu taşımayla yaklaşık 15 dakika",
    bathroom: "Yurt tipine göre değişebilir",
    meal: "Sabah ve akşam yemek desteği",
    internet: true,
    laundry: true,
    studyRoom: true,
    security: true,
    universityNames: ["ABDULLAH GÜL ÜNİVERSİTESİ (KAYSERİ)"],
    address: null,
    latitude: null,
    longitude: null,
    phone: null,
    sourceName: null,
    sourceUrl: null,
    verified: false,
    lastUpdated: null,
  },
  {
    id: "demo-kayseri-kiz-1",
    name: "Örnek Kayseri Kız Öğrenci Yurdu",
    city: "Kayseri",
    district: "Melikgazi",
    type: "KYK",
    gender: "Kız",
    roomTypes: ["3 kişilik", "4 kişilik"],
    capacity: 850,
    monthlyPrice: null,
    distanceToCampusKm: 4.6,
    transportTime: "Toplu taşımayla yaklaşık 20 dakika",
    bathroom: "Bazı odalarda oda içinde",
    meal: "Sabah ve akşam yemek desteği",
    internet: true,
    laundry: true,
    studyRoom: true,
    security: true,
    universityNames: ["ABDULLAH GÜL ÜNİVERSİTESİ (KAYSERİ)"],
    address: null,
    latitude: null,
    longitude: null,
    phone: null,
    sourceName: null,
    sourceUrl: null,
    verified: false,
    lastUpdated: null,
  },
  {
    id: "demo-istanbul-ozel-1",
    name: "Örnek İstanbul Öğrenci Rezidansı",
    city: "İstanbul",
    district: "Sarıyer",
    type: "Özel",
    gender: "Karma",
    roomTypes: ["1 kişilik", "2 kişilik", "3 kişilik"],
    capacity: 320,
    monthlyPrice: null,
    distanceToCampusKm: 1.1,
    transportTime: "Yürüyerek yaklaşık 15 dakika",
    bathroom: "Oda içinde",
    meal: "Kahvaltı seçeneği",
    internet: true,
    laundry: true,
    studyRoom: true,
    security: true,
    universityNames: ["İSTANBUL TEKNİK ÜNİVERSİTESİ"],
    address: null,
    latitude: null,
    longitude: null,
    phone: null,
    sourceName: null,
    sourceUrl: null,
    verified: false,
    lastUpdated: null,
  },
];
