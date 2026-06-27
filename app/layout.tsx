import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://zerodoxa.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zerodoxa | Premium File Tools for Every Workflow",
    template: "%s | Zerodoxa",
  },
  description:
    "Zerodoxa brings fast, secure, and modern file tools together in one premium platform for PDFs, images, documents, and everyday workflows.",
  keywords: [
    "Zerodoxa",
    "PDF tools",
    "file management",
    "document tools",
    "image converter",
    "OCR tools",
    "online file tools",
    "premium document platform",
  ],
  authors: [{ name: "Zerodoxa" }],
  creator: "Zerodoxa",
  publisher: "Zerodoxa",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Zerodoxa | Premium File Tools for Every Workflow",
    description:
      "Fast, secure, and modern file tools for PDFs, images, documents, and everyday workflows.",
    url: siteUrl,
    siteName: "Zerodoxa",
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 630,
        alt: "Zerodoxa brand mark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zerodoxa | Premium File Tools for Every Workflow",
    description:
      "Fast, secure, and modern file tools for PDFs, images, documents, and everyday workflows.",
    images: ["/icon.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-[#030712] text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
