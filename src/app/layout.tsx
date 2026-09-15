import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MSJ | Enterprise Admin Portal",
  description: "Secure, high-performance administrative control system for MSJ",
  icons: {
    icon: [
      { url: "/api/site-settings/favicon", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/api/site-settings/favicon",
    apple: "/api/site-settings/favicon",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/api/site-settings/favicon" />
        <link rel="shortcut icon" href="/api/site-settings/favicon" />
        <link rel="apple-touch-icon" href="/api/site-settings/favicon" />
      </head>
      <body>{children}</body>
    </html>
  );
}

