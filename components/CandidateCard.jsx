"use client";

import { useState } from "react";
import Modal from "./Modal";
import CandidateEditor from "./CandidateEditor";
import Recorder from "./Recorder";
import PhoneActions from "./PhoneActions";
import InterviewSummary from "./InterviewSummary";
import { visibleFields, genderLabel } from "../lib/questions";

import { copyClean, downloadPdf } from "../lib/export";
import { displayRep } from "../lib/store";

// כרטיס מועמד: תצוגה מקוצרת + תצוגה מורחבת (טופס מלא).
export default function CandidateCard({ candidate, reps, canEdit, canSeeSensitive, currentRepId, isAdmin = false, onUpdate, onDelete, selectable = false, selected = false, onToggleSelect, isNew = false }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // הנציג/ה המוצג/ת ליצירת קשר: מחליף/ה אם המשויך/ת בחופשה, אחרת המשויך/ת.
  const rep = displayRep(candidate, reps);

  async function handleCopy() {
    await copyClean(candidate, canSeeSensitive);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      {/* כרטיס מקוצר */}
      <div
        className={`card cursor-pointer transition hover:shadow-lg ${selectable && selected ? "border-brand ring-2 ring-brand/25" : ""}`}
        onClick={() => (selectable ? onToggleSelect(candidate.id) : setOpen(true))}
      >
        <div className="flex items-center gap-3">
          {selectable && (
            <input
              type="checkbox"
              className="h-5 w-5 shrink-0 accent-brand"
              checked={selected}
              onChange={() => onToggleSelect(candidate.id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`סימון ${candidate.fullName}`}
            />
          )}
          {candidate.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={candidate.photo} alt={candidate.fullName} className="h-14 w-14 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-parchment text-2xl">👤</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-semibold text-ink">{candidate.fullName}</p>
              {isNew && (
                <span className="shrink-0 rounded-full bg-sageSoft px-1.5 py-0.5 text-[10px] font-bold text-sage">
                  חדשה
                </span>
              )}
            </div>
            <p className="text-sm text-ink/60">
              {candidate.gender === "female" ? "בחורה" : "בחור"} · גיל {candidate.age}
            </p>
            <p className="truncate text-xs text-ink/50">נציג: {rep ? rep.name : "ללא שיוך"}</p>
            {candidate.group && (
              <span className="mt-1 inline-block rounded-full bg-sageSoft px-2 py-0.5 text-[11px] font-semibold text-sage">
                {candidate.group}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* תצוגה מורחבת */}
      {open && (
        <Modal title={candidate.fullName} onClose={() => { setOpen(false); setEditing(false); }}>
          {editing ? (
            <CandidateEditor
              initial={candidate}

              reps={reps}
              isAdmin={isAdmin}
              onSave={(form) => onUpdate(candidate.id, form).then(() => setEditing(false))}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div className="space-y-4">
              {candidate.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={candidate.photo} alt={candidate.fullName} className="h-32 w-32 rounded-2xl object-cover" />
              )}
              <div className="space-y-2">
                {visibleFields(false).map((f) => (
                  <p key={f.key} className="text-lg">
                    <span className="font-bold">{genderLabel(f, candidate.gender)}:</span> {candidate[f.key]}
                  </p>
                ))}
                <p className="text-lg"><span className="font-bold">שיוך נציג:</span> {rep ? `${rep.name} (${rep.institution})` : "ללא שיוך"}</p>
                {candidate.group && <p className="text-lg"><span className="font-bold">קבוצה:</span> {candidate.group}</p>}
              </div>

              {/* הטלפון של המועמד - גלוי לנציג/ה שמייצג/ת אותו ולמנהלת, ליצירת קשר מיידית */}
              {canSeeSensitive && candidate.phone && (
                <div className="rounded-2xl bg-parchment/60 p-4">
                  <p className="mb-2 text-base font-semibold text-brandDark">יצירת קשר עם {candidate.fullName}</p>
                  <PhoneActions phone={candidate.phone} name={candidate.firstName || candidate.fullName} />
                </div>
              )}

              {/* למי שאינו הנציג/ה של המועמד - הפנייה לנציג/ה שמייצג/ת אותו */}
              {!canSeeSensitive && rep && (
                <div className="rounded-2xl bg-parchment/60 p-4">
                  <p className="mb-2 text-base font-semibold text-brandDark">לפרטים ולבירורים — דרך הנציג: {rep.name}</p>
                  {rep.phone ? (
                    <div className="flex flex-wrap gap-2">
                      <a className="btn-soft" href={`tel:${rep.phone}`}>📞 שיחה</a>
                      <a className="btn-soft" href={`sms:${rep.phone}`}>💬 SMS</a>
                      <a className="btn-soft" href={`https://wa.me/${rep.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">🟢 וואטסאפ</a>
                    </div>
                  ) : (
                    <p className="text-sm text-ink/60">לא הוגדר טלפון לנציג זה.</p>
                  )}
                </div>
              )}

              {/* כרטיס המועמד - הטקסט שנכתב ו/או הצילום שהועלה */}
              {(candidate.cardText || candidate.cardImage) && (
                <div className="space-y-3 border-t border-sand pt-3">
                  <p className="text-base font-bold text-brandDark">🗂️ כרטיס מועמד</p>
                  {candidate.cardText && (
                    <div className="whitespace-pre-wrap rounded-2xl bg-parchment/50 p-4 text-lg leading-relaxed text-ink/90">
                      {candidate.cardText}
                    </div>
                  )}
                  {candidate.cardImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={candidate.cardImage} alt="כרטיס מועמד" className="w-full rounded-2xl border border-sand object-contain" />
                  )}
                </div>
              )}

              {/* מידע רגיש - גלוי רק לנציג ולמנהלת */}
              {canSeeSensitive && (
                <div className="rounded-2xl bg-brand/10 p-3">
                  <p className="mb-1 text-sm font-semibold text-brandDark">🔒 מידע רגיש (לנציג ולמנהלת בלבד)</p>
                  <p className="whitespace-pre-wrap text-sm text-ink/80">{candidate.sensitiveInfo || "—"}</p>
                </div>
              )}

              {/* סיכום הראיון של השדכנית - נשמר ומוצג בכרטיס */}
              <InterviewSummary candidate={candidate} canEdit={canEdit} />

              {/* הקלטות קוליות - כל הצוות מאזין; רק הנציג של המועמד והמנהלת מקליטים/מוחקים */}
              <Recorder candidateId={candidate.id} repId={currentRepId} canRecord={canEdit} />

              {/* ייצוא נתונים */}
              <div className="flex flex-wrap gap-2 border-t border-sand pt-3">
                <button className="btn-soft" onClick={handleCopy}>📋 {copied ? "הועתק!" : "העתקה ללוח"}</button>
                <button className="btn-soft" onClick={() => downloadPdf(candidate, canSeeSensitive)}>📄 הורדת PDF</button>
                {canEdit && <button className="btn-soft" onClick={() => setEditing(true)}>✏️ עריכה</button>}
                {onDelete && (
                  <button
                    className="btn-soft text-brandDark"
                    onClick={() => { if (confirm(`⚠️ למחוק לצמיתות את "${candidate.fullName}"?\nהפעולה אינה ניתנת לשחזור.`)) { onDelete(candidate.id); setOpen(false); } }}
                  >🗑️ מחיקה</button>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
