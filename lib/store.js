"use client";

import { db, auth } from "./firebase";
import { col, STORAGE_PREFIX } from "./config";
import { signInAnonymously } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  arrayUnion,
  Bytes,
} from "firebase/firestore";
import { DEFAULT_OPEN_QUESTIONS, DEFAULT_INTRO, DEFAULT_SHIDDUCH_QUESTIONS } from "./questions";

// שכבת נתונים מבוססת ענן (Firestore) - משותפת לכל המכשירים.
// נשמרת מטמון מקומי שמתעדכן בזמן אמת, כך שהרכיבים ממשיכים לקרוא loadData() באופן רגיל.

const DEFAULT_POPUP = { enabled: false, message: "", tips: [] };

const cache = {
  candidates: [],
  reps: [],
  tasks: [],
  matches: [],
  recordings: [],
  logs: [],
  intro: DEFAULT_INTRO,
  openQuestions: DEFAULT_OPEN_QUESTIONS,
  adminPassword: "admin1234",
  viewerPassword: "view1234",
  popup: DEFAULT_POPUP,
  shidduchQuestions: DEFAULT_SHIDDUCH_QUESTIONS,
};

let initialized = false;
let seeded = false;

// מעקב אחר מצב החיבור לשרת - לצורך הצגת הודעות שגיאה ברורות במסך ההתחברות.
let lastError = "";
let dataReady = false;
export function getConnectionError() {
  return lastError;
}
export function isDataReady() {
  return dataReady;
}
function recordError(where, e) {
  const code = (e && (e.code || e.name)) || "";
  const msg = (e && e.message) || String(e);
  lastError = `[${where}] ${code} ${msg}`.trim();
  notify();
}

// בדיקה אם האחסון המקומי (localStorage) זמין - נחסם בגלישה פרטית/דפדפן בתוך אפליקציה.
export function storageAvailable() {
  try {
    const k = "__store_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
}

// מוודא שהמכשיר מחובר (התחברות אנונימית) לפני כל פעולת כתיבה.
// זה מונע כשלים בנייד כשהטופס נשלח לפני שההתחברות הספיקה להסתיים.
let authPromise = null;
export function ensureAuth() {
  if (auth.currentUser) return Promise.resolve();
  if (!authPromise) {
    authPromise = signInAnonymously(auth).catch((e) => {
      authPromise = null; // מאפשר ניסיון חוזר בפעם הבאה
      recordError("auth", e); // כשל התחברות אנונימית (בד"כ חסימת עוגיות/אחסון או דפדפן בתוך אפליקציה)
      throw e;
    });
  }
  return authPromise;
}

// שם האירוע שמסמן לרכיבים "הנתונים התעדכנו" - נושא את קידומת המערכת
// כדי שלא יתנגש עם מערכת אחרת שנטענת באותו דפדפן.
export const UPDATE_EVENT = `${STORAGE_PREFIX}update`;

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(UPDATE_EVENT));
}

// הנציג/ה שמוצג/ת לגולשים ליצירת קשר עבור מועמד נתון.
// אם הנציג/ה המשויך/ת בחופשה (readOnly) ויש לו/ה מחליף/ה (coveredBy) - מציגים את המחליף/ה,
// כך שהשם של מי שבחופשה "נקבר" ופניות מנותבות למחליף/ה. השיוך במסד לא משתנה.
export function displayRep(candidate, reps) {
  if (!candidate) return null;
  const assigned = reps.find((r) => r.id === candidate.assignedRep);
  if (assigned && assigned.readOnly && (assigned.coveredBy || []).length > 0) {
    const cover = reps.find((r) => r.id === assigned.coveredBy[0]);
    if (cover) return cover;
  }
  return assigned || null;
}

// ----- יומן פעילות (Audit) -----
function actorName() {
  const u = getCurrentUser();
  if (!u) return "לא ידוע";
  if (u.role === "admin") return "מנהלת";
  if (u.role === "viewer") return "צופה";
  const rep = cache.reps.find((r) => r.id === u.repId);
  return rep ? rep.name : "נציג";
}
export function logAction(action) {
  // רישום פעולה תחת שם המבצע (fire-and-forget)
  ensureAuth()
    .then(() =>
      addDoc(collection(db, col("logs")), {
        actor: actorName(),
        action,
        at: new Date().toISOString(),
      })
    )
    .catch(() => {});
}

function subscribeCollection(name) {
  onSnapshot(
    collection(db, col(name)),
    (snap) => {
      cache[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      dataReady = true; // הגיעו נתונים מהשרת - המערכת טעונה
      notify();
    },
    (e) => recordError(`load:${name}`, e) // כשל קריאה (למשל חסימת אחסון/הרשאות)
  );
}

export function initStore() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  // התחברות אנונימית כדי לגשת למסד; לאחר מכן מתחילים להאזין לנתונים.
  ensureAuth()
    .catch(() => {})
    .finally(() => startSubscriptions());
}

function startSubscriptions() {
  subscribeCollection("candidates");
  subscribeCollection("reps");
  subscribeCollection("tasks");
  subscribeCollection("matches");
  subscribeCollection("recordings"); // מטא-דאטה בלבד (בלי האודיו הכבד)
  subscribeCollection("logs"); // יומן פעילות
  onSnapshot(doc(db, col("meta"), "config"), (snap) => {
    dataReady = true;
    if (snap.exists()) {
      const d = snap.data();
      cache.intro = d.intro || DEFAULT_INTRO;
      cache.openQuestions = d.openQuestions || DEFAULT_OPEN_QUESTIONS;
      cache.adminPassword = d.adminPassword || "admin1234";
      cache.viewerPassword = d.viewerPassword || "view1234";
      cache.popup = d.popup || DEFAULT_POPUP;
      cache.shidduchQuestions = d.shidduchQuestions || DEFAULT_SHIDDUCH_QUESTIONS;
    } else if (!seeded && !snap.metadata.fromCache) {
      // יצירה ראשונית - רק אם השרת עצמו מאשר שהמסמך אינו קיים.
      // חשוב: לא לפעול על סמך מטמון מקומי ריק (fromCache), אחרת הסיסמאות
      // וההגדרות היו נדרסות בכל טעינה במכשיר עם מטמון קר. merge מונע דריסה של שדות קיימים.
      seeded = true;
      setDoc(
        doc(db, col("meta"), "config"),
        {
          intro: DEFAULT_INTRO,
          openQuestions: DEFAULT_OPEN_QUESTIONS,
          adminPassword: "admin1234",
        },
        { merge: true }
      );
    }
    notify();
  }, (e) => recordError("load:config", e));
}

export function loadData() {
  initStore();
  return {
    candidates: cache.candidates,
    reps: cache.reps,
    tasks: cache.tasks,
    matches: cache.matches,
    recordings: cache.recordings,
    logs: cache.logs,
    intro: cache.intro,
    openQuestions: cache.openQuestions,
    adminPassword: cache.adminPassword,
    viewerPassword: cache.viewerPassword,
    popup: cache.popup,
    shidduchQuestions: cache.shidduchQuestions,
  };
}

// ----- מועמדים -----
export async function addCandidate(candidate) {
  await ensureAuth();
  const ref = await addDoc(collection(db, col("candidates")), {
    createdAt: new Date().toISOString(),
    assignedRep: "",
    sensitiveInfo: "",
    ...candidate,
  });
  logAction(`הוסיף/ה מועמד: ${candidate.fullName || ""}`);
  return ref;
}
export async function updateCandidate(id, patch) {
  await ensureAuth();
  const name = cache.candidates.find((c) => c.id === id)?.fullName || patch.fullName || "";
  const res = await updateDoc(doc(db, col("candidates"), id), patch);
  logAction(`ערך/ה מועמד: ${name}`);
  return res;
}
export async function deleteCandidate(id) {
  await ensureAuth();
  const name = cache.candidates.find((c) => c.id === id)?.fullName || "";
  logAction(`מחק/ה מועמד: ${name}`);
  await deleteDoc(doc(db, col("candidates"), id));
  await Promise.all(
    cache.matches
      .filter((m) => m.manId === id || m.womanId === id)
      .map((m) => deleteDoc(doc(db, col("matches"), m.id)))
  );
  await Promise.all(
    cache.tasks
      .filter((t) => t.candidateId === id)
      .map((t) => deleteDoc(doc(db, col("tasks"), t.id)))
  );
}

// שיוך קבוצתי: מסמנים כמה מועמדות ומשייכים את כולן יחד לשדכנית ו/או לקבוצה.
// כותבים כרטיס-כרטיס אך מדווחים פעם אחת ליומן, כדי לא להציף אותו.
export async function assignCandidatesBulk(ids, patch) {
  await ensureAuth();
  const clean = {};
  if (patch.assignedRep !== undefined) clean.assignedRep = patch.assignedRep;
  if (patch.group !== undefined) clean.group = patch.group;
  if (Object.keys(clean).length === 0 || ids.length === 0) return;

  await Promise.all(ids.map((id) => updateDoc(doc(db, col("candidates"), id), clean)));

  const repName = clean.assignedRep
    ? cache.reps.find((r) => r.id === clean.assignedRep)?.name || "שדכנית"
    : null;
  const parts = [];
  if (repName) parts.push(`שויכו ל${repName}`);
  else if (clean.assignedRep === "") parts.push("בוטל השיוך");
  if (clean.group) parts.push(`קבוצה: ${clean.group}`);
  else if (clean.group === "") parts.push("הוסרו מהקבוצה");
  logAction(`${ids.length} מועמדות — ${parts.join(" · ")}`);
}

// פרטי הקבוצה (מדרשה, אשת קשר, טלפון) נלקחים מהכרטיסים עצמם -
// כל הבנות של אותה שליחה נושאות את אותם פרטים.
export function groupInfo(name) {
  const withInfo = cache.candidates.find(
    (c) => c.group === name && (c.contactName || c.contactPhone || c.midrasha)
  );
  return {
    name,
    midrasha: withInfo?.midrasha || name,
    contactName: withInfo?.contactName || "",
    contactPhone: withInfo?.contactPhone || "",
  };
}

// רשימת הקבוצות הקיימות במאגר, לפי מה שכבר שויך בפועל.
export function existingGroups() {
  const names = new Set();
  cache.candidates.forEach((c) => { if (c.group) names.add(c.group); });
  return [...names].sort((a, b) => a.localeCompare(b, "he"));
}

// סיכום הראיון של השדכנית - נשמר על כרטיס המועמדת ומוצג בו.
export async function saveInterviewSummary(id, text) {
  await ensureAuth();
  const name = cache.candidates.find((c) => c.id === id)?.fullName || "";
  const res = await updateDoc(doc(db, col("candidates"), id), {
    interviewSummary: text,
    interviewSummaryBy: actorName(),
    interviewSummaryAt: new Date().toISOString(),
  });
  logAction(`עדכן/ה סיכום ראיון: ${name}`);
  return res;
}

// קליטת מועמדות מהטופס החיצוני - כמה כרטיסים נפרדים בשליחה אחת.
// פרטי הקבוצה (מדרשה, אשת קשר וטלפון) נשמרים על כל כרטיס, ושם המדרשה
// הוא גם שם הקבוצה - כך השיוך, לוח הראיונות ולוח הבקרה עובדים מיד.
export async function addCandidatesFromAmbassador(list, groupInfo = {}) {
  await ensureAuth();
  const now = new Date().toISOString();
  const meta = {
    midrasha: groupInfo.midrasha || "",
    contactName: groupInfo.contactName || "",
    contactPhone: groupInfo.contactPhone || "",
    group: groupInfo.midrasha || "",
  };
  const refs = [];
  for (const c of list) {
    const ref = await addDoc(collection(db, col("candidates")), {
      createdAt: now,
      assignedRep: "",
      sensitiveInfo: "",
      gender: "female",
      source: "ambassador",
      ...meta,
      ...c,
    });
    refs.push(ref);
  }
  return refs;
}

// ----- נציגים -----
export async function addRep(rep) {
  await ensureAuth();
  return addDoc(collection(db, col("reps")), rep);
}
export async function updateRep(id, patch) {
  await ensureAuth();
  return updateDoc(doc(db, col("reps"), id), patch);
}
export async function deleteRep(id) {
  await ensureAuth();
  // מעבירים את המועמדים של הנציג ל"ללא שיוך" כדי שלא ייעלמו
  await Promise.all(
    cache.candidates
      .filter((c) => c.assignedRep === id)
      .map((c) => updateDoc(doc(db, col("candidates"), c.id), { assignedRep: "" }))
  );
  return deleteDoc(doc(db, col("reps"), id));
}

// ----- משימות -----
export async function addTask(task) {
  await ensureAuth();
  return addDoc(collection(db, col("tasks")), { done: false, ...task });
}
export async function updateTask(id, patch) {
  await ensureAuth();
  return updateDoc(doc(db, col("tasks"), id), patch);
}
export async function deleteTask(id) {
  await ensureAuth();
  return deleteDoc(doc(db, col("tasks"), id));
}

// ----- התאמות -----
export async function addMatch(match) {
  await ensureAuth();
  const man = cache.candidates.find((c) => c.id === match.manId)?.fullName || "";
  const woman = cache.candidates.find((c) => c.id === match.womanId)?.fullName || "";
  const ref = await addDoc(collection(db, col("matches")), {
    status: "נוצרה התאמה",
    createdAt: new Date().toISOString(),
    ...match,
  });
  logAction(`יצר/ה התאמה: ${man} — ${woman}`);
  return ref;
}
export async function updateMatch(id, patch) {
  await ensureAuth();
  return updateDoc(doc(db, col("matches"), id), patch);
}
export async function deleteMatch(id) {
  await ensureAuth();
  return deleteDoc(doc(db, col("matches"), id));
}
// הוספת עדכון/הערה ליומן המעקב של ההתאמה - עם שם המבצע/ת והתאריך.
export async function addMatchUpdate(id, text) {
  await ensureAuth();
  const entry = { by: actorName(), at: new Date().toISOString(), text };
  const res = await updateDoc(doc(db, col("matches"), id), { updates: arrayUnion(entry) });
  logAction(`הוסיף/ה עדכון להתאמה`);
  return res;
}

// ----- הגדרות (הקדמה, שאלות, סיסמת מנהלת) -----
export async function updateOpenQuestions(questions) {
  await ensureAuth();
  return setDoc(doc(db, col("meta"), "config"), { openQuestions: questions }, { merge: true });
}
export async function updateIntro(intro) {
  await ensureAuth();
  return setDoc(doc(db, col("meta"), "config"), { intro }, { merge: true });
}
export async function updateAdminPassword(password) {
  await ensureAuth();
  return setDoc(doc(db, col("meta"), "config"), { adminPassword: password }, { merge: true });
}
export async function updateViewerPassword(password) {
  await ensureAuth();
  return setDoc(doc(db, col("meta"), "config"), { viewerPassword: password }, { merge: true });
}
export async function updatePopup(popup) {
  await ensureAuth();
  return setDoc(doc(db, col("meta"), "config"), { popup }, { merge: true });
}
// רשימת השאלות של האזור "איזה שאלות אני שואל בשידוך" - עריכה למנהלת בלבד.
export async function updateShidduchQuestions(questions) {
  await ensureAuth();
  const res = await setDoc(doc(db, col("meta"), "config"), { shidduchQuestions: questions }, { merge: true });
  logAction("עדכן/ה את השאלות לשידוך");
  return res;
}

// ----- הקלטות שמע -----
// המטא-דאטה נשמר באוסף recordings; האודיו עצמו נשמר בנפרד (recordingBlobs) ונטען רק בהשמעה.
export async function addRecording({ candidateId, repId, mime, durationSec, bytes }) {
  await ensureAuth();
  const ref = await addDoc(collection(db, col("recordings")), {
    candidateId,
    repId: repId || "",
    mime: mime || "audio/webm",
    durationSec: durationSec || 0,
    createdAt: new Date().toISOString(),
  });
  await setDoc(doc(db, col("recordingBlobs"), ref.id), { audio: Bytes.fromUint8Array(bytes) });
  const name = cache.candidates.find((c) => c.id === candidateId)?.fullName || "";
  logAction(`הוסיף/ה הקלטה למועמד: ${name}`);
  return ref;
}

export async function getRecordingAudio(id) {
  await ensureAuth();
  const snap = await getDoc(doc(db, col("recordingBlobs"), id));
  if (!snap.exists()) return null;
  const b = snap.data().audio;
  return b && b.toUint8Array ? b.toUint8Array() : null;
}

export async function deleteRecording(id) {
  await ensureAuth();
  await deleteDoc(doc(db, col("recordings"), id));
  await deleteDoc(doc(db, col("recordingBlobs"), id));
}

// ----- מצב התחברות (מקומי לכל מכשיר) -----
const USER_KEY = `${STORAGE_PREFIX}user_v1`;

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(UPDATE_EVENT));
}
