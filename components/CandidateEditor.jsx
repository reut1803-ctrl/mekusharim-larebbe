"use client";

import { useState, useEffect } from "react";
import { compressImage } from "../lib/image";
import { PERSONAL_FIELDS, genderLabel, buildFullName, splitFullName } from "../lib/questions";
import { STORAGE_PREFIX } from "../lib/config";

// טופס להוספה/עריכה של מועמד על ידי נציג או מנהלת.
export default function CandidateEditor({ initial, reps, onSave, onCancel, isAdmin = false }) {
  // טיוטה אוטומטית - גם למועמד חדש וגם בעריכת מועמד קיים (לכל מועמד מפתח נפרד)
  const isNew = !initial || !initial.id;
  const DRAFT_KEY = isNew ? `${STORAGE_PREFIX}draft_admin_new` : `${STORAGE_PREFIX}draft_edit_${initial.id}`;

  const [form, setForm] = useState(() => {
    // כרטיס שנוצר לפני פיצול השם - משלימים שם פרטי/משפחה מתוך fullName
    const legacy = initial && !initial.firstName && !initial.lastName ? splitFullName(initial.fullName) : {};
    const base = {
      gender: "male",
      firstName: "",
      lastName: "",
      fullName: "",
      age: "",
      height: "",
      community: "",
      photo: "",
      cardText: "",
      cardImage: "",
      assignedRep: "",
      sensitiveInfo: "",
      restricted: false,
      hiddenFrom: [],
      ...initial,
      ...legacy,
    };
    if (typeof window !== "undefined") {
      try {
        const r = localStorage.getItem(DRAFT_KEY);
        if (r) return { ...base, ...JSON.parse(r) };
      } catch (e) {}
    }
    return base;
  });

  const [saving, setSaving] = useState(false);

  // שמירת טיוטה אוטומטית בכל שינוי
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch (e) {}
  }, [form, DRAFT_KEY]);

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
  }

  async function handleSave() {
    setSaving(true);
    try {
      // fullName נגזר מהשם הפרטי והמשפחה, כדי שכל שאר המערכת תמשיך לעבוד מולו
      await onSave({ ...form, fullName: buildFullName(form) });
      clearDraft(); // נמחק רק אחרי שמירה מוצלחת
    } catch (e) {
      alert("השמירה נכשלה. בדקי חיבור לאינטרנט ונסי שוב — המידע שהקלדת נשמר ולא אבד.");
      setSaving(false);
    }
  }

  function handleCancel() {
    clearDraft();
    onCancel();
  }

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  // העלאת תמונה לשדה נתון (תמונת המועמד או צילום כרטיס המועמד)
  async function onImage(key, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      set(key, await compressImage(file));
    } catch (err) {
      alert("לא הצלחנו לקרוא את הקובץ. אפשר להעלות תמונה (צילום מסך או צילום של הכרטיס), או לכתוב את הכרטיס בשדה הטקסט.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        <div>
          <label className="field-label">מסלול</label>
          <select className="field-input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="male">בחור</option>
            <option value="female">בחורה</option>
          </select>
        </div>
        {PERSONAL_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="field-label">{genderLabel(f, form.gender)}</label>
            <input
              className="field-input"
              type={f.type}
              value={form[f.key] || ""}
              onChange={(e) => set(f.key, e.target.value)}
            />
          </div>
        ))}
        <div>
          <label className="field-label">📷 תמונה</label>
          <input className="field-input" type="file" accept="image/*" onChange={(e) => onImage("photo", e)} />
          {form.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.photo} alt="תמונה" className="mt-3 h-24 w-24 rounded-2xl object-cover" />
          )}
        </div>
      </section>

      {/* כרטיס המועמד - אפשר לכתוב אותו כטקסט, להעלות צילום שלו, או שניהם */}
      <section className="space-y-4">
        <h3 className="font-semibold text-ink">🗂️ כרטיס מועמד</h3>
        <div>
          <label className="field-label">כתיבת הכרטיס</label>
          <textarea
            className="field-input min-h-[160px]"
            placeholder="אפשר לכתוב כאן את כרטיס המועמד במלואו."
            value={form.cardText || ""}
            onChange={(e) => set("cardText", e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">📎 העלאת כרטיס (צילום או צילום מסך)</label>
          <input className="field-input" type="file" accept="image/*" onChange={(e) => onImage("cardImage", e)} />
          {form.cardImage && (
            <div className="mt-3 space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.cardImage} alt="כרטיס מועמד" className="w-full rounded-2xl border border-sand object-contain" />
              <button type="button" className="btn-soft !py-1.5 text-sm" onClick={() => set("cardImage", "")}>
                הסרת הכרטיס שהועלה
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <label className="field-label">שיוך נציג</label>
          <select className="field-input" value={form.assignedRep || ""} onChange={(e) => set("assignedRep", e.target.value)}>
            <option value="">ללא שיוך</option>
            {(reps || []).map((r) => (
              <option key={r.id} value={r.id}>{r.name} ({r.institution})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">🔒 מידע רגיש (גלוי רק לנציג ולמנהלת)</label>
          <textarea
            className="field-input min-h-[80px]"
            placeholder="מסקנות אישיות ומספרי טלפון לבירורים"
            value={form.sensitiveInfo || ""}
            onChange={(e) => set("sensitiveInfo", e.target.value)}
          />
        </div>
        <label className="flex items-center gap-3 rounded-2xl bg-blush/40 p-3">
          <input type="checkbox" className="h-5 w-5 accent-rose" checked={!!form.restricted} onChange={(e) => set("restricted", e.target.checked)} />
          <span className="text-sm font-medium text-ink">🔒 כרטיס מוגבל — גלוי רק למנהלת ולנציג המשויך (מוסתר משאר הנציגים)</span>
        </label>

        {/* הסתרה נקודתית מנציגים מסוימים - למנהלת בלבד */}
        {isAdmin && (
          <div className="rounded-2xl bg-amber-50 p-3">
            <p className="mb-1 text-sm font-semibold text-amber-800">🙈 הסתרה מנציגים מסוימים (למנהלת בלבד)</p>
            <p className="mb-2 text-xs text-ink/60">סמני נציגים שמהם כרטיס זה יוסתר (למשל מטעמי רגישות או קרבת משפחה). שאר הנציגים ימשיכו לראות כרגיל.</p>
            <div className="space-y-1">
              {(reps || []).map((r) => {
                const hidden = (form.hiddenFrom || []).includes(r.id);
                return (
                  <label key={r.id} className="flex items-center gap-2 text-sm text-ink/80">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-rose"
                      checked={hidden}
                      onChange={(e) => {
                        const cur = form.hiddenFrom || [];
                        set("hiddenFrom", e.target.checked ? [...cur, r.id] : cur.filter((id) => id !== r.id));
                      }}
                    />
                    {r.name}
                  </label>
                );
              })}
              {(reps || []).length === 0 && <p className="text-xs text-ink/40">אין נציגים.</p>}
            </div>
          </div>
        )}
      </section>

      <div className="flex gap-3">
        <button className="btn-primary flex-1" disabled={saving} onClick={handleSave}>{saving ? "שומר…" : "שמירה"}</button>
        <button className="btn-soft flex-1" onClick={handleCancel}>ביטול</button>
      </div>
    </div>
  );
}
