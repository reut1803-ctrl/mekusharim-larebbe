"use client";

import { visibleFields, genderLabel } from "./questions";

// ייצוא נקי של מועמד - ללא "מידע רגיש".
// הטלפון נכלל רק כשמותר לצפות בו (canSeeSensitive = הנציג/ה של המועמד או המנהלת).
// כרטיס המועמד שנכתב על ידי הצוות נכלל בייצוא; צילום הכרטיס אינו נכלל בטקסט.
export function buildCleanLines(candidate, canSeeSensitive = false) {
  const g = candidate.gender;
  const lines = [];
  lines.push(`מסלול: ${g === "female" ? "בחורה" : "בחור"}`);
  visibleFields(canSeeSensitive).forEach((f) => {
    lines.push(`${genderLabel(f, g)}: ${candidate[f.key] || ""}`);
  });
  if (candidate.cardText) {
    lines.push("");
    lines.push("כרטיס מועמד:");
    lines.push(candidate.cardText);
  }
  return lines;
}

export function buildCleanText(candidate, canSeeSensitive = false) {
  return buildCleanLines(candidate, canSeeSensitive).join("\n");
}

export async function copyClean(candidate, canSeeSensitive = false) {
  const text = buildCleanText(candidate, canSeeSensitive);
  await navigator.clipboard.writeText(text);
}

// שיתוף כרטיס מלא (טקסט נקי ומכובד) דרך תפריט השיתוף של המכשיר; גיבוי - העתקה ללוח.
export async function shareClean(candidate, canSeeSensitive = false) {
  const text = buildCleanText(candidate, canSeeSensitive);
  const title = candidate.fullName || "מועמד";
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (e) {
      if (e && e.name === "AbortError") return "canceled";
    }
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}

// יצירת PDF נקי. שימוש ב-html2canvas כדי לתמוך בעברית ובכיווניות RTL.
export async function downloadPdf(candidate, canSeeSensitive = false) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const node = document.createElement("div");
  node.dir = "rtl";
  node.style.cssText =
    "position:fixed;top:-10000px;right:0;width:900px;padding:56px;background:#FFFCFA;color:#3E2F33;font-family:Heebo,system-ui,sans-serif;line-height:1.7;font-size:24px;";

  const esc = (s) =>
    String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const g = candidate.gender;
  let html = `<h1 style="color:#6B2C35;margin:0 0 8px;font-size:46px;">${esc(candidate.fullName)}</h1>`;
  html += `<div style="margin-bottom:28px;color:#999;font-size:22px;">${g === "female" ? "בחורה" : "בחור"}</div>`;

  // פרטים אישיים - כל פרט במשבצת בהירה
  html += `<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px;">`;
  visibleFields(canSeeSensitive).forEach((f) => {
    html += `<div style="background:#F3E5E2;border-radius:14px;padding:12px 18px;font-size:23px;min-width:45%;"><strong style="color:#6B2C35;">${esc(genderLabel(f, g))}:</strong> ${esc(candidate[f.key])}</div>`;
  });
  html += `</div>`;

  // כרטיס המועמד - הטקסט שנכתב, ואחריו צילום הכרטיס אם הועלה
  if (candidate.cardText) {
    html += `<div style="margin-bottom:22px;">`;
    html += `<div style="font-weight:700;color:#6B2C35;font-size:25px;margin-bottom:8px;">כרטיס מועמד</div>`;
    html += `<div style="background:#F3E5E2;border-radius:16px;padding:16px 20px;font-size:24px;white-space:pre-wrap;">${esc(candidate.cardText)}</div>`;
    html += `</div>`;
  }
  if (candidate.cardImage) {
    html += `<img src="${esc(candidate.cardImage)}" style="width:100%;border-radius:16px;margin-bottom:22px;" />`;
  }
  node.innerHTML = html;
  document.body.appendChild(node);

  try {
    const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#FFFCFA" });
    const img = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
    }
    pdf.save(`${candidate.fullName || "מועמד"}.pdf`);
  } finally {
    document.body.removeChild(node);
  }
}

// ----- PDF של לוח הראיונות -----
// מעוצב בפלטת האתר: בורדו רך, ורד עתיק ונגיעת ירוק זית בהפסקה.
// כל שדכנית מקבלת עמוד משלה.
const PDF_COLORS = {
  brand: "#8A3E48",
  brandDark: "#6B2C35",
  parchment: "#F3E5E2",
  sand: "#E7D3CE",
  sage: "#737B4B",
  sageSoft: "#EDEFE2",
  ink: "#3E2F33",
  surface: "#FFFCFA",
};

export async function downloadSchedulePdf({ group, dateLabel, blocks }) {
  const [{ default: jsPDF }, { default: html2canvas }, { toTime }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
    import("./schedule"),
  ]);

  const esc = (s) =>
    String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const C = PDF_COLORS;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let b = 0; b < blocks.length; b++) {
    const { rep, schedule } = blocks[b];

    const node = document.createElement("div");
    node.dir = "rtl";
    node.style.cssText =
      `position:fixed;top:-10000px;right:0;width:840px;padding:52px;background:${C.surface};` +
      `color:${C.ink};font-family:Heebo,system-ui,sans-serif;line-height:1.6;`;

    let html = "";
    html += `<div style="border-bottom:3px solid ${C.sand};padding-bottom:18px;margin-bottom:26px;">`;
    html += `<div style="font-size:34px;font-weight:800;color:${C.brandDark};">לוח ראיונות</div>`;
    html += `<div style="font-size:23px;margin-top:6px;color:${C.brand};font-weight:600;">${esc(rep.name)}${rep.institution ? ` · ${esc(rep.institution)}` : ""}</div>`;
    html += `<div style="font-size:18px;margin-top:4px;color:${C.ink};opacity:.65;">קבוצה: ${esc(group)}${dateLabel ? ` · ${esc(dateLabel)}` : ""}</div>`;
    html += `</div>`;

    html += `<table style="width:100%;border-collapse:separate;border-spacing:0 8px;font-size:21px;">`;
    schedule.rows.forEach((r) => {
      if (r.type === "break") {
        html += `<tr><td colspan="3" style="background:${C.sageSoft};border-radius:12px;padding:12px 18px;color:${C.sage};font-weight:700;">`;
        html += `${toTime(r.start)}–${toTime(r.end)} &nbsp;·&nbsp; הפסקה`;
        html += `</td></tr>`;
        return;
      }
      const bg = r.overflow ? C.parchment : C.surface;
      const border = r.overflow ? C.brand : C.sand;
      html += `<tr>`;
      html += `<td style="background:${bg};border:1px solid ${border};border-left:none;border-radius:0 12px 12px 0;padding:12px 18px;width:120px;font-weight:800;color:${C.brandDark};white-space:nowrap;">${toTime(r.start)}</td>`;
      html += `<td style="background:${bg};border-top:1px solid ${border};border-bottom:1px solid ${border};padding:12px 10px;font-weight:600;">${esc(r.candidate.fullName)}</td>`;
      const details = [r.candidate.age ? `גיל ${esc(r.candidate.age)}` : "", esc(r.candidate.studyWork || "")].filter(Boolean).join(" · ");
      html += `<td style="background:${bg};border:1px solid ${border};border-right:none;border-radius:12px 0 0 12px;padding:12px 18px;font-size:18px;opacity:.7;">${details}</td>`;
      html += `</tr>`;
    });
    html += `</table>`;

    if (schedule.overflowCount > 0) {
      html += `<div style="margin-top:22px;background:${C.parchment};border-radius:12px;padding:14px 18px;font-size:18px;color:${C.brandDark};">`;
      html += `שימו לב: ${schedule.overflowCount} ראיונות חורגים משעת הסיום המתוכננת.`;
      html += `</div>`;
    }

    html += `<div style="margin-top:34px;border-top:1px solid ${C.sand};padding-top:12px;font-size:16px;opacity:.55;">`;
    html += `חיבורים ללב · ${esc(String(schedule.rows.filter((r) => r.type === "interview").length))} ראיונות`;
    html += `</div>`;

    node.innerHTML = html;
    document.body.appendChild(node);
    try {
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: C.surface });
      const img = canvas.toDataURL("image/jpeg", 0.92);
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      if (b > 0) pdf.addPage();
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position -= pageH;
        pdf.addPage();
        pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
        heightLeft -= pageH;
      }
    } finally {
      document.body.removeChild(node);
    }
  }

  const safe = String(group || "לוח-ראיונות").replace(/[\\/:*?"<>|]/g, "-");
  pdf.save(`לוח ראיונות - ${safe}.pdf`);
}
