"use client";

import { useState, useMemo } from "react";
import PhoneActions from "./PhoneActions";
import { displayRep } from "../lib/store";

// לוח המדרשות: כרטיסיות בגלילה לרוחב, ומתחת לכל מדרשה - הבנות המשויכות אליה.
// המדרשה נגזרת משדה המוסד של אנשי הקשר, כך שאין צורך במבנה נתונים נוסף:
// כל נציג/ה הוא/היא איש קשר של המדרשה שרשומה אצלו/ה.
const NEW_KEY = "__new__";
const NONE_KEY = "__none__";

export default function MidrashotBoard({ candidates, reps, newIds, renderCard }) {
  const [selected, setSelected] = useState(NEW_KEY);

  // קיבוץ אנשי הקשר לפי מדרשה
  const midrashot = useMemo(() => {
    const map = new Map();
    (reps || []).forEach((r) => {
      const name = (r.institution || "").trim();
      if (!name) return;
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(r);
    });
    return [...map.entries()]
      .map(([name, contacts]) => ({ name, contacts }))
      .sort((a, b) => a.name.localeCompare(b.name, "he"));
  }, [reps]);

  // שיוך כל מועמדת למדרשה שלה, דרך הנציג/ה שמייצג/ת אותה
  const midrashaOf = (c) => (displayRep(c, reps)?.institution || "").trim();

  const tabs = [
    { key: NEW_KEY, title: "✨ חדשות", subtitle: "המצטרפות האחרונות", count: candidates.filter((c) => newIds.has(c.id)).length },
    ...midrashot.map((m) => ({
      key: m.name,
      title: m.name,
      contacts: m.contacts,
      count: candidates.filter((c) => midrashaOf(c) === m.name).length,
    })),
    { key: NONE_KEY, title: "ללא שיוך", subtitle: "ממתינות לשיוך", count: candidates.filter((c) => !midrashaOf(c)).length },
  ];

  const active = tabs.find((t) => t.key === selected) || tabs[0];
  const shown =
    active.key === NEW_KEY
      ? candidates.filter((c) => newIds.has(c.id))
      : active.key === NONE_KEY
      ? candidates.filter((c) => !midrashaOf(c))
      : candidates.filter((c) => midrashaOf(c) === active.key);

  return (
    <div className="space-y-4">
      {/* כרטיסיות מדרשה בגלילה לרוחב */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex w-max gap-3">
          {tabs.map((t) => {
            const on = t.key === active.key;
            return (
              <button
                key={t.key}
                onClick={() => setSelected(t.key)}
                className={`w-[210px] shrink-0 rounded-2xl border p-3 text-right transition ${
                  on ? "border-brand bg-parchment shadow-soft" : "border-sand bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`truncate font-bold ${on ? "text-brandDark" : "text-ink"}`}>{t.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      on ? "bg-brand text-white" : "bg-parchment text-brandDark"
                    }`}
                  >
                    {t.count}
                  </span>
                </div>

                {t.subtitle && <p className="mt-0.5 truncate text-xs text-ink/50">{t.subtitle}</p>}

                {/* אנשי הקשר של המדרשה */}
                {t.contacts && (
                  <div className="mt-1.5 space-y-0.5">
                    {t.contacts.slice(0, 3).map((c) => (
                      <p key={c.id} className="truncate text-xs text-ink/60">
                        {c.name}
                      </p>
                    ))}
                    {t.contacts.length > 3 && (
                      <p className="text-xs text-ink/40">ועוד {t.contacts.length - 3}</p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* פרטי המדרשה הנבחרת: אנשי קשר עם חיוג מהיר */}
      {active.contacts && active.contacts.length > 0 && (
        <div className="rounded-2xl bg-parchment/60 p-3">
          <p className="mb-2 text-sm font-bold text-brandDark">אנשי קשר · {active.title}</p>
          <div className="space-y-2">
            {active.contacts.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-ink">{c.name}</span>
                {c.phone ? (
                  <PhoneActions phone={c.phone} name={c.name} small />
                ) : (
                  <span className="text-xs text-ink/40">לא הוגדר טלפון</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* הבנות המשויכות - היררכית מתחת למדרשה */}
      {shown.length === 0 ? (
        <p className="text-sm text-ink/40">אין מועמדות להצגה כאן.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{shown.map((c) => renderCard(c))}</div>
      )}
    </div>
  );
}
