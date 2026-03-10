import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Opgelucht Generator",
  description: "Automatiseer RSS-feeds naar nieuwsartikelen voor Opgelucht.nl",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="border-b border-gray-200 bg-white">
          <div className="container mx-auto flex items-center gap-6 px-4 py-3">
            <Link
              href="/"
              className="text-sm font-semibold text-gray-900 hover:text-blue-600"
            >
              Opgelucht
            </Link>
            <Link
              href="/feeds"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Feeds
            </Link>
            <Link
              href="/nieuws"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Nieuws
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
