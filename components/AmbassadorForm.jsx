"use client";

import { useState, useEffect } from "react";
import Logo from "./Logo";
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

const DRAFT_KEY = `${STORAGE_PREFIX}ambassador_draft`;
const blank = () => ({ uid: `g${Date.now()}${Math.random().toString(36).slice(2, 7)}` });

export default function AmbassadorForm() {
  const [ambassador, setAmbassador] = useState("");
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
          setAmbassador(d.ambassador || "");
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ambassador, girls }));
    } catch (e) {}
  }, [ambassador, girls]);

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
      await addCandidatesFromAmbassador(payload, ambassador.trim());
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {}
      setDone(payload.length);
    } catch (e) {
      setFailed("השליחה נכשלה. בדקי חיבור לאינטרנט ונסי שוב — כל מה שמילאת נשמר ולא הלך לאיבוד.");
      setSending(false);
    }
  }

  if (done > 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12 text-center">
        <Logo className="mb-8 w-56 max-w-[70%]" />
        <div className="card w-full max-w-md space-y-3">
          <p className="text-5xl">🌸</p>
          <h1 className="text-2xl font-bold text-brandDark">תודה רבה!</h1>
          <p className="text-lg leading-relaxed text-ink/80">
            {done === 1 ? "הכרטיס נשלח בהצלחה" : `${done} הכרטיסים נשלחו בהצלחה`} וכבר נמצא/ים אצל הצוות.
          </p>
          <button
            className="btn-soft w-full"
            onClick={() => {
              setGirls([blank()]);
              setDone(0);
              setSending(false);
            }}
          >
            שליחת כרטיסים נוספים
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8 pb-32">
      <div className="mb-6 text-center">
        <Logo className="mx-auto mb-4 w-52 max-w-[65%]" />
        <h1 className="text-2xl font-bold text-brandDark">בנות מדרשה</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink/60">
          אפשר למלא כמה בנות ברצף באותו מסך — כפתור ״הוספת בת נוספת״ פותח כרטיס חדש,
          והכול נשלח יחד בלחיצה אחת.
        </p>
      </div>

      <div className="card mb-5">
        <label className="field-label">שם השגרירה (לא חובה)</label>
        <input
          className="field-input"
          value={ambassador}
          onChange={(e) => setAmbassador(e.target.value)}
          placeholder="כדי שנדע ממי הגיעו הכרטיסים"
        />
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
