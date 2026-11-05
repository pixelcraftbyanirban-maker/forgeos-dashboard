/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          orange: '#F25C19',
          'orange-hover': '#D94E10',
          'orange-light': '#FFF3ED',
          black: '#0A0D12',
          alabaster: '#F4F5F7',
          aluminum: '#CBD5E1',
          'aluminum-light': '#E2E8F0',
          steel: '#475569',
          'steel-muted': '#64748B',
          white: '#FFFFFF',
        },
        // Machine state semantics
        machine: {
          running: '#059669',
          'running-bg': '#ECFDF5',
          idle: '#D97706',
          'idle-bg': '#FFFBEB',
          setup: '#2563EB',
          'setup-bg': '#EFF6FF',
          stopped: '#64748B',
          'stopped-bg': '#F1F5F9',
          alarm: '#DC2626',
          'alarm-bg': '#FEF2F2',
        },
        // Production state semantics
        prod: {
          not_started: '#64748B',
          in_progress: '#F25C19',
          completed: '#059669',
          on_hold: '#D97706',
        },
        // Connection & data states
        connection: {
          current: '#059669',
          delayed: '#D97706',
          disconnected: '#DC2626',
          incomplete: '#64748B',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'flat': '0 1px 2px 0 rgba(10, 13, 18, 0.05)',
        'elevated': '0 4px 6px -1px rgba(10, 13, 18, 0.08), 0 2px 4px -2px rgba(10, 13, 18, 0.04)',
      }
    },
  },
  plugins: [],
}
