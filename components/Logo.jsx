// לוגו המערכת - האיור "הקהילה איתך" בגווני ספיה.
// קובץ PNG עם רקע שקוף, כך שהאיור יושב ישירות על הנייר של העמוד
// בלי מסגרת ובלי מלבן רקע. פלטת האתר נגזרת מגווני האיור הזה.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Logo({ className = "" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${BASE}/logo-v3.png`}
      alt="לוגו"
      className={`object-contain ${className}`}
    />
  );
}

export const LOGO_SRC = `${BASE}/logo-v3.png`;
