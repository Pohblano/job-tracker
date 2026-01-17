/**
 * Tailwind configuration for SVB: ensures App Router paths are scanned and typography aligns with the TV-first design.
 * Uses the Inter font loaded via next/font (see app/layout.tsx).
 */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        tv: {
          background: '#ffffff',
          text: '#1a1a1a',
          muted: '#6b7280',
        },
        status: {
          received: {
            light: '#e5e7eb',
            text: '#374151',
          },
          quoted: {
            light: '#dbeafe',
            text: '#1e40af',
          },
          inprogress: {
            light: '#d1fae5',
            text: '#065f46',
          },
          completed: {
            light: '#f3f4f6',
            text: '#6b7280',
          },
        },
      },
    },
  },
  plugins: [],
};
