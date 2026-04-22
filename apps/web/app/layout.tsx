import type { Metadata } from "next";
import type { ReactNode } from "react";

import { brand } from "@ustaca/config";

import "./globals.css";

export const metadata: Metadata = {
  title: `${brand.name} | Ustaca Cozum`,
  description: "Kucuk isletmeler icin koyu neon startup estetikli, AI destekli web sitesi ve operasyon platformu."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="web-body">{children}</body>
    </html>
  );
}

