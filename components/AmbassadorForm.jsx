"use client";

import { useState, useEffect } from "react";
import Logo from "./Logo";
import { IconHeart } from "./Icons";
import { compressImage } from "../lib/image";
import { addCandidatesFromAmbassador } from "../lib/store";
import { AMBASSADOR_REQUIRED } from "../lib/questions";
import { STORAGE_PREFIX } from "../lib/config";

// שדות הכרטיס שהשגרירה ממלאת. התמונה מומלצת אך אינה חובה.
const FIELDS = [
  { key: "firstName", label: "שם פרטי", type: "text" },
  { key: "lastName", label: "שם משפחה", type: "text" },
  { key: "age", label: "גיל", type: "number", inputMode: "numeric" },
  { key: "height", label: "גובה", type: "text", placeholder: "לדוגמה: 1.62" },
  { key: "studyWork", label: "מה לומדת / עובדת", type: "text" },
  { key: "lifestyle", label: "סגנון חיים", type: "text" },
  { key: "phone", label: "מספר טלפון", type: "tel", inputMode: "tel" },
];

// פרטי הקבוצה שבראש הטופס - הם עוגנת הקבוצה שתחתיה נרשמות הבנות.
const GROUP_FIELDS = [
  { key: "midrasha", label: "שם המדרשה ומיקום", placeholder: "לדוגמה: מדרשת אור · ירושלים" },
  { key: "contactName", label: "אשת קשר", placeholder: "שם מלא" },
  { key: "contactPhone", label: "טלפון", type: "tel", inputMode: "tel" },
];

const DRAFT_KEY = `${STORAGE_PREFIX}ambassador_draft`;
const blank = () => ({ uid: `g${Date.now()}${Math.random().toString(36).slice(2, 7)}` });

export default function AmbassadorForm() {
  const [group, setGroup] = useState({ midrasha: "", contactName: "", contactPhone: "" });
  const [girls, setGirls] = useState([blank()]);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(0);
  const [failed, setFailed] = useState("");

  // טיוטה מקומית - כדי שלא ילך לאיבוד מה שהוקלד אם הדף נסגר בטעות
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && Array.isArray(d.girls) && d.girls.length) {
          setGirls(d.girls);
          if (d.group) setGroup({ midrasha: "", contactName: "", contactPhone: "", ...d.group });
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ group, girls }));
    } catch (e) {}
  }, [group, girls]);

  function setField(i, key, value) {
    setGirls((g) => g.map((x, idx) => (idx === i ? { ...x, [key]: value } : x)));
    setErrors((e) => (e[`${i}:${key}`] ? { ...e, [`${i}:${key}`]: false } : e));
  }

  async function onPhoto(i, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setField(i, "photo", await compressImage(file));
    } catch (err) {
      alert("לא הצלחנו לקרוא את התמונה. אפשר להמשיך בלי תמונה ולהוסיף אותה בהמשך.");
    }
  }

  function addGirl() {
    setGirls((g) => [...g, blank()]);
    // גלילה לטופס החדש אחרי שהוא נוצר
    setTimeout(() => {
      const last = document.querySelector("[data-girl]:last-of-type");
      if (last) last.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function removeGirl(i) {
    if (girls.length === 1) return;
    if (!confirm("להסיר את הכרטיס הזה מהרשימה?")) return;
    setGirls((g) => g.filter((_, idx) => idx !== i));
  }

  function validate() {
    const errs = {};
    GROUP_FIELDS.forEach((f) => {
      if (!String(group[f.key] || "").trim()) errs[`group:${f.key}`] = true;
    });
    girls.forEach((g, i) => {
      AMBASSADOR_REQUIRED.forEach((k) => {
        if (!String(g[k] || "").trim()) errs[`${i}:${k}`] = true;
      });
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit() {
    setFailed("");
    if (!validate()) {
      const first = document.querySelector("[data-invalid='true']");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSending(true);
    try {
      const payload = girls.map((g) => ({
        firstName: g.firstName.trim(),
        lastName: g.lastName.trim(),
        fullName: `${g.firstName.trim()} ${g.lastName.trim()}`.trim(),
        age: String(g.age).trim(),
        height: String(g.height).trim(),
        studyWork: g.studyWork.trim(),
        lifestyle: g.lifestyle.trim(),
        phone: g.phone.trim(),
        photo: g.photo || "",
      }));
      await addCandidatesFromAmbassador(payload, {
        midrasha: group.midrasha.trim(),
        contactName: group.contactName.trim(),
        contactPhone: group.contactPhone.trim(),
      });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {}
      setDone(payload.length);
    } catch (e) {
      setFailed("השליחה נכשלה. בדקי חיבור לאינטרנט ונסי שוב — כל מה שמילאת נשמר ולא הלך לאיבוד.");
      setSending(false);
    }
  }

  // מסך הסיום - מוצג מיד אחרי שליחה מוצלחת
  if (done > 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
        <div className="card w-full max-w-md space-y-5 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-parchment">
            <IconHeart className="h-9 w-9 text-brand" />
          </div>

          <h1 className="text-3xl font-bold text-ink">קיבלנו את הפרטים</h1>

          <p className="text-lg leading-relaxed text-ink/65">
            תודה שספרתם לנו עליכם. הפרטים הגיעו לצוות המשרד, ואנחנו נעבור עליהם
            באופן אישי. ניצור אתכם קשר בהקדם.
          </p>

          <div className="rounded-2xl bg-parchment/70 px-5 py-4">
            <p className="text-base leading-relaxed text-ink/60">
              הפרטים שמסרתם שומרים אצלנו בדיסקרטיות מלאה ואינם נחשפים לאף גורם
              מחוץ לצוות.
            </p>
          </div>
        </div>

        {/* אפשרות להמשיך לקבוצה נוספת, מבלי להעמיס על ההודעה עצמה */}
        <button
          className="mt-6 text-sm font-medium text-brand underline-offset-4 hover:underline"
          onClick={() => {
            setGirls([blank()]);
            setDone(0);
            setSending(false);
          }}
        >
          שליחת כרטיסים נוספים
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8 pb-32">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo className="h-36 w-auto" withName />
        <h1 className="text-2xl font-bold text-brandDark">בנות מדרשה</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink/60">
          אפשר למלא כמה בנות ברצף באותו מסך — כפתור ״הוספת בת נוספת״ פותח כרטיס חדש,
          והכול נשלח יחד בלחיצה אחת.
        </p>
      </div>

      <div className="card mb-5 space-y-4">
        <div className="border-b border-sand pb-2">
          <h2 className="font-bold text-brandDark">פרטי הקבוצה</h2>
          <p className="text-xs text-ink/55">הבנות שיוזנו מטה ישויכו לקבוצה הזו.</p>
        </div>
        {GROUP_FIELDS.map((f) => {
          const bad = !!errors[`group:${f.key}`];
          return (
            <div key={f.key} data-invalid={bad ? "true" : "false"}>
              <label className="field-label">
                {f.label} <span className="text-brand">*</span>
              </label>
              <input
                className={`field-input ${bad ? "border-brand ring-2 ring-brand/20" : ""}`}
                type={f.type || "text"}
                inputMode={f.inputMode}
                placeholder={f.placeholder || ""}
                value={group[f.key] || ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setGroup((g) => ({ ...g, [f.key]: v }));
                  setErrors((er) => (er[`group:${f.key}`] ? { ...er, [`group:${f.key}`]: false } : er));
                }}
              />
              {bad && <p className="mt-1 text-sm font-medium text-brand">שדה חובה</p>}
            </div>
          );
        })}
      </div>

      {girls.map((g, i) => (
        <section key={g.uid} data-girl className="card mb-5 space-y-4">
          <div className="flex items-center justify-between border-b border-sand pb-2">
            <h2 className="font-bold text-brandDark">בת {i + 1}</h2>
            {girls.length > 1 && (
              <button className="text-sm font-medium text-brand" onClick={() => removeGirl(i)}>
                הסרה
              </button>
            )}
          </div>

          {FIELDS.map((f) => {
            const bad = !!errors[`${i}:${f.key}`];
            return (
              <div key={f.key} data-invalid={bad ? "true" : "false"}>
                <label className="field-label">
                  {f.label} <span className="text-brand">*</span>
                </label>
                <input
                  className={`field-input ${bad ? "border-brand ring-2 ring-brand/20" : ""}`}
                  type={f.type}
                  inputMode={f.inputMode}
                  placeholder={f.placeholder || ""}
                  value={g[f.key] || ""}
                  onChange={(e) => setField(i, f.key, e.target.value)}
                />
                {bad && <p className="mt-1 text-sm font-medium text-brand">שדה חובה</p>}
              </div>
            );
          })}

          <div>
            <label className="field-label">📷 תמונה (מומלץ, לא חובה)</label>
            <input className="field-input" type="file" accept="image/*" onChange={(e) => onPhoto(i, e)} />
            {g.photo && (
              <div className="mt-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.photo} alt="תמונה" className="h-20 w-20 rounded-2xl object-cover" />
                <button className="btn-soft !py-1.5 text-sm" onClick={() => setField(i, "photo", "")}>
                  הסרת התמונה
                </button>
              </div>
            )}
          </div>
        </section>
      ))}

      <button className="btn-soft mb-5 w-full !py-3 text-base" onClick={addGirl}>
        ＋ הוספת בת נוספת
      </button>

      {failed && (
        <div className="mb-4 rounded-2xl bg-brand/10 px-4 py-3 text-center text-sm font-medium text-brandDark">
          {failed}
        </div>
      )}

      {/* סרגל שליחה קבוע בתחתית - נשאר בהישג יד גם ברשימה ארוכה */}
      <div className="fixed inset-x-0 bottom-0 border-t border-sand bg-ivory/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-xl">
          <button className="btn-primary w-full !py-3.5 text-base" disabled={sending} onClick={submit}>
            {sending ? "שולח…" : `שליחת ${girls.length === 1 ? "הכרטיס" : `${girls.length} הכרטיסים`}`}
          </button>
        </div>
      </div>
    </main>
  );
}
