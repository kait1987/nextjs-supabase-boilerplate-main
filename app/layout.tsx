import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { currentLocalization } from "@/lib/clerk/localization";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"
  ),
  title: {
    default: "의류 쇼핑몰",
    template: "%s | 의류 쇼핑몰",
  },
  description: "트렌디한 의류를 만나보세요. 다양한 스타일의 상의, 하의, 액세서리를 제공합니다.",
  keywords: ["의류", "쇼핑몰", "패션", "옷", "온라인 쇼핑"],
  authors: [{ name: "의류 쇼핑몰" }],
  creator: "의류 쇼핑몰",
  publisher: "의류 쇼핑몰",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "의류 쇼핑몰",
    title: "의류 쇼핑몰",
    description: "트렌디한 의류를 만나보세요. 다양한 스타일의 상의, 하의, 액세서리를 제공합니다.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "의류 쇼핑몰",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "의류 쇼핑몰",
    description: "트렌디한 의류를 만나보세요. 다양한 스타일의 상의, 하의, 액세서리를 제공합니다.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console, Naver Search Advisor 등에서 제공하는 검증 코드를 여기에 추가
    // google: "your-google-verification-code",
    // naver: "your-naver-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={currentLocalization}>
      <html lang="ko" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SyncUserProvider>
              <Navbar />
              <div className="relative">
                {children}
              </div>
            </SyncUserProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
