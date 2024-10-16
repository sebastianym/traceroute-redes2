import type { Metadata } from "next";
import { NextUIProvider } from "@nextui-org/react";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";

// Define fonts without exporting
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PROYECTO FINAL PARTE I - REDES DE COMUNICACIONES II",
  description: "TRAZA DE RUTAS LOCALES Y REMOTAS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-black ${fontSans.variable} antialiased`}>
        <NextUIProvider>{children}</NextUIProvider>
      </body>
    </html>
  );
}
