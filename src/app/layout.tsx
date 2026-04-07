import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Premium Diet & Weight Tracker",
  description: "Advanced health tracking for high-performance individuals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          * { font-family: 'Inter', sans-serif; }
          h1, h2, h3, .gradient-text { font-family: 'Outfit', sans-serif; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
