/** @type {import('next').NextConfig} */

// כשהבנייה היא ל-GitHub Pages (משתנה הסביבה GITHUB_PAGES=true),
// מפיקים אתר סטטי תחת הנתיב /mekusharim-larebbe.
const isPages = process.env.GITHUB_PAGES === "true";
const REPO = "/mekusharim-larebbe";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isPages ? REPO : "",
  assetPrefix: isPages ? `${REPO}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isPages ? REPO : "",
  },
};

export default nextConfig;
