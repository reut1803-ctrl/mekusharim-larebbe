// לוגו המערכת - איור צבעי המים של "חיבורים ללב".
// הקובץ הוא PNG עם רקע שקוף שחולץ מהמקור, כך שהאיור יושב ישירות על
// נייר העמוד בלי מלבן וללא מסגרת. שתי גרסאות:
//   full - האיור המלא, למסכי הכניסה
//   mark - חיתוך מרובע של אשכול הפרחים, להדר הצר
// באיור עצמו אין כיתוב, ולכן שם המערכת נוסף כטקסט (withName) ומעוצב
// כחלק מהסמל, במקום להיות שורה נפרדת ומנותקת.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const SRC = {
  full: `${BASE}/logo-v4.png`,
  mark: `${BASE}/logo-mark.png`,
};

export default function Logo({ className = "", variant = "full", withName = false, tagline = "" }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SRC[variant] || SRC.full}
      alt="חיבורים ללב"
      className={`select-none object-contain ${className}`}
      draggable={false}
    />
  );

  if (!withName) return img;

  return (
    <div className="flex flex-col items-center">
      {img}
      <p className="mt-3 text-2xl font-bold tracking-tight text-brandDark">חיבורים ללב</p>
      <span className="mt-2 block h-[3px] w-14 rounded-full bg-rose/70" />
      {tagline && <p className="mt-2 text-sm text-ink/55">{tagline}</p>}
    </div>
  );
}

export const LOGO_SRC = SRC.full;
