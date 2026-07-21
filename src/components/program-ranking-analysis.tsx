"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

export default function ProgramRankingAnalysis({
  programRanking,
  scoreType,
}: {
  programRanking: number | null;
  scoreType: string;
}) {
  const [ranking, setRanking] = useState("");

  const analysis = useMemo(() => {
    const studentRanking = Number(ranking);

    if (!studentRanking || !programRanking) {
      return null;
    }

    const difference = programRanking - studentRanking;
    const ratio = difference / studentRanking;

    if (ratio >= 0.35) {
      return {
        label: "Güvenli tercih",
        description:
          "Geçmiş başarı sırasına göre bu program senin sıralamandan belirgin biçimde daha geride kapatmış.",
        className: "border-emerald-200 bg-emerald-50 text-emerald-800",
        icon: ShieldCheck,
      };
    }

    if (ratio >= 0.1) {
      return {
        label: "Mantıklı tercih",
        description:
          "Geçmiş veriye göre sıralamana uygun ve makul güvenlik payı olan bir seçenek.",
        className: "border-sky-200 bg-sky-50 text-sky-800",
        icon: CheckCircle2,
      };
    }

    if (ratio >= -0.1) {
      return {
        label: "Sıralamana çok yakın",
        description:
          "Programın geçmiş başarı sırası senin sıralamana oldukça yakın. Kontenjan değişimini de dikkate almalısın.",
        className: "border-amber-200 bg-amber-50 text-amber-800",
        icon: Target,
      };
    }

    if (ratio >= -0.3) {
      return {
        label: "Riskli tercih",
        description:
          "Program geçmişte senin sıralamandan daha iyi bir sırada kapatmış. Yine de üst sıralara yazılabilir.",
        className: "border-orange-200 bg-orange-50 text-orange-800",
        icon: AlertTriangle,
      };
    }

    return {
      label: "Çok zor tercih",
      description:
        "Geçmiş başarı sırası ile senin sıralaman arasında yüksek fark bulunuyor.",
      className: "border-rose-200 bg-rose-50 text-rose-800",
      icon: AlertTriangle,
    };
  }, [ranking, programRanking]);

  return (
    <div className="rounded-3xl bg-slate-950 p-6 text-white lg:sticky lg:top-5">
      <div className="flex items-center gap-2 text-indigo-300">
        <Sparkles size={18} />
        <p className="text-sm font-black">Canlı tercih analizi</p>
      </div>

      <h2 className="mt-3 text-2xl font-black">
        Sıralamanla karşılaştır
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-300">
        {scoreType || "İlgili puan türündeki"} başarı sıranı yaz. Sonuç anında
        hesaplanır.
      </p>

      <input
        type="text"
        inputMode="numeric"
        value={
          ranking
            ? new Intl.NumberFormat("tr-TR").format(Number(ranking))
            : ""
        }
        onChange={(event) => {
          const onlyNumbers = event.target.value
            .replace(/\D/g, "")
            .slice(0, 7);

          setRanking(onlyNumbers);
        }}
        placeholder="Örnek: 85.000"
        className="mt-5 h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 text-lg font-black text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
      />

      {programRanking === null && (
        <div className="mt-4 rounded-2xl border border-amber-700 bg-amber-950/50 p-4 text-sm leading-6 text-amber-200">
          Bu programın karşılaştırılabilir başarı sırası bulunmuyor.
        </div>
      )}

      {analysis && (
        <div className={`mt-4 rounded-2xl border p-4 ${analysis.className}`}>
          <div className="flex items-start gap-3">
            <analysis.icon size={21} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-black">{analysis.label}</p>
              <p className="mt-1 text-sm leading-6">
                {analysis.description}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-white/60 p-3">
              <p className="text-xs font-bold opacity-70">Senin sıran</p>
              <p className="mt-1 font-black">
                {new Intl.NumberFormat("tr-TR").format(Number(ranking))}
              </p>
            </div>

            <div className="rounded-xl bg-white/60 p-3">
              <p className="text-xs font-bold opacity-70">Program sırası</p>
              <p className="mt-1 font-black">
                {new Intl.NumberFormat("tr-TR").format(programRanking ?? 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="mt-5 text-xs leading-5 text-slate-400">
        Bu değerlendirme kesin yerleştirme sonucu değildir; geçmiş yıl
        verilerine dayalı yardımcı analizdir.
      </p>
    </div>
  );
}
