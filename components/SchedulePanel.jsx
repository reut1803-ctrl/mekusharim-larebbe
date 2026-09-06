"use client";

import { useState } from "react";
import { displayRep, existingGroups } from "../lib/store";
import { buildSchedule, toTime, capacity, SCHEDULE } from "../lib/schedule";
import { downloadSchedulePdf } from "../lib/export";

// לוח ראיונות: בוחרים קבוצה, והמערכת מסדרת אוטומטית לו"ז לכל שדכנית
// (15 דקות לבת, 13:30–15:30, הפסקה באמצע) וניתן להוריד אותו כ-PDF.
export default function SchedulePanel({ data, user }) {
  const groups = existingGroups();
  const [group, setGroup] = useState(groups[0] || "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState("");

  const isAdmin = user.role === "admin";

  // מועמדות הקבוצה, מקובצות לפי השדכנית המשויכת
  const inGroup = data.candidates.filter((c) => group && c.group === group);
  const byRep = [];
  (data.reps || []).forEach((rep) => {
    const list = inGroup.filter((c) => displayRep(c, data.reps)?.id === rep.id);
    if (list.length) byRep.push({ rep, schedule: buildSchedule(list) });
  });
  const unassigned = inGroup.filter((c) => !displayRep(c, data.reps));

  // שדכנית רואה את הלו"ז שלה; המנהלת רואה את כולם
  const visible = isAdmin ? byRep : byRep.filter((b) => b.rep.id === user.repId);

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch (e) { return iso; }
  }

  async function exportPdf(entry) {
    setBusy(entry ? entry.rep.id : "all");
    try {
      await downloadSchedulePdf({
        group,
        dateLabel: fmtDate(date),
        blocks: entry ? [entry] : visible,
      });
    } catch (e) {
      alert("יצירת ה-PDF נכשלה. נסי שוב.");
    }
    setBusy("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-parchment px-4 py-3">
        <h2 className="text-lg font-bold text-brandDark">🗓️ לוח ראיונות</h2>
        <p className="text-xs leading-relaxed text-ink/60">
          {SCHEDULE.slotMinutes} דקות לכל בת, בין {toTime(SCHEDULE.startMinutes)} ל-{toTime(SCHEDULE.endMinutes)},
          כולל הפסקה של {SCHEDULE.breakMinutes} דקות באמצע — עד {capacity()} ראיונות לשדכנית.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="field-label">קבוצה</label>
          <select className="field-input !py-2.5" value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">בחירת קבוצה…</option>
            {groups.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">תאריך הראיונות</label>
          <input className="field-input !py-2.5" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {!group && <p className="text-sm text-ink/50">יש לבחור קבוצה כדי לראות את הלו"ז.</p>}

      {group && visible.length === 0 && (
        <p className="text-sm text-ink/50">
          אין עדיין מועמדות משויכות לשדכנית בקבוצה הזו. שייכי מועמדות במסך ״מועמדים״ (סימון מרובה ← שיוך).
        </p>
      )}

      {group && visible.length > 1 && (
        <button className="btn-soft w-full" disabled={!!busy} onClick={() => exportPdf(null)}>
          {busy === "all" ? "מכין PDF…" : "📄 הורדת PDF — כל השדכניות"}
        </button>
      )}

      {visible.map(({ rep, schedule }) => (
        <div key={rep.id} className="card space-y-3">
          <div className="flex items-center justify-between border-b border-sand pb-2">
            <div>
              <p className="font-bold text-brandDark">{rep.name}</p>
              <p className="text-xs text-ink/50">{rep.institution}</p>
            </div>
            <button className="btn-soft !px-3 !py-1.5 text-sm" disabled={!!busy} onClick={() => exportPdf({ rep, schedule })}>
              {busy === rep.id ? "מכין…" : "📄 PDF"}
            </button>
          </div>

          {schedule.overflowCount > 0 && (
            <p className="rounded-xl bg-brand/10 px-3 py-2 text-sm font-medium text-brandDark">
              ⚠️ {schedule.overflowCount} ראיונות חורגים מ-{toTime(SCHEDULE.endMinutes)} (הלו"ז נמשך עד {toTime(schedule.endsAt)}).
              אפשר להעביר חלק מהמועמדות לשדכנית אחרת.
            </p>
          )}

          <div className="space-y-1.5">
            {schedule.rows.map((r, i) =>
              r.type === "break" ? (
                <div key={`b${i}`} className="flex items-center gap-3 rounded-xl bg-sageSoft px-3 py-2">
                  <span className="font-mono text-sm font-bold text-sage">{toTime(r.start)}–{toTime(r.end)}</span>
                  <span className="text-sm font-semibold text-sage">☕ הפסקה</span>
                </div>
              ) : (
                <div
                  key={r.candidate.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${r.overflow ? "bg-brand/10" : "bg-parchment/50"}`}
                >
                  <span className="font-mono text-sm font-bold text-brandDark">{toTime(r.start)}</span>
                  <span className="flex-1 truncate text-ink">{r.candidate.fullName}</span>
                  {r.candidate.age && <span className="text-xs text-ink/50">גיל {r.candidate.age}</span>}
                </div>
              )
            )}
          </div>
        </div>
      ))}

      {group && isAdmin && unassigned.length > 0 && (
        <div className="card">
          <p className="mb-1 font-bold text-brandDark">ללא שיוך לשדכנית ({unassigned.length})</p>
          <p className="mb-2 text-xs text-ink/60">מועמדות בקבוצה שעדיין לא שויכו, ולכן אינן מופיעות בלו"ז.</p>
          <div className="space-y-1">
            {unassigned.map((c) => (
              <p key={c.id} className="text-sm text-ink/80">• {c.fullName}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
