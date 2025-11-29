import type { Metadata } from "next";
import { Macondo, Zain } from "next/font/google";
import "./globals.css";

const macondo = Macondo({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-macondo",
  display: "swap",
});

const zain = Zain({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800", "900"],
  variable: "--font-zain",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BardSync",
  description: "Arcane Artifact for Tabletop RPGs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${macondo.variable} ${zain.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
