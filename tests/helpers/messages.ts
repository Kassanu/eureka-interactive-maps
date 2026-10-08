import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Translate } from '../../i18n/translate'

type Messages = { [key: string]: string | Messages }

const messages = JSON.parse(
  readFileSync(join(process.cwd(), 'i18n/locales/en.json'), 'utf8')
) as Messages

function lookup(key: string): string | undefined {
  let node: string | Messages | undefined = messages
  for (const part of key.split('.')) {
    if (typeof node !== 'object') return undefined
    node = node[part]
  }
  return typeof node === 'string' ? node : undefined
}

// The English side of vue-i18n, over the file the app ships, so a test asserting English text is
// asserting what en.json holds. An unknown key throws rather than rendering itself: a typo in a
// key would otherwise pass as a plausible-looking string.
export const english: Translate = Object.assign(
  (key: string, named?: Record<string, unknown>) => {
    const message = lookup(key)
    if (message === undefined) throw new Error(`no English message for ${key}`)
    return message.replace(/\{(\w+)\}/g, (whole, name: string) =>
      (named && name in named ? String(named[name]) : whole))
  },
  { locale: 'en' as const }
)
