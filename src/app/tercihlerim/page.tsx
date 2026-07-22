"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpenCheck,
  ChevronDown,
  ChevronRight,
  FileDown,
  GraduationCap,
  Info,
  ListChecks,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";

type PreferenceProgram = {
  code: string;
  programName: string;
  universityName: string;
  scoreType: string;
  latestRanking: number | null;
};

const STORAGE_KEY = "tercih-pusula-preferences";
const MAX_PREFERENCES = 24;

const rankingFormatter = new Intl.NumberFormat("tr-TR");

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<PreferenceProgram[]>([]);
  const [ready, setReady] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    loadPreferences();
    setReady(true);

    window.addEventListener(
      "preferences-updated",
      loadPreferences
    );

    return () => {
      window.removeEventListener(
        "preferences-updated",
        loadPreferences
      );
    };
  }, []);

  function loadPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : [];

      setPreferences(
        Array.isArray(parsed)
          ? (parsed as PreferenceProgram[])
          : []
      );
    } catch {
      setPreferences([]);
    }
  }

  function savePreferences(updated: PreferenceProgram[]) {
    setPreferences(updated);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
    window.dispatchEvent(
      new Event("preferences-updated")
    );
  }

  function moveProgram(
    index: number,
    direction: "up" | "down"
  ) {
    const targetIndex =
      direction === "up" ? index - 1 : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= preferences.length
    ) {
      return;
    }

    const updated = [...preferences];

    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];

    savePreferences(updated);
  }

  function removeProgram(code: string) {
    savePreferences(
      preferences.filter(
        (program) => program.code !== code
      )
    );
  }

  function clearPreferences() {
    const confirmed = window.confirm(
      "Tercih listesindeki tüm programlar silinsin mi?"
    );

    if (!confirmed) {
      return;
    }

    savePreferences([]);
  }

  function printPreferences() {
    if (preferences.length === 0) {
      window.alert(
        "PDF oluşturmak için tercih listene en az bir program eklemelisin."
      );
      return;
    }

    window.print();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <p className="font-black">YKS Tercih</p>
              <p className="text-xs text-slate-500">
                Tercih listem
              </p>
            </div>
          </Link>

          <Link
            href="/programlar"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold transition hover:border-red-300 hover:text-red-600"
          >
            <ArrowLeft size={17} />
            Programlar
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <div className="no-print rounded-[30px] bg-gradient-to-br from-red-600 to-red-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-black text-red-100">
                24 tercihlik kişisel listen
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-5xl">
                Tercih listem
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-red-100">
                Programları gerçekten istediğin sıraya getir.
                En çok istediğin bölüm listenin en üstünde olsun.
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur">
              <p className="text-3xl font-black">
                {preferences.length}/{MAX_PREFERENCES}
              </p>

              <p className="text-xs font-bold text-red-100">
                tercih eklendi
              </p>
            </div>
          </div>
        </div>

        <section className="no-print mt-6 overflow-hidden rounded-[26px] border border-red-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setGuideOpen((value) => !value)}
            aria-expanded={guideOpen}
            className="flex w-full items-center justify-between gap-5 p-5 text-left sm:p-6"
          >
            <span className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <BookOpenCheck size={24} />
              </span>

              <span>
                <span className="block text-lg font-black text-slate-950">
                  Doğru tercih listesi nasıl hazırlanır?
                </span>

                <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500">
                  Tercih sırası, risk dağılımı ve son kontrol
                  hakkında kısa rehberi incele.
                </span>
              </span>
            </span>

            <ChevronDown
              size={22}
              className={`shrink-0 text-red-600 transition ${
                guideOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {guideOpen && (
            <div className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <GuideItem
                  number="1"
                  title="İstek sırasına göre diz"
                  description="Tercihlerini puanı yüksekten düşüğe göre değil, gerçekten en çok istediğin programdan başlayarak sırala."
                />

                <GuideItem
                  number="2"
                  title="Farklı risk grupları kullan"
                  description="Listende sıralamandan daha iyi kapatan zor tercihler, sıralamana yakın seçenekler ve daha güvenli programlar birlikte bulunsun."
                />

                <GuideItem
                  number="3"
                  title="Sadece başarı sırasına bakma"
                  description="Şehir, üniversite, eğitim dili, burs durumu, öğretim türü, ücret ve özel koşulları mutlaka kontrol et."
                />

                <GuideItem
                  number="4"
                  title="İstemediğin bölümü yazma"
                  description="Yerleştiğinde kayıt yaptırmayacağın veya okumak istemediğin bir programı yalnızca liste dolsun diye ekleme."
                />

                <GuideItem
                  number="5"
                  title="24 tercihin tamamı zorunlu değil"
                  description="Yalnızca gerçekten değerlendireceğin programları yaz. Ancak seçeneklerini gereksiz şekilde çok daraltmamaya dikkat et."
                />

                <GuideItem
                  number="6"
                  title="Son kontrolü ÖSYM'den yap"
                  description="Program kodu, kontenjan, özel koşullar ve tercih tarihleri için yayımlanan güncel ÖSYM kılavuzunu esas al."
                />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <Info size={20} className="mt-0.5 shrink-0" />

                <p className="text-sm font-semibold leading-6">
                  Bu sayfadaki liste bir hazırlık aracıdır.
                  Tercihlerini kesinleştirmeden önce program kodlarını
                  ve koşulları ÖSYM tercih ekranından tekrar kontrol et.
                </p>
              </div>
            </div>
          )}
        </section>

        {!ready && (
          <div className="no-print mt-8 rounded-3xl bg-white p-14 text-center">
            Tercihlerin yükleniyor...
          </div>
        )}

        {ready && preferences.length === 0 && (
          <div className="no-print mt-8 rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
              <ListChecks size={30} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Tercih listen henüz boş
            </h2>

            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
              Program detay sayfasındaki “Tercih listeme ekle”
              butonuyla bölümleri buraya ekleyebilirsin.
            </p>

            <Link
              href="/programlar"
              className="primary-button mt-6"
            >
              <Search size={18} />
              Programları keşfet
            </Link>
          </div>
        )}

        {ready && preferences.length > 0 && (
          <>
            <div className="no-print mt-8 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black">
                  Tercih sıralaman
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Okları kullanarak programların sırasını değiştirebilirsin.
                </p>
              </div>

              <button
                type="button"
                onClick={printPreferences}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
              >
                <FileDown size={18} />
                PDF olarak indir / yazdır
              </button>
            </div>

            <div className="print-header hidden">
              <div>
                <p className="print-brand">YKS Tercih</p>
                <h1>Tercih Listem</h1>
              </div>

              <div className="print-summary">
                <strong>{preferences.length}</strong>
                <span>program</span>
              </div>
            </div>

            <div className="preference-list mt-5 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
              <div className="no-print hidden grid-cols-[70px_minmax(0,1fr)_140px_145px_180px] gap-4 border-b border-slate-200 bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-500 lg:grid">
                <span>Sıra</span>
                <span>Üniversite ve program</span>
                <span>Puan türü</span>
                <span>Son başarı sırası</span>
                <span className="text-center">İşlemler</span>
              </div>

              {preferences.map((program, index) => (
                <article
                  key={program.code}
                  className="preference-row border-b border-slate-200 p-4 last:border-b-0 sm:p-5"
                >
                  <div className="grid items-center gap-4 lg:grid-cols-[70px_minmax(0,1fr)_140px_145px_180px]">
                    <div className="flex items-center gap-3">
                      <div className="preference-number flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-lg font-black text-white">
                        {index + 1}
                      </div>

                      <span className="no-print text-xs font-black uppercase tracking-wide text-slate-400 lg:hidden">
                        Tercih
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base font-black leading-6 text-slate-950 sm:text-lg">
                        {program.programName}
                      </h3>

                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                        {program.universityName}
                      </p>

                      <p className="print-code hidden">
                        Program kodu: {program.code}
                      </p>
                    </div>

                    <div>
                      <span className="no-print mb-1 block text-xs font-bold text-slate-400 lg:hidden">
                        Puan türü
                      </span>

                      <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
                        {program.scoreType || "Belirsiz"}
                      </span>
                    </div>

                    <div>
                      <span className="no-print mb-1 block text-xs font-bold text-slate-400 lg:hidden">
                        Son başarı sırası
                      </span>

                      <p className="text-sm font-black text-slate-700">
                        {program.latestRanking !== null
                          ? rankingFormatter.format(
                              program.latestRanking
                            )
                          : "Veri yok"}
                      </p>
                    </div>

                    <div className="no-print grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() =>
                          moveProgram(index, "up")
                        }
                        className="flex h-10 items-center justify-center rounded-xl border border-slate-200 transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Yukarı taşı"
                        title="Yukarı taşı"
                      >
                        <ArrowUp size={17} />
                      </button>

                      <button
                        type="button"
                        disabled={
                          index === preferences.length - 1
                        }
                        onClick={() =>
                          moveProgram(index, "down")
                        }
                        className="flex h-10 items-center justify-center rounded-xl border border-slate-200 transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Aşağı taşı"
                        title="Aşağı taşı"
                      >
                        <ArrowDown size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeProgram(program.code)
                        }
                        className="flex h-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                        aria-label="Tercihten çıkar"
                        title="Tercihten çıkar"
                      >
                        <Trash2 size={17} />
                      </button>

                      <Link
                        href={`/programlar/${program.code}`}
                        className="flex h-10 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-red-700"
                        aria-label="Programı incele"
                        title="Programı incele"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="print-note hidden">
              <strong>Önemli hatırlatma</strong>
              <p>
                Bu liste kişisel planlama amacıyla hazırlanmıştır.
                Tercihlerinizi ÖSYM sistemine girmeden önce program
                kodlarını, kontenjanları ve özel koşulları güncel
                tercih kılavuzundan kontrol ediniz.
              </p>
            </div>

            <div className="no-print mt-7 flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-sm font-bold leading-6 text-slate-500">
                  Tercih sıralaman otomatik olarak yalnızca
                  bu cihazda saklanır.
                </p>
              </div>

              <button
                type="button"
                onClick={clearPreferences}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-100"
              >
                <Trash2 size={17} />
                Listeyi temizle
              </button>
            </div>
          </>
        )}
      </section>

      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-6 text-sm font-semibold text-slate-500 lg:px-8">
          © 2026 YKS Tercih. Tüm hakları saklıdır.
        </div>
      </footer>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 14mm;
          }

          html,
          body {
            background: white !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          main {
            min-height: auto !important;
            background: white !important;
          }

          main > section {
            max-width: none !important;
            padding: 0 !important;
          }

          .print-header {
            display: flex !important;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 18px;
            padding-bottom: 14px;
            border-bottom: 2px solid #dc2626;
          }

          .print-brand {
            margin: 0 0 4px;
            color: #dc2626;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .print-header h1 {
            margin: 0;
            color: #0f172a;
            font-size: 28px;
            line-height: 1.15;
          }

          .print-summary {
            display: flex;
            align-items: baseline;
            gap: 5px;
            color: #475569;
          }

          .print-summary strong {
            color: #dc2626;
            font-size: 26px;
          }

          .preference-list {
            margin-top: 0 !important;
            overflow: visible !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 10px !important;
            box-shadow: none !important;
          }

          .preference-row {
            break-inside: avoid;
            page-break-inside: avoid;
            padding: 10px 12px !important;
            border-color: #cbd5e1 !important;
          }

          .preference-row > div {
            display: grid !important;
            grid-template-columns: 42px minmax(0, 1fr) 70px 100px !important;
            gap: 12px !important;
          }

          .preference-number {
            width: 34px !important;
            height: 34px !important;
            border-radius: 8px !important;
            background: #dc2626 !important;
            color: white !important;
            font-size: 14px !important;
          }

          .preference-row h3 {
            font-size: 12px !important;
            line-height: 1.35 !important;
          }

          .preference-row p {
            font-size: 10px !important;
            line-height: 1.4 !important;
          }

          .preference-row span {
            font-size: 9px !important;
          }

          .print-code {
            display: block !important;
            margin-top: 3px;
            color: #94a3b8;
            font-size: 8px !important;
          }

          .print-note {
            display: block !important;
            margin-top: 16px;
            padding: 12px 14px;
            border: 1px solid #fcd34d;
            border-radius: 9px;
            background: #fffbeb;
            color: #78350f;
            font-size: 9px;
            line-height: 1.5;
          }

          .print-note strong {
            display: block;
            margin-bottom: 3px;
            font-size: 10px;
          }

          .print-note p {
            margin: 0;
          }
        }
      `}</style>
    </main>
  );
}

function GuideItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-sm font-black text-white">
        {number}
      </span>

      <div>
        <h3 className="font-black text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}
