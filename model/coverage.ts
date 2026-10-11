import { DEFAULT_LOCALE, LOCALE_CODES, type LocaleCode } from '../i18n/locales'
import { flatten, type Messages } from '../i18n/messages'
import type { Entity } from './entities'
import type { Localized } from './localized'

// A zone's figure counts the entries of its own entity file and nothing site-wide. A locale missing
// from an entry with a gameId or marked manual needs a hand fill; on any other entry, `update` fills it.

export interface Gap {
  group: string
  key: string
  english: string
}

export interface GameTextCoverage {
  entries: number
  held: number
  handFill: Gap[]
  awaitingUpdate: Gap[]
}

export interface TranslatedTextCoverage {
  entries: number
  held: number
  untranslated: Gap[]
}

export interface LocaleCoverage {
  zones: Record<string, GameTextCoverage>
  drops: GameTextCoverage
  terms: TranslatedTextCoverage
  ui: TranslatedTextCoverage
}

export type CoverageReport = Record<LocaleCode, LocaleCoverage>

export interface CoverageSources {
  // Each zone's entity file, by slug and then by group.
  zones: ReadonlyMap<string, ReadonlyMap<string, readonly Entity[]>>
  drops: readonly Entity[]
  terms: Readonly<Record<string, Readonly<Record<string, Localized>>>>
  messages: Readonly<Record<LocaleCode, Messages>>
}

export function coverageReport(sources: CoverageSources): CoverageReport {
  const english = flatten(sources.messages[DEFAULT_LOCALE])
  const zones = [...sources.zones]
  return Object.fromEntries(LOCALE_CODES.map(locale => [locale, {
    zones: Object.fromEntries(zones.map(([slug, groups]) => [slug, gameTextCoverage(groups, locale)])),
    drops: gameTextCoverage(new Map([['drops', sources.drops]]), locale),
    terms: termCoverage(sources.terms, locale),
    ui: messageCoverage(english, flatten(sources.messages[locale])),
  }])) as CoverageReport
}

// Rounds down, so only a source with nothing missing reads 100.
export function share({ entries, held }: { entries: number; held: number }): number {
  return entries === 0 ? 100 : Math.floor((held * 100) / entries)
}

function gameTextCoverage(
  groups: ReadonlyMap<string, readonly Entity[]>,
  locale: LocaleCode
): GameTextCoverage {
  const coverage: GameTextCoverage = { entries: 0, held: 0, handFill: [], awaitingUpdate: [] }
  for (const [group, entries] of groups) {
    for (const entry of entries) {
      coverage.entries++
      if (entry.name[locale] !== undefined) {
        coverage.held++
        continue
      }
      const gap = { group, key: entry.id, english: entry.name.en }
      if (entry.gameId !== undefined || entry.manual) coverage.handFill.push(gap)
      else coverage.awaitingUpdate.push(gap)
    }
  }
  return coverage
}

function termCoverage(
  tables: CoverageSources['terms'],
  locale: LocaleCode
): TranslatedTextCoverage {
  const coverage: TranslatedTextCoverage = { entries: 0, held: 0, untranslated: [] }
  for (const [table, terms] of Object.entries(tables)) {
    for (const [key, term] of Object.entries(terms)) {
      coverage.entries++
      if (term[locale] !== undefined) coverage.held++
      else coverage.untranslated.push({ group: table, key, english: term.en })
    }
  }
  return coverage
}

// The keys are en.json's, so a key only a locale file holds counts for nothing. vue-i18n renders a
// blank message as it stands rather than falling back to English, so one is not held either.
function messageCoverage(
  english: ReadonlyMap<string, string>,
  translated: ReadonlyMap<string, string>
): TranslatedTextCoverage {
  const coverage: TranslatedTextCoverage = { entries: 0, held: 0, untranslated: [] }
  for (const [key, text] of english) {
    coverage.entries++
    if (translated.get(key)?.trim()) coverage.held++
    else coverage.untranslated.push({ group: key.split('.')[0]!, key, english: text })
  }
  return coverage
}
