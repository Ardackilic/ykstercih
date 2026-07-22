"use client";

import {
  Check,
  Share2,
} from "lucide-react";
import { useState } from "react";

type ShareDormitoryButtonProps = {
  title: string;
};

export default function ShareDormitoryButton({
  title,
}: ShareDormitoryButtonProps) {
  const [copied, setCopied] =
    useState(false);

  async function shareDormitory() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `${title} yurt bilgilerini incele`,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(url);

        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        setCopied(false);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={shareDormitory}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-red-700 shadow-sm ring-1 ring-white/40 transition hover:bg-red-50"
    >
      {copied ? (
        <>
          <Check size={18} />
          Bağlantı kopyalandı
        </>
      ) : (
        <>
          <Share2 size={18} />
          Yurdu paylaş
        </>
      )}
    </button>
  );
}
