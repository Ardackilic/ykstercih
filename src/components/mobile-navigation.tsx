"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  ChartNoAxesColumnIncreasing,
  GraduationCap,
  Heart,
  Home,
  House,
  ListChecks,
  Menu,
  Newspaper,
  X,
} from "lucide-react";

const navigationItems = [
  {
    href: "/",
    label: "Ana Sayfa",
    description: "YKS Tercih ana sayfasına dön",
    icon: House,
  },
  {
    href: "/programlar",
    label: "Programlar",
    description: "Bölüm ve programları incele",
    icon: GraduationCap,
  },
  {
    href: "/universiteler",
    label: "Üniversiteler",
    description: "Üniversiteleri karşılaştır",
    icon: Building2,
  },
  {
    href: "/siralamaya-gore",
    label: "Sıralamaya Göre",
    description: "Başarı sırana uygun bölümleri bul",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    href: "/kyk-yurtlari",
    label: "KYK Yurtları",
    description: "Şehirlere göre KYK yurtlarını gör",
    icon: Home,
  },
  {
    href: "/rehber",
    label: "Rehber",
    description: "Tercih süreci hakkında bilgi al",
    icon: BookOpen,
  },
  {
    href: "/bultenler",
    label: "Bültenler",
    description: "Güncel YKS gelişmelerini takip et",
    icon: Newspaper,
  },
  {
    href: "/favoriler",
    label: "Favoriler",
    description: "Kaydettiğin programları görüntüle",
    icon: Heart,
  },
  {
    href: "/tercihlerim",
    label: "Tercihlerim",
    description: "24 tercihlik listeni düzenle",
    icon: ListChecks,
  },
];

export default function MobileNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Ana menüyü aç"
        aria-expanded={isOpen}
        aria-controls="mobile-main-navigation"
        className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[190] flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white/95 text-slate-800 shadow-lg shadow-slate-950/10 backdrop-blur transition active:scale-95 md:hidden"
      >
        <Menu size={23} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-sm md:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <aside
            id="mobile-main-navigation"
            aria-label="Mobil ana menü"
            className="flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex min-w-0 items-center gap-3"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-200">
                  <GraduationCap size={24} />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950">
                    YKS Tercih
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    Hızlı erişim menüsü
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Menüyü kapat"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1.5">
                {navigationItems.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex min-h-[68px] items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                        isActive
                          ? "border-red-200 bg-red-50"
                          : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                          isActive
                            ? "bg-red-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon size={21} />
                      </span>

                      <span className="min-w-0">
                        <span
                          className={`block font-black ${
                            isActive
                              ? "text-red-700"
                              : "text-slate-950"
                          }`}
                        >
                          {item.label}
                        </span>

                        <span className="mt-0.5 block text-xs font-semibold leading-4 text-slate-500">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-slate-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Link
                href="/tercihlerim"
                onClick={() => setIsOpen(false)}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white shadow-lg shadow-red-200"
              >
                <ListChecks size={19} />
                Tercih listemi aç
              </Link>

              <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">
                © 2026 YKS Tercih
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
