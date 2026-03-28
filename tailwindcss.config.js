module.exports = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      inset: {
        '0': 0,
        '-1': '-1px',
        auto: 'auto',
        '1/2': '50%',
      },
      screens: {
        sm: { max: '639px' },
      },
    },
  },
  plugins: [],
  safelist: [
    /-(leave|enter|appear)(|-(to|from|active))$/,
    /^(?!(|.*?:)cursor-move).+-move$/,
    /^router-link(|-exact)-active$/,
    /data-v-.*/,
  ],
};
