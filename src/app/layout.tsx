import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};


const SITE_URL = "https://ykstercih.site";
const SITE_NAME = "YKS Tercih";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  applicationName: SITE_NAME,

  title: {
    default:
      "YKS Tercih – Sıralamana Göre Üniversite ve Bölüm Bul",
    template: `%s | ${SITE_NAME}`,
  },

  description:
    "YKS sıralamana göre üniversite ve bölüm bul, taban puanları karşılaştır, KYK yurtlarını incele ve tercih listeni oluştur.",

  icons: {
    icon: [
      {
        url: "/yks-tercih-icon.svg?v=3",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/yks-tercih-icon.svg?v=3",
    apple: "/yks-tercih-icon.svg?v=3",
  },
keywords: [
    "YKS tercih",
    "YKS tercih robotu",
    "üniversite tercih",
    "sıralamaya göre bölüm",
    "taban puanları",
    "başarı sıralamaları",
    "üniversite bölümleri",
    "KYK yurtları",
    "tercih listesi",
    "TYT tercih",
    "SAY tercih",
    "EA tercih",
    "SÖZ tercih",
    "DİL tercih",
  ],

  authors: [
    {
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME,
  publisher: SITE_NAME,

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title:
      "YKS Tercih – Sıralamana Göre Üniversite ve Bölüm Bul",
    description:
      "YKS sıralamana göre üniversite ve bölüm bul, taban puanlarını karşılaştır ve KYK yurtlarını incele.",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "YKS Tercih – Sıralamana Göre Üniversite ve Bölüm Bul",
    description:
      "Üniversite programlarını, başarı sıralamalarını ve KYK yurtlarını tek yerde incele.",
  },

  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "YKS Tercih Rehberi",
    url: SITE_URL,
    inLanguage: "tr-TR",
    description:
      "YKS sıralamasına göre üniversite ve bölüm araştırma, KYK yurtlarını inceleme ve tercih listesi oluşturma platformu.",
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Üniversite adaylarına yönelik YKS tercih ve öğrenci yurdu araştırma platformu.",
  };

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              websiteStructuredData
            ),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              organizationStructuredData
            ),
          }}
        />

        {children}
      </body>
    </html>
  );
}
