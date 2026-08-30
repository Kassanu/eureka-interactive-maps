import type { Config } from 'tailwindcss'

// Zone modules name the classes their front page button draws with. The scanner reads templates
// by default, so without this those classes are purged from the build.
export default {
  content: ['zones/**/*.ts'],
} satisfies Config
