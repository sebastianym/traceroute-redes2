import type { Metadata } from "next";
import { NextUIProvider } from "@nextui-org/react";
import "./globals.css";
import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PROYECTO FINAL PARTE I - REDES DE COMUNICACIONES II",
  description: "TRAZA DE RUTAS LOCALES Y REMOTAS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black font-sans antialiased">
        <NextUIProvider>{children}</NextUIProvider>
      </body>
    </html>
  );
}
