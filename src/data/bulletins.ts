export type Bulletin = {
  slug: string;
  title: string;
  summary: string;
  content: string[];
  date: string;
  category: string;
  important: boolean;
  sourceLabel: string;
  sourceUrl: string;
};

export const bulletins: Bulletin[] = [
  {
    slug: "2026-yks-sonuclari-aciklandi",
    title: "2026 YKS sonuçları açıklandı",
    summary:
      "2026 YKS sonuçları 22 Temmuz 2026 tarihinde adayların erişimine açıldı.",
    content: [
      "2026 Yükseköğretim Kurumları Sınavı sonuçları ÖSYM tarafından 22 Temmuz 2026 tarihinde erişime açıldı.",
      "Adaylar TYT, AYT ve YDT puanları ile başarı sıralarını ÖSYM Sonuç Açıklama Sistemi üzerinden görüntüleyebilir.",
      "Tercih sürecinde yalnızca puana değil başarı sırasına, program koşullarına, kontenjanlara ve üniversite özelliklerine birlikte bakılması önemlidir.",
      "Sonuç belgesinde yer alan bilgiler kontrol edilmeli ve tercih kılavuzu yayımlandığında program kodları güncel kılavuz üzerinden doğrulanmalıdır.",
    ],
    date: "22 Temmuz 2026",
    category: "YKS Sonuçları",
    important: true,
    sourceLabel: "ÖSYM 2026 YKS sonuçları",
    sourceUrl: "https://sonuc.osym.gov.tr/",
  },
  {
    slug: "2026-yks-tercih-tarihleri-bekleniyor",
    title: "2026 YKS tercih tarihleri ve tercih kılavuzu bekleniyor",
    summary:
      "Sonuçlar açıklandı ancak tercih tarihleri için ÖSYM'nin resmî duyurusu takip edilmeli.",
    content: [
      "2026 YKS sonuçlarının açıklanmasının ardından adayların gündeminde tercih tarihleri ve program kontenjanları bulunuyor.",
      "Üniversitelerin programları, kontenjanları, özel koşulları ve program kodları Yükseköğretim Programları ve Kontenjanları Kılavuzu ile açıklanacak.",
      "Başvuru kılavuzu ile tercih kılavuzu aynı belge değildir. Tercihler yalnızca güncel program ve kontenjan kılavuzuna göre hazırlanmalıdır.",
      "Tercih tarihleri ve kılavuz yayımlandığında sitedeki bültenler ve program bilgileri güncellenecektir.",
    ],
    date: "22 Temmuz 2026",
    category: "YKS Tercihleri",
    important: true,
    sourceLabel: "ÖSYM 2026 YKS sayfası",
    sourceUrl: "https://www.osym.gov.tr/TR%2C33849/2026.html",
  },
  {
    slug: "2026-dgs-yapildi-sonuclar-13-agustosta",
    title: "2026 DGS yapıldı: Sonuçlar 13 Ağustos'ta açıklanacak",
    summary:
      "19 Temmuz'da uygulanan 2026 DGS'nin sonuç tarihi ÖSYM takviminde 13 Ağustos olarak yer alıyor.",
    content: [
      "2026 Dikey Geçiş Sınavı 19 Temmuz 2026 tarihinde uygulandı.",
      "ÖSYM sınav takvimine göre DGS sonuçlarının 13 Ağustos 2026 tarihinde açıklanması planlanıyor.",
      "Sonuçların ardından ön lisans mezunlarının lisans programlarına geçiş yapabilmeleri için tercih süreci başlayacak.",
      "Tercih yapacak adayların program kontenjanlarını, özel koşulları ve ilgili lisans programının puan türünü kontrol etmesi gerekiyor.",
    ],
    date: "22 Temmuz 2026",
    category: "DGS",
    important: true,
    sourceLabel: "ÖSYM 2026 sınav takvimi",
    sourceUrl: "https://www.osym.gov.tr/kpss-sinav-takvimi/",
  },
  {
    slug: "2026-kpss-lisans-sinav-tarihleri",
    title: "2026 KPSS Lisans sınav tarihleri",
    summary:
      "Genel Yetenek-Genel Kültür 6 Eylül, Alan Bilgisi oturumları ise 12-13 Eylül'de yapılacak.",
    content: [
      "2026 KPSS Lisans Genel Yetenek-Genel Kültür oturumu 6 Eylül 2026 tarihinde uygulanacak.",
      "KPSS Alan Bilgisi birinci gün oturumları 12 Eylül, ikinci gün oturumları ise 13 Eylül 2026 tarihinde yapılacak.",
      "KPSS Lisans ve Alan Bilgisi için geç başvuru işlemleri 22-23 Temmuz 2026 tarihleri arasında gerçekleştirilecek.",
      "ÖSYM takvimine göre KPSS Lisans ve Alan Bilgisi sonuçları 7 Ekim 2026 tarihinde açıklanacak.",
    ],
    date: "22 Temmuz 2026",
    category: "KPSS Lisans",
    important: true,
    sourceLabel: "ÖSYM KPSS sınav takvimi",
    sourceUrl: "https://www.osym.gov.tr/kpss-sinav-takvimi/",
  },
  {
    slug: "2026-kpss-on-lisans-tarihleri",
    title: "2026 KPSS Ön Lisans başvuru ve sınav tarihleri",
    summary:
      "Başvurular 29 Temmuz-10 Ağustos, sınav 4 Ekim ve sonuç tarihi 30 Ekim.",
    content: [
      "2026 KPSS Ön Lisans başvuruları 29 Temmuz-10 Ağustos 2026 tarihleri arasında alınacak.",
      "Geç başvuru işlemleri 19-20 Ağustos 2026 tarihleri arasında yapılabilecek.",
      "KPSS Ön Lisans sınavı 4 Ekim 2026 tarihinde uygulanacak.",
      "ÖSYM takvimine göre sınav sonuçları 30 Ekim 2026 tarihinde açıklanacak.",
    ],
    date: "22 Temmuz 2026",
    category: "KPSS Ön Lisans",
    important: false,
    sourceLabel: "ÖSYM KPSS sınav takvimi",
    sourceUrl: "https://www.osym.gov.tr/kpss-sinav-takvimi/",
  },
  {
    slug: "2026-kpss-ortaogretim-tarihleri",
    title: "2026 KPSS Ortaöğretim başvuru ve sınav tarihleri",
    summary:
      "Başvurular 27 Ağustos-8 Eylül tarihleri arasında alınacak; sınav 25 Ekim'de yapılacak.",
    content: [
      "2026 KPSS Ortaöğretim başvuruları 27 Ağustos-8 Eylül 2026 tarihleri arasında alınacak.",
      "Geç başvuru işlemleri 15-16 Eylül 2026 tarihleri arasında gerçekleştirilecek.",
      "KPSS Ortaöğretim sınavı 25 Ekim 2026 tarihinde uygulanacak.",
      "Adayların başvuru kılavuzundaki eğitim düzeyi ve mezuniyet şartlarını başvuru yapmadan önce kontrol etmesi gerekiyor.",
    ],
    date: "22 Temmuz 2026",
    category: "KPSS Ortaöğretim",
    important: false,
    sourceLabel: "ÖSYM KPSS sınav takvimi",
    sourceUrl: "https://www.osym.gov.tr/kpss-sinav-takvimi/",
  },
  {
    slug: "2026-meb-ags-26-temmuzda",
    title: "2026 MEB-AGS 26 Temmuz'da yapılacak",
    summary:
      "Akademi Giriş Sınavı ve ÖABT oturumları için sınav tarihi 26 Temmuz.",
    content: [
      "2026 Millî Eğitim Bakanlığı Akademi Giriş Sınavı 26 Temmuz 2026 tarihinde uygulanacak.",
      "Sınav kapsamında Akademi Giriş Sınavı ile Öğretmenlik Alan Bilgisi Testi oturumları gerçekleştirilecek.",
      "Adayların sınava giriş belgelerinde yazılı bina ve salon bilgilerini önceden kontrol etmesi gerekiyor.",
      "ÖSYM sınav takvimine göre sonuçların 26 Ağustos 2026 tarihinde açıklanması planlanıyor.",
    ],
    date: "22 Temmuz 2026",
    category: "MEB-AGS",
    important: false,
    sourceLabel: "ÖSYM 2026 sınav takvimi",
    sourceUrl: "https://www.osym.gov.tr/kpss-sinav-takvimi/",
  },
  {
    slug: "2026-yks-degerlendirmesinde-soru-degisikligi",
    title: "2026 YKS değerlendirmesinde bir soru iptal edildi",
    summary:
      "AYT'deki bir sorunun cevabı değiştirildi, bir soru ise değerlendirme dışı bırakıldı.",
    content: [
      "ÖSYM tarafından yayımlanan duyuruya göre AYT Matematik Testi Temel Soru Kitapçığı'ndaki 23 numaralı sorunun cevabı C yerine A olarak değiştirildi.",
      "Türk Dili ve Edebiyatı-Sosyal Bilimler-1 Testi Temel Soru Kitapçığı'ndaki 20 numaralı soru iptal edildi.",
      "İptal edilen soru değerlendirme dışı bırakılarak puanlama geçerli sorular üzerinden gerçekleştirildi.",
    ],
    date: "1 Temmuz 2026",
    category: "ÖSYM Duyurusu",
    important: false,
    sourceLabel: "ÖSYM değerlendirme duyurusu",
    sourceUrl:
      "https://www.osym.gov.tr/TR%2C34158/2026-yuksekogretim-kurumlari-sinavi-2026-yks-degerlendirme-islemleri-01072026.html",
  },
];

export function getBulletin(slug: string) {
  return bulletins.find(
    (bulletin) => bulletin.slug === slug
  );
}
