import type { Metadata } from "next";
import { NextUIProvider } from "@nextui-org/react";
import "./globals.css";

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
      <body>
        <NextUIProvider>{children}</NextUIProvider>
      </body>
    </html>
  );
}
