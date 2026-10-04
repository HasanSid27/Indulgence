import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: config.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${config.url}/menu`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];
}
