import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tom-orange': '#FF8C42',
        'sunny-yellow': '#FFD93D',
        'sky-blue': '#6BCF7F',
        'playful-pink': '#FF6B9D',
        'soft-purple': '#A78BFA',
      },
      borderRadius: {
        'tom': '20px',
        'tom-sm': '12px',
        'tom-lg': '25px',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'bounce-in': 'bounce-in 0.6s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'bounce-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3) translateY(-20px)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.05) translateY(0)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
        'slide-in': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'wiggle': {
          '0%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(1deg)',
          },
          '75%': {
            transform: 'rotate(-1deg)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(255, 140, 66, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(255, 140, 66, 0)',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
