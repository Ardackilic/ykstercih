import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ListChecks,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

const SITE_URL = "https://ykstercih.site";
const PAGE_URL =
  `${SITE_URL}/rehber/yks-tercih-listesi-nasil-hazirlanir`;

export const metadata: Metadata = {
  title: "YKS Tercih Listesi Nasıl Hazırlanır? Adım Adım Rehber",
  description:
    "YKS tercih listesi hazırlarken başarı sırası, tercih sırası, riskli ve güvenli tercihler, bölüm araştırması ve sık yapılan hatalar hakkında kapsamlı rehber.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "article",
    locale: "tr_TR",
    siteName: "YKS Tercih",
    url: PAGE_URL,
    title:
      "YKS Tercih Listesi Nasıl Hazırlanır? Adım Adım Rehber",
    description:
      "Başarı sırasına göre dengeli ve bilinçli bir YKS tercih listesi hazırlamak için dikkat edilmesi gerekenler.",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "YKS Tercih Listesi Nasıl Hazırlanır?",
    description:
      "YKS tercih listesi hazırlarken uygulanabilecek adımları incele.",
  },
};

const steps = [
  {
    title: "Başarı sıranı doğru belirle",
    description:
      "Tercih araştırmasına puan yerine öncelikle başarı sırasını kullanarak başla. Puanlar sınavın zorluğuna göre değişebilir; başarı sırası karşılaştırma için genellikle daha kullanışlıdır.",
  },
  {
    title: "İstediğin bölüm ve şehirleri belirle",
    description:
      "Yalnızca sıralamanın yettiği programlara değil, gerçekten okuyabileceğin bölümlere odaklan. Şehir, barınma, ulaşım ve yaşam maliyetlerini birlikte değerlendir.",
  },
  {
    title: "Geçmiş yılları karşılaştır",
    description:
      "Bir programın yalnızca son yıl verisine bakma. Birkaç yıllık başarı sırası, kontenjan ve doluluk değişimini birlikte incele.",
  },
  {
    title: "Tercihlerini istek sırasına koy",
    description:
      "Üst sıralara en çok istediğin programları yaz. Yerleştirme sistemi, şartlarını sağladığın en üst tercihe yerleştirmeyi amaçlar.",
  },
  {
    title: "Listeyi dengeli oluştur",
    description:
      "Sıralamandan daha iyi, sıralamana yakın ve daha geride kapatan programları dengeli biçimde listeye dağıt.",
  },
  {
    title: "Son kontrolleri yap",
    description:
      "Program kodu, burs durumu, öğretim dili, özel koşullar, şehir ve üniversite adını ÖSYM kılavuzuyla karşılaştır.",
  },
];

const frequentlyAskedQuestions = [
  {
    question:
      "Tercih yaparken puan mı başarı sırası mı önemlidir?",
    answer:
      "Programları geçmiş yıllarla karşılaştırırken başarı sırası genellikle puandan daha anlamlıdır. Puanlar sınavın zorluğuna göre yıldan yıla daha fazla değişebilir.",
  },
  {
    question:
      "Sıralamamdan daha yüksek bir bölüm yazabilir miyim?",
    answer:
      "Evet. Geçmiş yıl sıralamasının senden daha iyi olması o programı yazamayacağın anlamına gelmez. Kontenjan ve aday davranışları nedeniyle sıralamalar değişebilir.",
  },
  {
    question:
      "Tercih sırası yerleşmeyi etkiler mi?",
    answer:
      "Tercih sırası önemlidir. Şartlarını karşıladığın seçenekler arasından listenin en üstündeki programa yerleşirsin. Bu nedenle programları gerçekten istediğin sıraya koymalısın.",
  },
  {
    question:
      "Tercih listesinin tamamını doldurmak zorunlu mu?",
    answer:
      "Hayır. Yalnızca gerçekten okumayı kabul edeceğin programları yazmalısın. Sırf liste dolsun diye istemediğin bir bölümü eklemek doğru değildir.",
  },
];

export default function PreferenceGuidePage() {
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "YKS Tercih Listesi Nasıl Hazırlanır?",
    description:
      "Başarı sırasına göre bilinçli ve dengeli bir YKS tercih listesi hazırlama rehberi.",
    url: PAGE_URL,
    mainEntityOfPage: PAGE_URL,
    inLanguage: "tr-TR",
    author: {
      "@type": "Organization",
      name: "YKS Tercih",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "YKS Tercih",
      url: SITE_URL,
    },
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana sayfa",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Rehber",
        item: `${SITE_URL}/rehber`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "YKS Tercih Listesi Nasıl Hazırlanır?",
        item: PAGE_URL,
      },
    ],
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: frequentlyAskedQuestions.map(
      (item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })
    ),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbStructuredData
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-red-600 !text-white">
              <GraduationCap size={24} />
            </span>

            <span>
              <span className="block font-black">
                YKS Tercih
              </span>
              <span className="block text-xs text-slate-500">
                Tercih rehberi
              </span>
            </span>
          </Link>

          <Link
            href="/programlar"
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black !text-white transition hover:bg-red-700 hover:!text-white"
          >
            Programları ara
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        <nav
          aria-label="Sayfa yolu"
          className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500"
        >
          <Link href="/" className="hover:text-red-600">
            Ana sayfa
          </Link>
          <span>/</span>
          <span>Rehber</span>
          <span>/</span>
          <span className="text-slate-900">
            YKS tercih listesi
          </span>
        </nav>

        <section className="overflow-hidden rounded-[34px] bg-gradient-to-br from-red-600 via-red-600 to-red-700 p-7 text-white shadow-xl sm:p-10">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15">
            <ListChecks size={28} />
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-red-100">
            YKS tercih rehberi
          </p>

          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
            YKS tercih listesi nasıl hazırlanır?
          </h1>

          <p className="mt-5 max-w-3xl text-sm font-semibold leading-7 text-red-100 sm:text-base">
            Başarı sıranı doğru yorumlayarak,
            programları araştırarak ve tercihlerini
            gerçek istek sırasına yerleştirerek daha
            bilinçli bir tercih listesi oluşturabilirsin.
          </p>
        </section>

        <section className="mt-7 grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<BarChart3 size={22} />}
            title="Başarı sırasını kullan"
            description="Programları geçmiş yıllarla karşılaştırırken puandan önce sıralamaya bak."
          />

          <InfoCard
            icon={<ShieldCheck size={22} />}
            title="Dengeli liste hazırla"
            description="Riskli, dengeli ve daha güvenli programları birlikte değerlendir."
          />

          <InfoCard
            icon={<BookOpen size={22} />}
            title="Koşulları oku"
            description="Burs, dil, kontenjan ve özel koşulları kılavuzdan doğrula."
          />
        </section>

        <section className="mt-7 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8">
          <h2 className="text-2xl font-black sm:text-3xl">
            Tercih listesi hazırlama adımları
          </h2>

          <div className="mt-7 space-y-5">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-2xl bg-slate-50 p-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-600 font-black text-white">
                  {index + 1}
                </span>

                <div>
                  <h3 className="font-black">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-3">
          <PreferenceGroup
            title="İddialı tercihler"
            description="Geçmiş yıl sıralaması senden daha iyi olan fakat gerçekten istediğin programlar."
            note="Listenin üst kısmında bulunabilir."
          />

          <PreferenceGroup
            title="Dengeli tercihler"
            description="Geçmiş yıl başarı sırası kendi sıralamana yakın olan programlar."
            note="Listenin ana bölümünü oluşturabilir."
          />

          <PreferenceGroup
            title="Daha güvenli tercihler"
            description="Geçmiş yıl sıralaması senin sıralamandan daha geride olan programlar."
            note="Yerleşme garantisi vermez."
          />
        </section>

        <section className="mt-7 rounded-[28px] border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <TriangleAlert
              size={25}
              className="mt-1 shrink-0 text-amber-700"
            />

            <div>
              <h2 className="text-xl font-black text-amber-950">
                Sık yapılan tercih hataları
              </h2>

              <ul className="mt-4 space-y-3 text-sm font-semibold leading-7 text-amber-900">
                <li>
                  • Programları istek sırası yerine
                  yalnızca başarı sırasına göre dizmek.
                </li>
                <li>
                  • İstenmeyen bölümleri sırf listeyi
                  doldurmak için eklemek.
                </li>
                <li>
                  • Burs, öğretim dili ve özel koşulları
                  incelememek.
                </li>
                <li>
                  • Yalnızca tek bir yılın taban
                  sıralamasına bakmak.
                </li>
                <li>
                  • Şehir, barınma ve ulaşım giderlerini
                  hesaba katmamak.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-[28px] bg-slate-950 p-6 text-white sm:p-8">
          <h2 className="text-2xl font-black">
            Programları sıralamana göre araştır
          </h2>

          <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-300">
            YKS programlarını puan türü, başarı
            sırası, üniversite ve bölüm bilgilerine
            göre filtreleyerek tercih seçeneklerini
            incele.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/programlar"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black !text-slate-950 transition hover:bg-red-50 hover:!text-slate-950"
            >
              <Search size={18} />
              Programları incele
            </Link>

            <Link
              href="/tercihlerim"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-black !text-white transition hover:bg-white/10 hover:!text-white"
            >
              Tercih listeme git
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black sm:text-3xl">
            Sık sorulan sorular
          </h2>

          <div className="mt-5 space-y-3">
            {frequentlyAskedQuestions.map((item) => (
              <details
                key={item.question}
                className="rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
              >
                <summary className="cursor-pointer list-none font-black">
                  {item.question}
                </summary>

                <p className="mt-4 border-t border-slate-100 pt-4 text-sm font-semibold leading-7 text-slate-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={21}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <p className="text-sm font-semibold leading-7 text-slate-600">
              Kesin program koşulları ve tercih
              kuralları için ilgili yılın ÖSYM
              tercih kılavuzu esas alınmalıdır.
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        {icon}
      </span>

      <h2 className="mt-4 font-black">
        {title}
      </h2>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function PreferenceGroup({
  title,
  description,
  note,
}: {
  title: string;
  description: string;
  note: string;
}) {
  return (
    <article className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <h2 className="text-lg font-black">
        {title}
      </h2>

      <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
        {description}
      </p>

      <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700">
        {note}
      </p>
    </article>
  );
}
