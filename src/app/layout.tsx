import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://tatilinidevret.com"),
  title: {
    default: "Tatilini Devret | Tatil Devretme & Devir Platformu",
    template: "%s | Tatilini Devret",
  },
  description:
    "Tatilini Devret ile kullanmadığın tatilleri güvenle devret.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
