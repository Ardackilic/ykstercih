import type { MetadataRoute } from "next";

import data from "@/data/programs.json";
import { allDormitories } from "@/data/all-dormitories";

const SITE_URL = "https://ykstercih.site";

type Program = {
  code: string;
  universityName: string;
};

const programs = data.programs as Program[];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/programlar`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/universiteler`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/kyk-yurtlari`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/yurtlar`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/rehber`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/rehber/yks-tercih-listesi-nasil-hazirlanir`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
  ];

  const programPages: MetadataRoute.Sitemap =
    programs.map((program) => ({
      url: `${SITE_URL}/programlar/${encodeURIComponent(
        program.code
      )}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.75,
    }));

  const universityPages: MetadataRoute.Sitemap =
    Array.from(
      new Set(
        programs
          .map(
            (program) =>
              program.universityName
          )
          .filter(Boolean)
      )
    ).map((universityName) => ({
      url: `${SITE_URL}/universiteler/${encodeURIComponent(
        universityName
      )}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.8,
    }));

  const cityPages: MetadataRoute.Sitemap =
    Array.from(
      new Set(
        allDormitories
          .map(
            (dormitory) =>
              dormitory.city
          )
          .filter(Boolean)
      )
    ).map((city) => ({
      url: `${SITE_URL}/kyk-yurtlari/${createCitySlug(
        city
      )}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  const dormitoryPages: MetadataRoute.Sitemap =
    allDormitories.map((dormitory) => ({
      url: `${SITE_URL}/yurtlar/${encodeURIComponent(
        dormitory.id
      )}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return removeDuplicateUrls([
    ...staticPages,
    ...universityPages,
    ...cityPages,
    ...programPages,
    ...dormitoryPages,
  ]);
}

function removeDuplicateUrls(
  pages: MetadataRoute.Sitemap
): MetadataRoute.Sitemap {
  const uniquePages = new Map(
    pages.map((page) => [
      page.url,
      page,
    ])
  );

  return Array.from(
    uniquePages.values()
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
