import type { Metadata } from "next";
import { ThemeProvider } from "@/components/contexts/theme-provider";
import { Navbar } from "@/components/navbar";
import { Space_Mono, Space_Grotesk } from "next/font/google";
import { Footer } from "@/components/footer";
import "@docsearch/css";
import "@/styles/globals.css";
import "@/styles/syntax.css";

import MainWrapper from "@/components/MainWrapper";

const sansFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  weight: "400",
});

const monoFont = Space_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  applicationName: "Kraken Engine Docs",
  title: {
    default: "Kraken Engine - 2D Game Engine for Python",
    template: "%s | Kraken Engine",
  },
  description:
    "Kraken Engine - modern, flexible 2D game engine in Python. Docs, tutorials, API reference, and examples for rapid game development.",
  metadataBase: new URL("https://krakenengine.org"),
  keywords: [
    "Kraken Engine",
    "PyKraken",
    "Python game engine",
    "2D game engine",
    "Python game development",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Kraken Engine - 2D Game Engine for Python",
    description:
      "Modern, flexible 2D game engine designed for rapid development and creative control.",
    url: "https://krakenengine.org/",
    siteName: "Kraken Engine",
    locale: "en_US",
    images: [
      {
        url: "https://krakenengine.org/opengraph-image",
        alt: "Kraken Engine",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kraken Engine - 2D Game Engine for Python",
    description:
      "Modern, flexible 2D game engine designed for rapid development and creative control.",
    images: ["https://krakenengine.org/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="51FuVdeHR3lVbkJUCjnjv7_5yL4qFHENyflOnr8j9Hs" />
        <meta name="algolia-site-verification" content="A64DA3DC7E5E03DB" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Kraken Engine",
                url: "https://krakenengine.org/",
                logo: "https://krakenengine.org/images/knicon.svg",
                sameAs: [
                  "https://github.com/krakenengine",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                url: "https://krakenengine.org/",
                name: "Kraken Engine Docs",
                publisher: { "@type": "Organization", name: "Kraken Engine" },
              },
            ]),
          }}
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
      </head>
      <body
        className={`${sansFont.variable} ${monoFont.variable} font-regular antialiased tracking-wide`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <MainWrapper>{children}</MainWrapper>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
