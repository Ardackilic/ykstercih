import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "KYK Yurtları, Kapasiteleri ve Üniversite Yakınlıkları",
    template: "%s | YKS Tercih",
  },
  description:
    "Türkiye genelindeki KYK yurtlarını şehir, cinsiyet, kapasite ve üniversite yakınlığına göre araştır. Yurt adresi, telefon ve resmî kapasite bilgilerini incele.",
  keywords: [
    "KYK yurtları",
    "öğrenci yurtları",
    "KYK yurt kapasitesi",
    "üniversite yurtları",
    "kız öğrenci yurdu",
    "erkek öğrenci yurdu",
    "YKS tercih",
  ],
  alternates: {
    canonical: "https://ykstercih.site/yurtlar",
  },
  openGraph: {
    title: "KYK Yurtları ve Kapasiteleri | YKS Tercih",
    description:
      "Türkiye genelindeki KYK yurtlarını şehir, kapasite ve üniversite yakınlığına göre incele.",
    url: "https://ykstercih.site/yurtlar",
    siteName: "YKS Tercih",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KYK Yurtları ve Kapasiteleri | YKS Tercih",
    description:
      "KYK yurtlarını şehir, kapasite ve üniversite yakınlığına göre araştır.",
  },
};

export default function DormitoriesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
