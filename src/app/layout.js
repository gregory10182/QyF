import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://qyfpf.cl';

export const metadata = {
  title: "QyF PF — Química y Farmacia",
  description: "Practica nomenclatura y reacciones para Química y Farmacia USACH.",
  keywords: ["química", "farmacia", "USACH", "nomenclatura", "reacciones", "ejercicios", "química general", "química orgánica", "bioquímica"],
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: "QyF PF — Química y Farmacia",
description: "Practica nomenclatura y reacciones para Química y Farmacia.",
    url: SITE_URL,
    siteName: "QyF PF",
    locale: "es_CL",
    type: "website",
  },
};

export const viewport = {
  themeColor: '#0a0a0a',
};

function WebSiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "QyF PF — Química y Farmacia",
          url: SITE_URL,
description: "Practica nomenclatura y reacciones para Química y Farmacia.",
          inLanguage: "es",
        }),
      }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <WebSiteSchema />
        {children}
      </body>
    </html>
  );
}