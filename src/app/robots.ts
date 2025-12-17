export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/hesabim", "/mesajlar"],
      },
    ],
    sitemap: "https://tatilinidevret.com/sitemap.xml",
  };
}
