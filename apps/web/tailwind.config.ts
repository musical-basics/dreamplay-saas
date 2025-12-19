import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {},
    },
    safelist: [
        {
            pattern: /^(bg|text|border|p|m|w|h|gap|rounded|shadow|flex|grid|justify|items)-.+/,
        },
        "block",
        "inline-block",
        "hidden",
        "object-cover",
    ],
    plugins: [],
};
export default config;
