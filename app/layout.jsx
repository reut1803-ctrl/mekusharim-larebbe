import "./globals.css";

export const metadata = {
  title: "חיבורים ללב",
  description: "חיבורים ללב — מערכת ניהול מועמדות ושידוכים",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
