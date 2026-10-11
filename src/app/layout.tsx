import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PwaInstallButton } from "@/components/layout/pwa-install-button";
import { OfflineBanner } from "@/components/layout/offline-banner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Finoch - Finansial Anak Kost Rapi Sekali Bicara",
  description: "Asisten finansial cerdas anak kost berbasis AI & suara (PWA, Local-first, Offline-ready, 100% Gratis untuk Seluruh Mahasiswa Indonesia).",
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
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable} suppressHydrationWarning>
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
      <body className="antialiased bg-[#FAF8F5] dark:bg-[#0A1120] text-[#0B192C] dark:text-[#F6F4ED] min-h-screen font-sans transition-colors duration-300">
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
