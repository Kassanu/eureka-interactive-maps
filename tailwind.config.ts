import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import { fontRules } from './i18n/fonts'

export default {
  // Zone modules name the classes their front page button draws with. The scanner reads templates
  // by default, so without this those classes are purged from the build.
  content: ['zones/**/*.ts'],
  plugins: [plugin(({ addBase }) => addBase(fontRules()))],
} satisfies Config
