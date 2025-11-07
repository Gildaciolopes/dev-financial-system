import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import {
  Geist,
  Geist_Mono,
  Geist as Fresh_Font_Geist,
  Geist_Mono as Fresh_Font_Geist_Mono,
  Source_Serif_4 as Fresh_Font_Source_Serif_4,
} from "next/font/google";
import { Toaster } from "sonner";

// Initialize fonts
const _geist = Fresh_Font_Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const _geistMono = Fresh_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const _sourceSerif_4 = Fresh_Font_Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Fresh FinTracker",
  description: "Acompanhe suas finanças pessoais com facilidade e eficiência.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
