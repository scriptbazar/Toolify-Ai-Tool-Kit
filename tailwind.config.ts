import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        cursive: ['Cursive', 'sans-serif'],
        cedarville: 'var(--font-cedarville)',
        dancing: 'var(--font-dancing)',
        indie: 'var(--font-indie)',
        kalam: 'var(--font-kalam)',
        marck: 'var(--font-marck)',
        patrick: 'var(--font-patrick)',
        permanent: 'var(--font-permanent)',
        rocksalt: 'var(--font-rocksalt)',
        sacramento: 'var(--font-sacramento)',
        caveat: 'var(--font-caveat)',
        pacifico: 'var(--font-pacifico)',
        'homemade-apple': 'var(--font-homemade-apple)',
        zeyada: 'var(--font-zeyada)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'marquee-left-to-right': {
          from: { transform: 'translateX(-25%)' },
          to: { transform: 'translateX(0)' },
        },
        'marquee-right-to-left': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(-25%)' },
        },
        'bounce': {
            '0%, 100%': {
                transform: 'translateY(-15%)',
                animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
            },
            '50%': {
                transform: 'translateY(0)',
                animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
            },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'marquee-left-to-right': 'marquee-left-to-right 60s linear infinite',
        'marquee-right-to-left': 'marquee-right-to-left 60s linear infinite',
        'bounce': 'bounce 1s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
