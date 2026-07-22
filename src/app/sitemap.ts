import type { MetadataRoute } from "next";

import data from "@/data/programs.json";
import { allDormitories } from "@/data/all-dormitories";
import { bulletins } from "@/data/bulletins";
import { seoProgramPages } from "@/data/seo-pages";

const SITE_URL = "https://ykstercih.site";

type Program = {
  code: string;
  universityName: string;
};

const programs = data.programs as Program[];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
    "",
    "/programlar",
    "/universiteler",
    "/kyk-yurtlari",
    "/yurtlar",
    "/rehber",
    "/rehber/yks-tercih-listesi-nasil-hazirlanir",
    "/bultenler",
    "/siralamaya-gore",
  ];

  const staticPages: MetadataRoute.Sitemap = staticPaths.map(
    (path, index) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: index === 0 ? "daily" : "weekly",
      priority: index === 0 ? 1 : 0.9,
    })
  );

  const seoPages: MetadataRoute.Sitemap = seoProgramPages.map((page) => ({
    url: `${SITE_URL}/siralamaya-gore/${page.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const bulletinPages: MetadataRoute.Sitemap = bulletins.map(
    (bulletin) => ({
      url: `${SITE_URL}/bultenler/${bulletin.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: bulletin.important ? 0.9 : 0.8,
    })
  );

  const programPages: MetadataRoute.Sitemap = programs.map((program) => ({
    url: `${SITE_URL}/programlar/${encodeURIComponent(program.code)}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.75,
  }));

  const universityPages: MetadataRoute.Sitemap = Array.from(
    new Set(
      programs
        .map((program) => program.universityName)
        .filter(Boolean)
    )
  ).map((universityName) => ({
    url: `${SITE_URL}/universiteler/${encodeURIComponent(universityName)}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  const cityPages: MetadataRoute.Sitemap = Array.from(
    new Set(
      allDormitories
        .map((dormitory) => dormitory.city)
        .filter(Boolean)
    )
  ).map((city) => ({
    url: `${SITE_URL}/kyk-yurtlari/${createCitySlug(city)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const dormitoryPages: MetadataRoute.Sitemap = allDormitories.map(
    (dormitory) => ({
      url: `${SITE_URL}/yurtlar/${encodeURIComponent(dormitory.id)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  return removeDuplicateUrls([
    ...staticPages,
    ...seoPages,
    ...bulletinPages,
    ...universityPages,
    ...cityPages,
    ...programPages,
    ...dormitoryPages,
  ]);
}

function removeDuplicateUrls(
  pages: MetadataRoute.Sitemap
): MetadataRoute.Sitemap {
  return Array.from(
    new Map(pages.map((page) => [page.url, page])).values()
  );
}

function createCitySlug(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
