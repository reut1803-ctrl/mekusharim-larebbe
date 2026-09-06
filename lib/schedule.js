// בניית לוח זמנים לראיונות.
// כל ראיון 15 דקות, בין 13:30 ל-15:30, עם הפסקה מסודרת באמצע.
// החישוב דטרמיניסטי: אותה קבוצה תניב תמיד את אותו לו"ז בכל מכשיר.

export const SCHEDULE = {
  startMinutes: 13 * 60 + 30, // 13:30
  endMinutes: 15 * 60 + 30,   // 15:30
  slotMinutes: 15,
  breakMinutes: 15,
};

export function toTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// כמה ראיונות נכנסים בחלון הזמן (אחרי שמנכים את ההפסקה).
export function capacity() {
  const { startMinutes, endMinutes, slotMinutes, breakMinutes } = SCHEDULE;
  return Math.floor((endMinutes - startMinutes - breakMinutes) / slotMinutes);
}

// סדר קבוע ויציב למועמדות: לפי מועד ההוספה, ואם זהה - לפי מזהה.
export function orderCandidates(list) {
  return [...list].sort((a, b) => {
    const t = (a.createdAt || "").localeCompare(b.createdAt || "");
    return t !== 0 ? t : String(a.id).localeCompare(String(b.id));
  });
}

// בניית הלו"ז לשדכנית אחת.
// מחזיר שורות של ראיונות ושורת הפסקה אחת באמצע.
// אם יש יותר מועמדות מהקיבולת, הראיונות ממשיכים אחרי 15:30 ומסומנים כחריגה,
// כדי שאף מועמדת לא "תיעלם" מהלו"ז בלי שהמשתמשת תדע.
export function buildSchedule(candidates) {
  const { startMinutes, endMinutes, slotMinutes, breakMinutes } = SCHEDULE;
  const ordered = orderCandidates(candidates);
  const cap = capacity();
  const beforeBreak = Math.ceil(cap / 2); // ההפסקה באמצע
  const rows = [];
  let t = startMinutes;

  ordered.forEach((c, i) => {
    if (i === beforeBreak) {
      rows.push({ type: "break", start: t, end: t + breakMinutes, label: "הפסקה" });
      t += breakMinutes;
    }
    rows.push({
      type: "interview",
      start: t,
      end: t + slotMinutes,
      candidate: c,
      index: rows.filter((r) => r.type === "interview").length + 1,
      overflow: t + slotMinutes > endMinutes,
    });
    t += slotMinutes;
  });

  return {
    rows,
    endsAt: t,
    capacity: cap,
    overflowCount: ordered.length > cap ? ordered.length - cap : 0,
  };
}
