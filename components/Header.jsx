import Link from "next/link";
import Logo from "./Logo";

// כותרת עליונה: האיור לצד שם המערכת.
// האיור מפורט, ולכן בגודל הדר הוא לבדו נקרא כמו כתם - השם לצידו נותן לו עוגן.
export default function Header({ children }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sand/70 bg-ivory/90 px-4 py-2.5 backdrop-blur">
      <Link href="/" className="flex min-w-0 items-center gap-2.5">
        <Logo className="h-12 w-auto shrink-0" />
        <span className="truncate text-base font-bold leading-tight text-brandDark">חיבורים ללב</span>
      </Link>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </header>
  );
}
