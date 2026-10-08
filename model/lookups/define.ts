import { z } from 'zod'
import type { Text, Translate } from '../../i18n/translate'
import { inLocale, type Localized } from '../localized'

// A closed domain of keys and the text each one displays. One declaration produces the runtime
// validator, the TypeScript union and the option list a select renders, so a key cannot exist in
// one of the three without the others.
//
// Keys are squashed lowercase with no separator (clearskies, atmosphericphantasms). A zone
// declares a subset of a domain: the Occult zones allow four elements where Eureka allows six,
// and subset() narrows the enum so a value legal in one zone fails to parse in another.
//
// `defineTable` reads each label from a table of Localized values in the active locale, and the
// table's own key order is the order every option list follows. `defineNames` holds English text
// for the drop names, which have no table yet.

export interface LookupOption<K extends string> {
  key: K
  label: Text
}

export interface Lookup<K extends string> {
  readonly keys: readonly K[]
  readonly labels: Readonly<Record<K, Text>>

  // Exactly one key.
  readonly key: z.ZodType<K, K>
  // One key, or "" for a scalar field holding nothing. Never null.
  readonly keyOrNone: z.ZodType<K | '', K | ''>
  // Zero or more keys, in the order they were added. Absent is [], never null.
  readonly list: z.ZodType<K[], K[]>

  label(key: string | null | undefined, t: Translate): string
  options(): readonly LookupOption<K>[]
  subset<S extends K>(keys: readonly S[]): Lookup<S>
}

export function defineTable<const K extends string>(entries: Readonly<Record<K, Localized>>): Lookup<K> {
  const keys = Object.keys(entries) as K[]
  const labels = {} as Record<K, Text>
  for (const key of keys) labels[key] = (t: Translate) => inLocale(entries[key], t.locale)
  return buildLookup(keys, labels)
}

export function defineNames<const K extends string>(names: Record<K, string>): Lookup<K> {
  const keys = Object.keys(names) as K[]
  const labels = {} as Record<K, Text>
  for (const key of keys) labels[key] = () => names[key]
  return buildLookup(keys, labels)
}

function buildLookup<K extends string>(keys: readonly K[], labels: Record<K, Text>): Lookup<K> {
  const key = z.enum(keys as unknown as [K, ...K[]]) as unknown as z.ZodType<K, K>

  let allOptions: readonly LookupOption<K>[] | undefined

  return {
    keys,
    labels,
    key,
    keyOrNone: z.union([z.literal(''), key]),
    list: z.array(key),

    // Falls back to the raw key so an unmapped value stays visible rather than rendering blank.
    // An empty key renders as nothing at all, which is what a scalar field holding "" relies on.
    label(k, t) {
      if (!k) return ''
      return (labels as Record<string, Text | undefined>)[k]?.(t) ?? k
    },

    options() {
      allOptions ??= keys.map(k => ({ key: k, label: labels[k] }))
      return allOptions
    },

    subset<S extends K>(subsetKeys: readonly S[]): Lookup<S> {
      const missing = subsetKeys.filter(k => !keys.includes(k))
      if (missing.length) {
        throw new Error(`subset names keys outside the domain: ${missing.join(', ')}`)
      }
      const subsetLabels = Object.fromEntries(
        subsetKeys.map(k => [k, labels[k]])
      ) as Record<S, Text>
      return buildLookup(subsetKeys, subsetLabels)
    },
  }
}
