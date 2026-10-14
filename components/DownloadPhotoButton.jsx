"use client";

import { useState, useRef, useEffect } from "react";
import { IconDownload } from "./Icons";

// כפתור הורדת תמונה מכרטיס המועמדת.
//
// הרכיב עצמאי לחלוטין: הוא מקבל את התמונה ואת השם כ-props בלבד, ואינו
// נוגע בשליפת הנתונים, בסטייט של הכרטיס או בכל לוגיקה קיימת.
//
// התמונות במערכת נשמרות כ-Data URL (ראו lib/image.js), ולכן ההורדה
// מקומית לגמרי - בלי בקשת רשת, בלי CORS, ועובדת גם בלי אינטרנט.
// השמירה דרך Blob ו-URL.createObjectURL מבטיחה שהקובץ יירד למכשיר
// במקום להיפתח בלשונית חדשה (התנהגות נפוצה של Data URL ארוך).

// שם קובץ בטוח: בלי תווים שמערכות קבצים חוסמות, ובלי רווחים.
function safeFileName(name, suffix) {
  const clean = String(name || "מועמדת")
    .replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  return `${clean || "מועמדת"}_${suffix}`;
}

// סיומת לפי סוג הקובץ בפועל; ברירת מחדל jpg כי כל התמונות נדחסות ל-JPEG.
function extensionOf(type) {
  if (!type) return "jpg";
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  return "jpg";
}

export default function DownloadPhotoButton({
  src,
  name,
  suffix = "תמונה",
  label = "הורדת תמונה",
  className = "",
}) {
  const [status, setStatus] = useState("");
  const timer = useRef(null);

  // ניקוי הטיימר ביציאה, כדי לא לעדכן סטייט על רכיב שכבר הוסר
  useEffect(() => () => clearTimeout(timer.current), []);

  function flash(text) {
    setStatus(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(""), 2500);
  }

  // רנדר רק אם באמת יש תמונה
  if (!src || typeof src !== "string") return null;

  async function download(e) {
    // הכרטיס עצמו לוכד קליקים - עוצרים כאן כדי שלא ייפתח/ייסגר בטעות
    e.preventDefault();
    e.stopPropagation();

    let objectUrl = "";
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (!blob || blob.size === 0) throw new Error("empty blob");

      objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = safeFileName(name, `${suffix}.${extensionOf(blob.type)}`);
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      flash("התמונה הורדה ✓");
    } catch (err) {
      // כשל שקט: הודעה קטנה ליד הכפתור, בלי קריסה ובלי חלון קופץ
      console.warn("[DownloadPhotoButton] הורדת התמונה נכשלה:", err);
      flash("ההורדה נכשלה, אפשר לנסות שוב");
    } finally {
      // שחרור הזיכרון; השהיה קצרה כדי שהדפדפן יספיק להתחיל את ההורדה
      if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    }
  }

  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <button type="button" className="btn-soft !px-3 !py-1.5 text-sm" onClick={download}>
        <IconDownload className="h-4 w-4" />
        {label}
      </button>
      {status && <span className="text-xs text-ink/55">{status}</span>}
    </div>
  );
}
