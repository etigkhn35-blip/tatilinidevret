import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://tatilinidevret.com",
      lastModified: new Date(),
    },
    {
      url: "https://tatilinidevret.com/ilanlar",
      lastModified: new Date(),
    },
  ];
}
