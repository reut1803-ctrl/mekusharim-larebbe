"use client";

import { useState } from "react";
import { assignCandidatesBulk, existingGroups } from "../lib/store";

// סרגל שיוך קבוצתי: מופיע כשמסומנות מועמדות, ומשייך את כולן יחד
// לשדכנית ו/או לקבוצה בלחיצה אחת.
export default function BulkAssignBar({ selectedIds, reps, onDone, onClear }) {
  const [rep, setRep] = useState("");
  const [group, setGroup] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [saving, setSaving] = useState(false);
  const groups = existingGroups();
  const count = selectedIds.length;

  async function apply() {
    const patch = {};
    if (rep) patch.assignedRep = rep === "__none__" ? "" : rep;
    const g = group === "__new__" ? newGroup.trim() : group;
    if (g) patch.group = g === "__none__" ? "" : g;

    if (Object.keys(patch).length === 0) {
      alert("צריך לבחור שדכנית או קבוצה לשיוך.");
      return;
    }
    setSaving(true);
    try {
      await assignCandidatesBulk(selectedIds, patch);
      setRep(""); setGroup(""); setNewGroup("");
      onDone();
    } catch (e) {
      alert("השיוך נכשל. בדקי חיבור לאינטרנט ונסי שוב.");
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-[68px] z-30 border-t border-sand bg-ivory/97 px-4 py-3 shadow-soft backdrop-blur">
      <div className="mx-auto max-w-3xl space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="font-bold text-brandDark">
            {count} {count === 1 ? "מועמדת מסומנת" : "מועמדות מסומנות"}
          </p>
          <button className="text-sm text-ink/50" onClick={onClear}>ניקוי הסימון</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select className="field-input !py-2.5 text-sm" value={rep} onChange={(e) => setRep(e.target.value)}>
            <option value="">שיוך לשדכנית…</option>
            <option value="__none__">— ללא שיוך —</option>
            {(reps || []).map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select className="field-input !py-2.5 text-sm" value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">שיוך לקבוצה…</option>
            <option value="__none__">— ללא קבוצה —</option>
            {groups.map((g) => <option key={g} value={g}>{g}</option>)}
            <option value="__new__">➕ קבוצה חדשה…</option>
          </select>
        </div>

        {group === "__new__" && (
          <input
            className="field-input !py-2.5 text-sm"
            placeholder="שם הקבוצה החדשה (לדוגמה: מחזור אדר)"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
          />
        )}

        <button className="btn-primary w-full !py-3" disabled={saving} onClick={apply}>
          {saving ? "משייך…" : "שיוך כל המסומנות"}
        </button>
      </div>
    </div>
  );
}
