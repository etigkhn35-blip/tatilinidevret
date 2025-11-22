import './globals.css';
export const metadata = { title: "tatilinidevret" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="font-mont text-ink bg-white">
        {children}
      </body>
    </html>
  );
}
