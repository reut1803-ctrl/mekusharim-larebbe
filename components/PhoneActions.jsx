"use client";

// כפתורי יצירת קשר מהירה עם מועמד: שיחה, וואטסאפ ו-SMS.
// מוצג רק למי שרשאי/ת לראות את הטלפון - המנהלת, הצופה, והנציג/ה שמייצג/ת את המועמד.
export default function PhoneActions({ phone, name, small = false, message = "" }) {
  if (!phone) return null;

  // ניקוי לספרות בלבד, והמרה לפורמט בינלאומי כדי שוואטסאפ יעבוד גם ממספר מקומי (05X → 9725X).
  const digits = phone.replace(/[^0-9]/g, "");
  const intl = digits.startsWith("0") ? `972${digits.slice(1)}` : digits;
  const enc = encodeURIComponent(message || `היי ${name || ""}`.trim());
  const size = small ? "!px-2.5 !py-1 text-xs" : "";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <a className={`btn-soft ${size}`} href={`tel:${digits}`}>📞 {phone}</a>
      <a className={`btn-soft ${size}`} href={`https://wa.me/${intl}?text=${enc}`} target="_blank" rel="noreferrer">🟢 וואטסאפ</a>
      <a className={`btn-soft ${size}`} href={`sms:${digits}`}>💬 SMS</a>
    </div>
  );
}
