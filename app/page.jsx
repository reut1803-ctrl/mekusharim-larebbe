import Link from "next/link";
import Logo from "../components/Logo";

// מסך פתיחה. המערכת סגורה: אין הרשמה עצמית של מועמדים,
// והכניסה היחידה היא כניסת צוות לנציגים מורשים.
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        {/* לוגו נקי וללא רקע, ממורכז בראש העמוד */}
        <div className="mb-10 flex justify-center">
          <Logo className="w-72 max-w-[85%]" />
        </div>

        <Link
          href="/admin"
          className="card flex flex-col items-center gap-2 py-8 transition hover:border-rose hover:shadow-lg"
        >
          <span className="text-5xl leading-none">🔐</span>
          <span className="text-xl font-semibold text-roseDark">כניסת צוות</span>
          <span className="text-sm text-ink/50">למורשים בלבד</span>
        </Link>

        <p className="mt-8 text-sm leading-relaxed text-ink/50">
          המערכת מיועדת לצוות הנציגים בלבד.
        </p>
      </div>
    </main>
  );
}
