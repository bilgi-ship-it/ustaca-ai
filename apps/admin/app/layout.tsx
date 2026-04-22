import type { Metadata } from "next";
import type { ReactNode } from "react";

import { brand } from "@ustaca/config";

import "./globals.css";

export const metadata: Metadata = {
  title: `${brand.adminAppName} | Ustaca AI`,
  description: "Musteri, trial, odeme, domain ve destek operasyonlari icin admin panel iskeleti."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="admin-body">{children}</body>
    </html>
  );
}

