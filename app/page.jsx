import Link from "next/link";
import Logo from "../components/Logo";
import { IconLock } from "../components/Icons";

// מסך פתיחה. המערכת סגורה: אין הרשמה עצמית של מועמדים,
// והכניסה היחידה היא כניסת צוות לנציגים מורשים.
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        {/* לוגו נקי וללא רקע, ממורכז בראש העמוד */}
        <div className="mb-8 flex justify-center">
          <Logo className="h-56 w-auto max-w-[70%]" withName tagline="המעטפת בשידוכים לבנות מדרשה" />
        </div>

        <Link
          href="/admin"
          className="card flex flex-col items-center gap-2 py-8 transition hover:border-brand hover:shadow-lg"
        >
          <IconLock className="h-11 w-11 text-brand" />
          <span className="text-xl font-semibold text-brandDark">כניסת צוות</span>
          <span className="text-sm text-ink/50">למורשים בלבד</span>
        </Link>

        <p className="mt-8 text-sm leading-relaxed text-ink/50">
          המערכת מיועדת לצוות הנציגים בלבד.
        </p>
      </div>
    </main>
  );
}
