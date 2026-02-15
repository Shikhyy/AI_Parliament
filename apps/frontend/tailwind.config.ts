import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#eca413",
                "background-light": "#f8f7f6",
                "background-dark": "#18181b",
                "surface-dark": "#27272a",
                "accent-gold": "#FFD700",
                "obsidian": "#130e0b",
                "obsidian-light": "#2a2420",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "mono": ["JetBrains Mono", "monospace"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                'cyber-grid': "linear-gradient(rgba(236, 164, 19, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(236, 164, 19, 0.03) 1px, transparent 1px)",
                'vignette': "radial-gradient(circle, transparent 60%, rgba(0,0,0,0.8) 100%)",
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            },
            animation: {
                marquee: 'marquee 30s linear infinite',
            }
        },
    },
    plugins: [],
};
export default config;
