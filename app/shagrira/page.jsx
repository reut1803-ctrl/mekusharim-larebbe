import AmbassadorForm from "../../components/AmbassadorForm";

// טופס הרישום החיצוני "בנות מדרשה".
// עמוד עצמאי שאינו מקושר ממסך הפתיחה - הכתובת נשלחת לשגרירות ישירות,
// כך שהמערכת עצמה נשארת סגורה מאחורי כניסת צוות.
const SITE = "https://reut1803-ctrl.github.io/mekusharim-larebbe";
const DESCRIPTION = "טופס רישום בנות מדרשה — מילוי מהיר של כמה מועמדות ושליחה אחת.";
const OG_IMAGE = {
  url: `${SITE}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: "חיבורים ללב",
  type: "image/jpeg",
};

export const metadata = {
  title: "בנות מדרשה · חיבורים ללב",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "חיבורים ללב",
    title: "בנות מדרשה",
    description: DESCRIPTION,
    url: `${SITE}/shagrira/`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "בנות מדרשה",
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function ShagriraPage() {
  return <AmbassadorForm />;
}
