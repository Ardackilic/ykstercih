"use client";

import { ListPlus, Check } from "lucide-react";
import { useEffect, useState } from "react";

export type PreferenceProgram = {
  code: string;
  programName: string;
  universityName: string;
  scoreType: string;
  latestRanking: number | null;
};

const STORAGE_KEY = "tercih-pusula-preferences";
const MAX_PREFERENCES = 24;

export default function PreferenceButton({
  program,
}: {
  program: PreferenceProgram;
}) {
  const [isAdded, setIsAdded] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const preferences = getPreferences();

    setIsAdded(
      preferences.some((item) => item.code === program.code)
    );
  }, [program.code]);

  function togglePreference() {
    const preferences = getPreferences();
    const exists = preferences.some(
      (item) => item.code === program.code
    );

    if (exists) {
      const updated = preferences.filter(
        (item) => item.code !== program.code
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setIsAdded(false);
      setMessage("Tercih listesinden çıkarıldı.");
    } else {
      if (preferences.length >= MAX_PREFERENCES) {
        setMessage("Tercih listesinde en fazla 24 program olabilir.");
        return;
      }

      const updated = [...preferences, program];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setIsAdded(true);
      setMessage(`${updated.length}. tercihe eklendi.`);
    }

    window.dispatchEvent(new Event("preferences-updated"));

    window.setTimeout(() => {
      setMessage("");
    }, 2200);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={togglePreference}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-black transition ${
          isAdded
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "bg-white text-red-700 hover:bg-red-50"
        }`}
      >
        {isAdded ? <Check size={19} /> : <ListPlus size={19} />}

        {isAdded
          ? "Tercih listesine eklendi"
          : "Tercih listeme ekle"}
      </button>

      {message && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl bg-slate-950 px-4 py-3 text-center text-xs font-bold text-white shadow-xl">
          {message}
        </div>
      )}
    </div>
  );
}

function getPreferences(): PreferenceProgram[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
