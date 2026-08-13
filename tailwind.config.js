/** @type {import('tailwindcss').Config} */

// פלטת הצבעים נגזרת ישירות מהאיור של "הקהילה איתך":
// גווני הספיה של הדיו (#4D310E → #C39D61) והנייר החם שמתחתיו.
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF6EE",      // רקע העמוד - נייר חם ובהיר
        surface: "#FFFCF6",    // כרטיסים - לבן חמים, לא לבן קר
        parchment: "#F3E8D6",  // משטחים רכים: כפתורי משנה, כותרות מקטע, הדגשות
        sand: "#E7DAC4",       // מסגרות וקווים מפרידים
        brand: "#966B39",      // צבע הדיו המרכזי של האיור - כפתורים ופעולות
        brandDark: "#6E4A22",  // הגוון הכהה של האיור - כותרות, ריחוף, טקסט מודגש
        ink: "#3D2E1C",        // טקסט רגיל - חום כהה וחם, לא שחור
      },
      fontFamily: {
        sans: ["Heebo", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(110, 74, 34, 0.10)",
      },
    },
  },
  plugins: [],
};
