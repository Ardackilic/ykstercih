import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yurt Karşılaştırma",
  description:
    "Seçtiğin öğrenci yurtlarını kapasite, konum ve üniversite yakınlığına göre karşılaştır.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CompareDormitoriesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
