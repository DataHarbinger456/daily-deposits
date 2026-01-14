import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Daily Deposits - Track Your Leads & Revenue",
  description: "Simple, powerful lead tracking for service businesses. Record deposits, manage contacts, and analyze performance in real-time.",
  openGraph: {
    title: "Daily Deposits - Track Your Leads & Revenue",
    description: "Simple, powerful lead tracking for service businesses. Record deposits, manage contacts, and analyze performance in real-time.",
    url: "https://daily-deposits.vercel.app",
    type: "website",
    images: [
      {
        url: "https://daily-deposits.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Daily Deposits",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Deposits - Track Your Leads & Revenue",
    description: "Simple, powerful lead tracking for service businesses.",
    images: ["https://daily-deposits.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
