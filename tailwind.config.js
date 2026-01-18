/**
 * Tailwind configuration for SVB: ensures App Router paths are scanned and typography aligns with the TV-first design.
 * Uses the Inter font loaded via next/font (see app/layout.tsx).
 */
module.exports = {
    darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-gray-50',
    'bg-gray-100',
    'bg-gray-200',
    'bg-gray-300',
    'bg-gray-400',
    'bg-blue-50',
    'bg-blue-100',
    'bg-blue-500',
    'bg-green-50',
    'bg-green-100',
    'bg-green-300',
    'bg-green-500',
    'bg-amber-50',
    'bg-amber-100',
    'bg-amber-500',
    'bg-emerald-50',
    'bg-emerald-100',
    'bg-emerald-500',
    'text-gray-500',
    'text-gray-800',
    'text-gray-900',
    'text-blue-800',
    'text-green-800',
    'text-amber-800',
    'text-emerald-800',
    'text-red-600',
    'border-gray-200',
    'border-blue-200',
    'border-green-200',
    'border-amber-200',
    'border-emerald-200',
    'data-[state=checked]:bg-gray-50',
    'data-[state=checked]:text-gray-900',
    'data-[state=checked]:bg-blue-50',
    'data-[state=checked]:text-blue-900',
    'data-[state=checked]:bg-green-50',
    'data-[state=checked]:text-green-900',
    'data-[state=checked]:bg-amber-50',
    'data-[state=checked]:text-amber-900',
    'data-[state=checked]:bg-emerald-50',
    'data-[state=checked]:text-emerald-900',
    '[&>div]:bg-gray-400',
    '[&>div]:bg-blue-500',
    '[&>div]:bg-green-500',
    '[&>div]:bg-amber-500',
    '[&>div]:bg-gray-300',
    'bg-green-50/50',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'ui-sans-serif',
  				'system-ui'
  			],
  			mono: [
  				'DM Mono"',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'monospace'
  			]
  		},
  		colors: {
  			tv: {
  				background: '#ffffff',
  				text: '#1a1a1a',
  				muted: '#6b7280'
  			},
  			status: {
  				received: {
  					light: '#e5e7eb',
  					text: '#374151'
  				},
  				quoted: {
  					light: '#dbeafe',
  					text: '#1e40af'
  				},
  				inprogress: {
  					light: '#d1fae5',
  					text: '#065f46'
  				},
  				completed: {
  					light: '#f3f4f6',
  					text: '#6b7280'
  				}
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
