import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favori Yurtlar",
  description:
    "Kaydettiğin favori öğrenci yurtlarını görüntüle.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function FavoriteDormitoriesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
