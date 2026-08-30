import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      { find: /^.*\.(jpg|png|webp)$/, replacement: `${root}tests/helpers/imageStub.ts` },
      { find: /^~\//, replacement: root },
    ],
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
