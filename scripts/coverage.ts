import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DEFAULT_LOCALE, LOCALE_CODES, type LocaleCode } from '../i18n/locales'
import { flatten, type Messages } from '../i18n/messages'
import { translationCoverage, zones } from '../zones'
import { renderCoverage } from './coverage-report'

const root = new URL('..', import.meta.url)

const messages = Object.fromEntries(LOCALE_CODES.map(code => [
  code,
  JSON.parse(readFileSync(new URL(`i18n/locales/${code}.json`, root), 'utf8')) as Messages,
])) as Record<LocaleCode, Messages>

const english = flatten(messages[DEFAULT_LOCALE])
const report = await translationCoverage(Object.values(zones), messages)
const html = renderCoverage(report, {
  zoneName: slug => english.get(`zones.${slug}.name`) ?? slug,
  generatedAt: new Date(),
})

const out = new URL('translation-coverage.html', root)
writeFileSync(out, html)
console.log(`Wrote ${fileURLToPath(out)}`)
