import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Translate } from '../i18n/translate'
import { localized } from '../model/localized'
import * as lookups from '../model/lookups'
import { NameSchema } from '../model/primitives'

const TERMS_DIR = join(process.cwd(), 'data/terms')

function isLookup(value: unknown): value is { keys: readonly string[] } {
  return typeof value === 'object' && value !== null && 'keys' in value && 'labels' in value
}

const domains = Object.entries(lookups).flatMap(([name, value]): [string, readonly string[]][] =>
  isLookup(value) ? [[name, value.keys]] : [])

const files = readdirSync(TERMS_DIR).filter(file => file.endsWith('.json'))

function termText(domain: string): string {
  return readFileSync(join(TERMS_DIR, `${domain}.json`), 'utf8')
}

// JSON.parse puts integer-like keys first whatever order they were written in, so the order a
// translator sees is read off the text.
function writtenKeys(text: string): string[] {
  return [...text.matchAll(/^ {4}"([^"]+)": \{$/gm)].map(match => match[1]!)
}

describe('the term tables', () => {
  it('finds the domains at all, so an empty list cannot pass this file', () => {
    expect(domains.length).toBe(10)
  })

  it('hold one table per domain, named after its export, and no others', () => {
    expect(files.map(file => file.replace(/\.json$/, '')).sort())
      .toEqual(domains.map(([name]) => name).sort())
  })

  it('are each reachable through termTables, which translation coverage counts', () => {
    const tables = lookups.termTables as Record<string, Record<string, unknown>>
    expect(Object.keys(tables).sort()).toEqual(domains.map(([name]) => name).sort())
    for (const [name, keys] of domains) expect(Object.keys(tables[name]!).sort(), name).toEqual([...keys].sort())
  })

  it.each(domains)('%s parses as Localized names', name => {
    const table = JSON.parse(termText(name)) as Record<string, unknown>
    for (const [key, entry] of Object.entries(table)) {
      expect(localized(NameSchema).safeParse(entry).success, `${name}.${key}`).toBe(true)
    }
  })

  it.each(domains)('%s offers its keys in the order the table is written', (name, keys) => {
    expect([...keys]).toEqual(writtenKeys(termText(name)))
  })

  it('have replaced the lookups block in the English messages', () => {
    const messages = JSON.parse(readFileSync(join(process.cwd(), 'i18n/locales/en.json'), 'utf8'))
    expect(Object.keys(messages)).not.toContain('lookups')
  })
})

describe('a table lookup', () => {
  const translator = (locale: Translate['locale']): Translate =>
    Object.assign((key: string) => key, { locale })
  const table = lookups.defineTable({ fire: { en: 'Fire', ja: '火' }, ice: { en: 'Ice' } })

  it('labels a key in the translator\'s locale', () => {
    expect(table.label('fire', translator('ja'))).toBe('火')
    expect(table.label('fire', translator('en'))).toBe('Fire')
  })

  it('falls back to the English where the locale has no entry', () => {
    expect(table.label('fire', translator('de'))).toBe('Fire')
    expect(table.label('ice', translator('ja'))).toBe('Ice')
  })
})
