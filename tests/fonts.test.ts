import type { PluginAPI } from 'tailwindcss/types/config'
import { describe, expect, it } from 'vitest'
import { canvasStyleFor, FONT_STACKS, fontFamily, fontRules } from '../i18n/fonts'
import { LOCALE_CODES } from '../i18n/locales'
import tailwindConfig from '../tailwind.config'

const JAPANESE_FACES = [
  '"Hiragino Sans"',
  '"Hiragino Kaku Gothic ProN"',
  '"Yu Gothic UI"',
  'Meiryo',
  '"Noto Sans CJK JP"',
  '"Noto Sans JP"',
]

const japanese = FONT_STACKS.ja ?? []

describe('the Japanese font stack', () => {
  it('never names system-ui', () => {
    expect(japanese).not.toContain('system-ui')
  })

  it('names a Japanese face ahead of the generic', () => {
    const named = JAPANESE_FACES.map(face => japanese.indexOf(face)).filter(index => index >= 0)
    expect(Math.min(...named)).toBeLessThan(japanese.indexOf('sans-serif'))
  })
})

describe('every font stack', () => {
  it.each(Object.entries(FONT_STACKS))('%s falls back to sans-serif', (_, stack) => {
    expect(stack).toContain('sans-serif')
  })
})

describe('the base rule', () => {
  it('sets the Japanese stack on anything marked lang="ja"', () => {
    expect(fontRules()).toEqual({ '[lang|="ja"]': { fontFamily: fontFamily('ja') } })
  })

  it('is what the Tailwind config adds to the base layer', () => {
    const added: unknown[] = []
    const api = { addBase: (rules: unknown) => added.push(rules) } as unknown as PluginAPI
    for (const { handler } of tailwindConfig.plugins) handler(api)
    expect(added).toEqual([fontRules()])
  })
})

describe('the canvas style', () => {
  it('carries the same Japanese stack as the page', () => {
    expect(canvasStyleFor('ja')).toEqual({ text: { fontFamily: fontFamily('ja') } })
  })

  it.each(LOCALE_CODES.filter(code => code !== 'ja'))('is left to the canvas default for %s', code => {
    expect(canvasStyleFor(code)).toBeUndefined()
  })
})
