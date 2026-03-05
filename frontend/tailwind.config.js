/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                github: {
                    bg: '#0d1117',
                    sidebar: '#161b22',
                    border: '#30363d',
                    accent: '#58a6ff',
                    card: '#21262d',
                    text: '#c9d1d9',
                }
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'],
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
