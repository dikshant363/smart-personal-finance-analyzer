import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PWARegistry } from "@/components/pwa-registry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Personal Finance Analyzer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <PWARegistry />
        {children}
      </body>
    </html>
  );
}
