/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan the app AND the shared component source so their classes are generated.
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [require("@app-cn/ui/tailwind-preset")],
};
