module.exports = {
  plugins: [require('daisyui')],
  daisyui: {
    themes: [{
      light: {
        ...require("daisyui/src/theming/themes")["[data-theme=light]"],
        "primary": "#2563eb",
        "primary-focus": "#1d4ed8",
        "secondary": "#f1f5f9",
        "secondary-focus": "#e2e8f0",
        "accent": "#22c55e",
        "accent-focus": "#16a34a",
        "neutral": "#1e293b",
        "base-100": "#ffffff",
        "base-200": "#f8fafc",
        "base-300": "#f1f5f9",
      }
    }],
    darkTheme: "light",
  }
};
