import type { Metadata } from "next";
import type { ReactNode } from "react";

import { brand } from "@ustaca/config";

import "./globals.css";

export const metadata: Metadata = {
  title: `${brand.panelAppName} | Ustaca AI`,
  description: "Tek kullanici, tek isletme ve tek site mantigina gore tasarlanmis musteri paneli."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="panel-body">{children}</body>
    </html>
  );
}

