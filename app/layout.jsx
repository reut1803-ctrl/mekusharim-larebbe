import "./globals.css";

// כתובת האתר בייצור - נדרשת לכתובות מוחלטות בתגי השיתוף (Open Graph),
// שכן וואטסאפ ורשתות אחרות אינן יודעות לפענח כתובות יחסיות.
const SITE = "https://reut1803-ctrl.github.io/mekusharim-larebbe";
const OG_IMAGE = {
  url: `${SITE}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: "חיבורים ללב",
  type: "image/jpeg",
};
const DESCRIPTION = "המעטפת בשידוכים לבנות מדרשה";

export const metadata = {
  metadataBase: new URL(SITE),
  title: "חיבורים ללב",
  description: DESCRIPTION,
  applicationName: "חיבורים ללב",
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "חיבורים ללב",
    title: "חיבורים ללב",
    description: DESCRIPTION,
    url: `${SITE}/`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "חיבורים ללב",
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  icons: {
    icon: [
      { url: `${SITE}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${SITE}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${SITE}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#FAF3F0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
