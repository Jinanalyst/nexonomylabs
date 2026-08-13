import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeInit from "@/components/ThemeInit";
import SiteHeader from "@/components/SiteHeader";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import DemoBanner from "@/components/DemoBanner";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getMarkets } from "@/lib/data/queries";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexonomy Labs — Financial market community",
  description:
    "Read the news, publish your market thesis, and debate with a serious community of investors. Where individual investors become verified experts.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, markets] = await Promise.all([getCurrentProfile(), getMarkets()]);
  const configured = isSupabaseConfigured();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full`} suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4572550568039838"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeInit />
        {!configured && <DemoBanner />}
        <SiteHeader profile={profile} />
        <MarketTicker markets={markets} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
