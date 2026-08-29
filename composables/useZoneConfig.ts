import type { ComputedRef, InjectionKey } from 'vue'
import { computed, inject } from 'vue'

export interface ZoneLookups {
  weathers?: string[]
  aggroTypes?: string[]
  mobFamilies?: string[]
  elements?: string[]
  times?: string[]
  ranks?: number[]
}

export interface ZoneConfig {
  features?: Record<string, boolean>
  lookups?: ZoneLookups
  levelLabel?: string
  levelRange?: { from: number; to: number }
}

export const zoneConfigKey = Symbol('zoneConfig') as InjectionKey<ComputedRef<ZoneConfig>>

// Consumers outside a Viewer or Editor tree fall back to this, so every lookup
// reads as an empty list rather than throwing.
const emptyZoneConfig = computed<ZoneConfig>(() => ({}))

export function useZoneConfig(): ComputedRef<ZoneConfig> {
  return inject(zoneConfigKey, emptyZoneConfig)
}

export function useZoneLookups(): ComputedRef<ZoneLookups> {
  const config = useZoneConfig()
  return computed(() => config.value.lookups ?? {})
}
