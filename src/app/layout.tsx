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
  manifest: "/manifest.json",
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
        {/* Anti-FOUC Theme Initialization Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('finoch_theme') || localStorage.getItem('voicash_theme') || localStorage.getItem('finra_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
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
        <script
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
        />
      </body>
    </html>
  );
}
