"use client";

import { useState, useEffect } from "react";
import { saveInterviewSummary } from "../lib/store";

// סיכום הראיון של השדכנית על המועמדת - הקלדה ישירה בכרטיס.
// נשמר בכרטיס עם שם הכותב/ת ומועד העדכון, ומוצג לכל מי שרשאי/ת לראות את הכרטיס.
export default function InterviewSummary({ candidate, canEdit }) {
  const [text, setText] = useState(candidate.interviewSummary || "");
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");

  // עדכון שהגיע ממכשיר אחר - לא דורסים טקסט שנמצא כרגע בעריכה
  useEffect(() => {
    if (!editing) setText(candidate.interviewSummary || "");
  }, [candidate.interviewSummary, editing]);

  function fmt(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit" });
    } catch (e) { return ""; }
  }

  async function save() {
    setStatus("שומר…");
    try {
      await saveInterviewSummary(candidate.id, text.trim());
      setEditing(false);
      setStatus("נשמר ✓");
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      setStatus("");
      alert("השמירה נכשלה. בדקי חיבור לאינטרנט ונסי שוב — מה שכתבת עדיין כאן.");
    }
  }

  const saved = candidate.interviewSummary;

  return (
    <div className="rounded-2xl bg-sageSoft p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-base font-bold text-sage">📝 סיכום ראיון</p>
        {status && <span className="text-xs font-semibold text-sage">{status}</span>}
      </div>

      {!editing && (
        <>
          {saved ? (
            <>
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-ink/90">{saved}</p>
              {candidate.interviewSummaryBy && (
                <p className="mt-1.5 text-xs text-ink/50">
                  {candidate.interviewSummaryBy}
                  {candidate.interviewSummaryAt ? ` · ${fmt(candidate.interviewSummaryAt)}` : ""}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-ink/50">עדיין לא נכתב סיכום ראיון.</p>
          )}
          {canEdit && (
            <button className="btn-soft mt-3 !py-1.5 text-sm" onClick={() => setEditing(true)}>
              {saved ? "✏️ עריכת הסיכום" : "➕ הוספת סיכום"}
            </button>
          )}
        </>
      )}

      {editing && canEdit && (
        <div className="space-y-2">
          <textarea
            className="field-input min-h-[130px]"
            placeholder="ההתרשמות מהראיון — מה עלה, מה חשוב לזכור, המלצות להמשך."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="btn-primary flex-1 !py-2" onClick={save}>שמירה</button>
            <button
              className="btn-soft flex-1 !py-2"
              onClick={() => { setText(saved || ""); setEditing(false); setStatus(""); }}
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
