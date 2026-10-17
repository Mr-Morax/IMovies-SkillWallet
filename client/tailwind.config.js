/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    red: "#E50914",
                    dark: "#0B0C0E",
                    card: "#14151B",
                    border: "#232634",
                    text: "#F1F5F9",
                    muted: "#94A3B8"
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            }
        },
    },
    plugins: [],
}