import type { Metadata, Viewport } from "next";
import { Archivo, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { PwaInstallButton } from "@/components/layout/pwa-install-button";
import { OfflineBanner } from "@/components/layout/offline-banner";

// Workhorse UI face: a grotesque with tabular figures and a width axis for printed labels.
const uiFont = Archivo({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
  axes: ["wdth"],
});

// Display face for the giant numeral and headings: heavy, low-contrast figures so 1, 4 and 7 stay
// unmistakable at every size (the earlier hairline didone made a small 4 read as 1).
const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Finoch - Finansial Anak Kost Rapi Sekali Bicara",
  description: "Catat pengeluaran anak kost cukup dengan bicara. Jatah aman hari ini, dompet, amplop, tagihan, dan kasbon dalam satu aplikasi yang tetap jalan tanpa sinyal.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finoch",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B192C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${uiFont.variable} ${displayFont.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Anti-FOUC Theme Initialization Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var saved;
                try {
                  saved = localStorage.getItem('finoch_theme');
                  if (saved === null) {
                    saved = localStorage.getItem('voicash_theme') || localStorage.getItem('finra_theme');
                  }
                } catch (e) {}
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', saved === 'dark' || (saved !== 'light' && saved !== 'dark' && prefersDark));
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-paper text-ink min-h-screen font-sans transition-colors duration-300">
        {/* Real-time Offline & Online Sync Banner */}
        <OfflineBanner />

        {children}

        {/* Global Floating PWA Install Notification Button */}
        <PwaInstallButton />

        {/* Client-side Service Worker registration for PWA offline shell */}
        {process.env.NODE_ENV === "production" && <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      registration.update();
                      console.log('Finoch ServiceWorker registration successful:', registration.scope);
                    },
                    function(err) {
                      console.log('Finoch ServiceWorker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />}
      </body>
    </html>
  );
}
