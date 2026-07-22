import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  Newspaper,
} from "lucide-react";
import { bulletins, getBulletin } from "@/data/bulletins";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return bulletins.map((bulletin) => ({
    slug: bulletin.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bulletin = getBulletin(slug);

  if (!bulletin) {
    return {};
  }

  return {
    title: bulletin.title,
    description: bulletin.summary,
  };
}

export default async function BulletinDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const bulletin = getBulletin(slug);

  if (!bulletin) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-red-600 text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="font-black">YKS Tercih</p>
              <p className="text-xs text-slate-500">Bülten detayı</p>
            </div>
          </Link>

          <Link
            href="/bultenler"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold transition hover:border-red-300 hover:text-red-600"
          >
            <ArrowLeft size={17} />
            Bültenlere dön
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-10 lg:px-8 lg:py-16">
        <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-10 lg:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-black text-red-700">
              <Newspaper size={16} />
              {bulletin.category}
            </span>

            <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-500">
              <CalendarDays size={16} />
              {bulletin.date}
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-black leading-tight tracking-[-0.04em] sm:text-6xl">
            {bulletin.title}
          </h1>

          <p className="mt-6 border-l-4 border-red-500 pl-5 text-lg font-semibold leading-8 text-slate-600">
            {bulletin.summary}
          </p>

          <div className="mt-10 space-y-6">
            {bulletin.content.map((paragraph) => (
              <p
                key={paragraph}
                className="text-base leading-8 text-slate-700 sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
              Resmî kaynak
            </p>

            <a
              href={bulletin.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 font-black text-red-600 transition hover:text-red-800"
            >
              {bulletin.sourceLabel}
              <ExternalLink size={17} />
            </a>
          </div>

          <p className="mt-8 text-xs leading-6 text-slate-400">
            Bu içerik bilgilendirme amaçlıdır. ÖSYM tarafından sonradan
            yayımlanabilecek değişiklik ve güncellemeler esas alınmalıdır.
          </p>
        </div>
      </article>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-6 text-sm font-semibold text-slate-500 lg:px-8">
          © 2026 YKS Tercih. Tüm hakları saklıdır.
        </div>
      </footer>
    </main>
  );
}
