import type { ZoneDefinition } from './zones'

export const SITE_NAME = 'FFXIV Interactive Eureka Maps'
export const SITE_ORIGIN = 'https://www.ffxiv-interactive-eureka-maps.com'

export function zoneTitle(zone: ZoneDefinition): string {
  return `${zone.name} - ${SITE_NAME}`
}

export function zoneCanonical(zone: ZoneDefinition): string {
  return `${SITE_ORIGIN}/map/${zone.slug}`
}
