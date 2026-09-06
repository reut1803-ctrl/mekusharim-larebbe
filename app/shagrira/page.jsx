import AmbassadorForm from "../../components/AmbassadorForm";

// טופס הרישום החיצוני של השגרירות.
// עמוד עצמאי שאינו מקושר ממסך הפתיחה - הכתובת נשלחת לשגרירות ישירות,
// כך שהמערכת עצמה נשארת סגורה מאחורי כניסת צוות.
export const metadata = {
  title: "בנות מדרשה · חיבורים ללב",
};

export default function ShagriraPage() {
  return <AmbassadorForm />;
}
