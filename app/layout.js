import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script"; // <-- ✅ Import Script here

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AniHorizon",
  description: "AniHorizon is your ultimate destination for discovering, streaming, and staying updated with your favorite anime. Features include HD streaming, airing schedules, advanced search, watchlists, and dark mode for an immersive experience.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Site Verification */}
        <meta
          name="google-site-verification"
          content="dBQleXg1iqrPJtghwYbq0_uxK3uxetRZVVmwHnmXICM"
        />
        <meta name="google-adsense-account" content="ca-pub-2855084793444345"/>

  
      </head>
      <body
      
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        {children}
      </body>
    </html>
  );
}
