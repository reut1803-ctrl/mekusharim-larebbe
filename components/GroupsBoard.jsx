"use client";

import PhoneActions from "./PhoneActions";
import { groupInfo } from "../lib/store";

// לוח הבקרה: לכל קבוצה כותרת בולטת ונקייה - שם המדרשה והמיקום,
// אשת הקשר והטלפון - ומתחתיה הבנות בגלילה לרוחב.
const NO_GROUP = "__nogroup__";

export default function GroupsBoard({ candidates, newIds, renderCard }) {
  // קיבוץ הבנות לפי הקבוצה שאליה שויכו
  const map = new Map();
  candidates.forEach((c) => {
    const key = c.group || NO_GROUP;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(c);
  });

  const groups = [...map.keys()]
    .filter((k) => k !== NO_GROUP)
    .sort((a, b) => a.localeCompare(b, "he"))
    .map((name) => ({ key: name, info: groupInfo(name), list: map.get(name) }));

  if (map.has(NO_GROUP)) {
    groups.push({
      key: NO_GROUP,
      info: { midrasha: "ללא קבוצה", contactName: "", contactPhone: "" },
      list: map.get(NO_GROUP),
      plain: true,
    });
  }

  if (groups.length === 0) {
    return <p className="text-sm text-ink/40">אין עדיין מועמדות במאגר.</p>;
  }

  return (
    <div className="space-y-7">
      {groups.map(({ key, info, list, plain }) => (
        <section key={key}>
          {/* כותרת הקבוצה - בליטה נקייה מעל כרטיסיות הבנות */}
          <div
            className={`rounded-2xl px-4 py-3 ${
              plain ? "bg-sand/50" : "border border-sand bg-parchment"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className={`text-lg font-bold ${plain ? "text-ink/70" : "text-brandDark"}`}>
                {info.midrasha}
              </h2>
              <span className="shrink-0 rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold text-white">
                {list.length}
              </span>
            </div>

            {(info.contactName || info.contactPhone) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {info.contactName && (
                  <span className="text-sm font-semibold text-ink">{info.contactName}</span>
                )}
                {info.contactPhone && (
                  <PhoneActions phone={info.contactPhone} name={info.contactName} small />
                )}
              </div>
            )}
          </div>

          {/* הבנות בגלילה לרוחב */}
          <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-1">
            <div className="flex w-max gap-3">
              {list.map((c) => (
                <div key={c.id} className="w-[248px] shrink-0">
                  {renderCard(c, newIds.has(c.id))}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
