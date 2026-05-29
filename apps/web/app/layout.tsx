import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { ThemeProvider } from "@/components/site/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

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
  url: "https://appcn.vercel.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6T2RTMTCTF"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-6T2RTMTCTF');`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="appcn:theme"
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={150}>
            <SmoothScroll />
            <SiteHeader />
            {children}
            <SiteFooter />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
