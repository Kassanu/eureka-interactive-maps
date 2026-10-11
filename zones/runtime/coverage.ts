import type { LocaleCode } from '../../i18n/locales'
import type { Messages } from '../../i18n/messages'
import { coverageReport, type CoverageReport } from '../../model/coverage'
import { dropEntries, type Entity } from '../../model/entities'
import { termTables } from '../../model/lookups'
import type { ZoneDefinition } from '../define/types'
import { parseEntities } from './loading'

// The caller supplies the messages because inside the Nuxt build @nuxtjs/i18n compiles every import
// of a locale file, so importing them here would count compiled messages rather than strings.
export async function translationCoverage(
  definitions: readonly ZoneDefinition[],
  messages: Readonly<Record<LocaleCode, Messages>>
): Promise<CoverageReport> {
  const zones = new Map<string, ReadonlyMap<string, readonly Entity[]>>()
  for (const definition of definitions) {
    const file = await definition.entities()
    zones.set(definition.slug, parseEntities(definition, file.default).entries)
  }
  return coverageReport({ zones, drops: dropEntries, terms: termTables, messages })
}
