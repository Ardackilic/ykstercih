export type SeoProgramPage = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  intro: string;
  scoreType?: string;
  minRanking?: number;
  maxRanking?: number;
  programKeywords?: string[];
  level?: "Lisans" | "Ön Lisans";
  category: string;
  searchQuestion: string;
  tips: string[];
};

export const seoProgramPages: SeoProgramPage[] = [
  {
    slug: "say-50-bin-ile-alan-bolumler",
    title: "SAY 50 Bin ile Alan Bölümler ve Üniversiteler",
    shortTitle: "SAY 50 bin ile alan bölümler",
    description:
      "2025 yerleştirme sonuçlarına göre SAY 35-65 bin başarı sırası aralığında öğrenci alan üniversite programlarını karşılaştır.",
    intro:
      "SAY başarı sırası yaklaşık 50 bin olan adaylar için geçen yıl 35 bin ile 65 bin arasında kapatan programları bir araya getirdik. Liste 2025 yerleştirme sonuçlarına dayanır ve 2026 tercih döneminde araştırma amacıyla kullanılabilir.",
    scoreType: "SAY",
    minRanking: 35000,
    maxRanking: 65000,
    level: "Lisans",
    category: "SAY",
    searchQuestion: "SAY 50 bin sıralama ile hangi bölümler gelir?",
    tips: [
      "Sadece geçen yılın sırasına bakarak kesin yerleşme tahmini yapma.",
      "Kontenjan değişimlerini ve programın son yıllardaki sıralama eğilimini incele.",
      "Listenin üstüne zor, ortasına yakın, altına daha güvenli tercihler yerleştir.",
    ],
  },
  {
    slug: "say-100-bin-ile-alan-bolumler",
    title: "SAY 100 Bin ile Alan Bölümler ve Üniversiteler",
    shortTitle: "SAY 100 bin ile alan bölümler",
    description:
      "2025 verilerine göre SAY 75-130 bin başarı sırası aralığında öğrenci alan lisans programlarını incele.",
    intro:
      "SAY sıralaması yaklaşık 100 bin olan adayların değerlendirebileceği programları, geçen yıl 75 bin ile 130 bin arasında kapanan seçeneklerden oluşturduk.",
    scoreType: "SAY",
    minRanking: 75000,
    maxRanking: 130000,
    level: "Lisans",
    category: "SAY",
    searchQuestion: "SAY 100 bin sıralama ile hangi bölümler tercih edilebilir?",
    tips: [
      "Mühendislik programlarında başarı sırası barajlarını ayrıca kontrol et.",
      "Eğitim dili ve hazırlık sınıfı bilgilerini incele.",
      "Şehir, barınma ve ulaşım giderlerini tercih öncesinde araştır.",
    ],
  },
  {
    slug: "ea-100-bin-ile-alan-bolumler",
    title: "EA 100 Bin ile Alan Bölümler ve Üniversiteler",
    shortTitle: "EA 100 bin ile alan bölümler",
    description:
      "2025 sonuçlarına göre EA 70-140 bin başarı sırası aralığında öğrenci alan programları karşılaştır.",
    intro:
      "EA sıralaması yaklaşık 100 bin olan adaylar için geçen yıl 70 bin ile 140 bin arasında öğrenci alan lisans programlarını listeledik.",
    scoreType: "EA",
    minRanking: 70000,
    maxRanking: 140000,
    level: "Lisans",
    category: "EA",
    searchQuestion: "EA 100 bin sıralama ile hangi bölümler gelir?",
    tips: [
      "Hukuk gibi başarı sırası koşulu bulunan programların güncel barajlarını kontrol et.",
      "Vakıf üniversitelerinde burs ve indirim oranlarını dikkatle incele.",
      "Programın staj, çift ana dal ve yabancı dil olanaklarını karşılaştır.",
    ],
  },
  {
    slug: "tyt-300-bin-ile-alan-bolumler",
    title: "TYT 300 Bin ile Alan 2 Yıllık Bölümler",
    shortTitle: "TYT 300 bin ile alan bölümler",
    description:
      "2025 verilerine göre TYT 200-400 bin başarı sırası aralığında öğrenci alan ön lisans programlarını incele.",
    intro:
      "TYT sıralaması yaklaşık 300 bin olan adaylar için geçen yıl 200 bin ile 400 bin arasında kapanan iki yıllık programları bir araya getirdik.",
    scoreType: "TYT",
    minRanking: 200000,
    maxRanking: 400000,
    level: "Ön Lisans",
    category: "TYT",
    searchQuestion: "TYT 300 bin sıralama ile hangi 2 yıllık bölümler gelir?",
    tips: [
      "Programın uygulama, staj ve iş yeri eğitimi olanaklarını araştır.",
      "DGS ile geçiş yapılabilen lisans programlarını incele.",
      "İkinci öğretim, ücret ve özel koşulları güncel kılavuzdan doğrula.",
    ],
  },
  {
    slug: "tyt-500-bin-ile-alan-bolumler",
    title: "TYT 500 Bin ile Alan 2 Yıllık Bölümler",
    shortTitle: "TYT 500 bin ile alan bölümler",
    description:
      "2025 sonuçlarına göre TYT 350-650 bin başarı sırası aralığında öğrenci alan ön lisans programlarını karşılaştır.",
    intro:
      "TYT sıralaması yaklaşık 500 bin olan adayların araştırabileceği iki yıllık programları geçen yılki başarı sıralarına göre listeledik.",
    scoreType: "TYT",
    minRanking: 350000,
    maxRanking: 650000,
    level: "Ön Lisans",
    category: "TYT",
    searchQuestion: "TYT 500 bin sıralama ile hangi bölümler tercih edilebilir?",
    tips: [
      "Sadece bölüm adına değil ders planına ve uygulama imkânlarına bak.",
      "Mezunların çalışabileceği sektörleri araştır.",
      "Yerleşmeyeceğin bir programı yalnızca listeyi doldurmak için yazma.",
    ],
  },
  {
    slug: "soz-100-bin-ile-alan-bolumler",
    title: "SÖZ 100 Bin ile Alan Bölümler",
    shortTitle: "SÖZ 100 bin ile alan bölümler",
    description:
      "2025 sonuçlarına göre SÖZ 65-140 bin aralığında öğrenci alan lisans programlarını incele.",
    intro:
      "SÖZ sıralaması yaklaşık 100 bin olan adaylar için geçen yıl 65 bin ile 140 bin arasında kapanan programları hazırladık.",
    scoreType: "SÖZ",
    minRanking: 65000,
    maxRanking: 140000,
    level: "Lisans",
    category: "SÖZ",
    searchQuestion: "SÖZ 100 bin sıralama ile hangi bölümler gelir?",
    tips: [
      "Öğretmenlik programlarının güncel başarı sırası koşullarını kontrol et.",
      "Programın akademik içeriği ile kariyer hedefinin uyumlu olduğundan emin ol.",
      "Üniversitenin uygulama, staj ve değişim programlarını incele.",
    ],
  },
  {
    slug: "bilgisayar-muhendisligi-taban-siralamalari",
    title: "Bilgisayar Mühendisliği Taban Puanları ve Başarı Sıralamaları",
    shortTitle: "Bilgisayar Mühendisliği sıralamaları",
    description:
      "Bilgisayar Mühendisliği programlarının 2025 taban puanlarını, başarı sıralarını ve kontenjanlarını karşılaştır.",
    intro:
      "Türkiye'deki Bilgisayar Mühendisliği programlarını 2025 yerleştirme sonuçlarına göre sıraladık. Devlet, vakıf, burslu ve farklı eğitim dili seçeneklerini karşılaştırabilirsin.",
    programKeywords: ["Bilgisayar Mühendisliği"],
    level: "Lisans",
    category: "Bölüm",
    searchQuestion: "Bilgisayar Mühendisliği kaç binle alıyor?",
    tips: [
      "Eğitim dilini ve hazırlık sınıfı koşullarını kontrol et.",
      "MÜDEK gibi akreditasyon bilgilerini incele.",
      "Üniversitenin laboratuvar, staj ve sektör bağlantılarını araştır.",
    ],
  },
  {
    slug: "hemsirelik-taban-siralamalari",
    title: "Hemşirelik Taban Puanları ve Başarı Sıralamaları",
    shortTitle: "Hemşirelik sıralamaları",
    description:
      "Hemşirelik programlarının 2025 başarı sıralarını, taban puanlarını ve kontenjanlarını karşılaştır.",
    intro:
      "Hemşirelik programlarını 2025 yerleştirme sonuçlarına göre başarı sırasına dizdik. Üniversite, şehir ve kontenjan bilgilerini birlikte inceleyebilirsin.",
    programKeywords: ["Hemşirelik"],
    level: "Lisans",
    category: "Bölüm",
    searchQuestion: "Hemşirelik bölümü kaç binle alıyor?",
    tips: [
      "Uygulama hastanesi ve klinik eğitim olanaklarını araştır.",
      "Programın özel sağlık koşullarını güncel kılavuzdan kontrol et.",
      "Şehirdeki barınma ve ulaşım seçeneklerini değerlendirmeye kat.",
    ],
  },
  {
    slug: "psikoloji-taban-siralamalari",
    title: "Psikoloji Taban Puanları ve Başarı Sıralamaları",
    shortTitle: "Psikoloji sıralamaları",
    description:
      "Psikoloji programlarının 2025 taban puanlarını, başarı sıralarını, burs ve üniversite seçeneklerini incele.",
    intro:
      "Psikoloji programlarını 2025 yerleştirme sonuçlarına göre karşılaştır. Devlet ve vakıf üniversitelerindeki programların başarı sırası farklılıklarını görebilirsin.",
    programKeywords: ["Psikoloji"],
    level: "Lisans",
    category: "Bölüm",
    searchQuestion: "Psikoloji bölümü kaç binle alıyor?",
    tips: [
      "Programın eğitim dilini ve akademik kadrosunu incele.",
      "Vakıf üniversitelerinde bursun devam koşullarını kontrol et.",
      "Lisans eğitimi sonrasındaki uzmanlaşma ve yüksek lisans gereksinimlerini araştır.",
    ],
  },
  {
    slug: "hukuk-taban-siralamalari",
    title: "Hukuk Taban Puanları ve Başarı Sıralamaları",
    shortTitle: "Hukuk sıralamaları",
    description:
      "Hukuk programlarının 2025 başarı sıralarını, taban puanlarını ve kontenjanlarını karşılaştır.",
    intro:
      "Hukuk fakültelerini 2025 yerleştirme sonuçlarına göre sıraladık. Güncel başarı sırası koşulu ve tercih kuralları için ÖSYM kılavuzu ayrıca kontrol edilmelidir.",
    programKeywords: ["Hukuk"],
    level: "Lisans",
    category: "Bölüm",
    searchQuestion: "Hukuk fakültesi kaç binle alıyor?",
    tips: [
      "Güncel başarı sırası barajını tercih kılavuzundan doğrula.",
      "Fakültenin akademik kadrosunu ve uygulama olanaklarını araştır.",
      "Vakıf üniversitelerinde ücret ve burs koşullarını dikkatle incele.",
    ],
  },
];

export function getSeoProgramPage(slug: string) {
  return seoProgramPages.find((page) => page.slug === slug);
}
