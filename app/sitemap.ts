import type { MetadataRoute } from "next";

const homepageLastModified = new Date("2026-10-10T00:00:00.000Z");
const reelsPageLastModified = new Date("2026-10-10T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.theblinkx.com/",
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.theblinkx.com/reels-production",
      lastModified: reelsPageLastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
