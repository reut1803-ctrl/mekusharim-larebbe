import AmbassadorForm from "../../components/AmbassadorForm";

// טופס הרישום החיצוני של השגרירות.
// עמוד עצמאי שאינו מקושר ממסך הפתיחה - הכתובת נשלחת לשגרירות ישירות,
// כך שהמערכת עצמה נשארת סגורה מאחורי כניסת צוות.
export const metadata = {
  title: "רישום מועמדות · מקושרים לרבי",
};

export default function ShagriraPage() {
  return <AmbassadorForm />;
}
