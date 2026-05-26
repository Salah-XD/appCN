import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SmoothScroll } from "@/components/site/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const TITLE = "appCN — copy-paste mobile components for React Native";
const DESCRIPTION =
  "A shadcn-philosophy component library for React Native + Expo. Copy-paste ownership, NativeWind styling, motion-first defaults, with a featured AI-native collection. Preview every component live on your phone.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "appCN",
  keywords: [
    "react-native",
    "expo",
    "nativewind",
    "shadcn",
    "components",
    "ai",
    "mobile",
    "ui-library",
  ],
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "appCN",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "appCN",
  description: DESCRIPTION,
  url: "https://appcn.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
