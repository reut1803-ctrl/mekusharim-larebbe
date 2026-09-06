/** @type {import('tailwindcss').Config} */

// פלטת הצבעים נדגמה מתמונת ההלבורוס: ורד עתיק, בורדו רך ונגיעות ירוק זית.
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF3F0",      // רקע העמוד - קרם ורדרד רך
        surface: "#FFFCFA",    // כרטיסים
        parchment: "#F3E5E2",  // משטחים רכים: כותרות מקטע, פאנלים, הדגשות
        sand: "#E7D3CE",       // מסגרות וקווים מפרידים
        brand: "#8A3E48",      // בורדו רך - כפתורים ופעולות ראשיות
        brandDark: "#6B2C35",  // בורדו עמוק - כותרות וריחוף
        rose: "#C08A90",       // ורד עתיק - הדגשות משניות
        sage: "#737B4B",       // ירוק זית - נגיעות ואישורים
        sageSoft: "#EDEFE2",   // ירוק זית בהיר מאוד - רקע נגיעות
        ink: "#3E2F33",        // טקסט - חום-שזוף כהה
      },
      fontFamily: {
        sans: ["Heebo", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(107, 44, 53, 0.10)",
      },
    },
  },
  plugins: [],
};
