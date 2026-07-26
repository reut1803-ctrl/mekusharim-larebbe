"use client";

import { useState, useEffect } from "react";
import { updateShidduchQuestions } from "../lib/store";

// האזור "איזה שאלות אני שואל בשידוך".
// הצוות נכנס וקורא בלבד; המנהלת יכולה להוסיף, לערוך, לסדר מחדש ולמחוק שאלות.
export default function ShidduchQuestions({ data, isAdmin = false }) {
  const saved = data.shidduchQuestions || [];
  const [questions, setQuestions] = useState(saved);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");

  // כשמגיע עדכון מהשרת (מנהלת ששמרה במכשיר אחר) - מרעננים,
  // אבל לא באמצע עריכה כדי לא לדרוס טקסט שמוקלד כרגע.
  useEffect(() => {
    if (!editing) setQuestions(saved);
  }, [saved, editing]);

  function setText(i, value) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, text: value } : q)));
  }
  function add() {
    setQuestions((qs) => [...qs, { id: `q${Date.now()}`, text: "" }]);
  }
  function remove(i) {
    if (!confirm("למחוק את השאלה הזו?")) return;
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  }
  function move(i, dir) {
    setQuestions((qs) => {
      const next = [...qs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return qs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    // שאלות ריקות לא נשמרות
    const clean = questions.map((q) => ({ ...q, text: (q.text || "").trim() })).filter((q) => q.text);
    setStatus("שומר…");
    try {
      await updateShidduchQuestions(clean);
      setQuestions(clean);
      setEditing(false);
      setStatus("נשמר! הצוות רואה את העדכון.");
      setTimeout(() => setStatus(""), 2500);
    } catch (e) {
      setStatus("");
      alert("השמירה נכשלה. בדקי חיבור לאינטרנט ונסי שוב — מה שכתבת עדיין כאן.");
    }
  }

  function cancel() {
    setQuestions(saved);
    setEditing(false);
    setStatus("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-blush px-4 py-3">
        <h2 className="text-lg font-bold text-roseDark">❓ איזה שאלות אני שואל בשידוך</h2>
        <p className="text-xs text-ink/60">
          {isAdmin
            ? "רשימת השאלות המשותפת לצוות. מה שתשמרי כאן — כל הנציגים יראו."
            : "רשימת השאלות שהוגדרה על ידי ההנהלה."}
        </p>
      </div>

      {status && (
        <div className="rounded-2xl bg-blush/60 px-4 py-2 text-center text-sm font-semibold text-roseDark">{status}</div>
      )}

      {/* תצוגת קריאה - לכל הצוות, וגם למנהלת כשאינה במצב עריכה */}
      {!editing && (
        <div className="space-y-3">
          {questions.length === 0 && (
            <p className="text-sm text-ink/40">
              {isAdmin ? "עדיין לא הוגדרו שאלות. לחצי על \"עריכת השאלות\" כדי להתחיל." : "עדיין לא הוגדרו שאלות."}
            </p>
          )}
          {questions.map((q, i) => (
            <div key={q.id} className="card flex gap-3">
              <span className="font-bold text-rose">{i + 1}.</span>
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-ink/90">{q.text}</p>
            </div>
          ))}
          {isAdmin && (
            <button className="btn-primary w-full" onClick={() => setEditing(true)}>✏️ עריכת השאלות</button>
          )}
        </div>
      )}

      {/* מצב עריכה - למנהלת בלבד */}
      {editing && isAdmin && (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className="card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">שאלה {i + 1}</span>
                <div className="flex gap-1">
                  <button className="btn-soft !px-3 !py-1 text-sm" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                  <button className="btn-soft !px-3 !py-1 text-sm" onClick={() => move(i, 1)} disabled={i === questions.length - 1}>↓</button>
                  <button className="btn-soft !px-3 !py-1 text-sm text-roseDark" onClick={() => remove(i)}>🗑️</button>
                </div>
              </div>
              <textarea
                className="field-input min-h-[80px]"
                placeholder="נסחי כאן את השאלה"
                value={q.text || ""}
                onChange={(e) => setText(i, e.target.value)}
              />
            </div>
          ))}

          <button className="btn-soft w-full" onClick={add}>➕ הוספת שאלה</button>
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={save}>שמירה</button>
            <button className="btn-soft flex-1" onClick={cancel}>ביטול</button>
          </div>
        </div>
      )}
    </div>
  );
}
