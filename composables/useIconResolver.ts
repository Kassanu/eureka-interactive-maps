const ICON_BASE = '/images/icons'

const iconPaths: Record<string, string> = {
  // elements (using v2 variants)
  noelement:           `${ICON_BASE}/elements/noelement.png`,
  fire:                `${ICON_BASE}/elements/fire2.png`,
  wind:                `${ICON_BASE}/elements/wind2.png`,
  water:               `${ICON_BASE}/elements/water2.png`,
  earth:               `${ICON_BASE}/elements/earth2.png`,
  ice:                 `${ICON_BASE}/elements/ice2.png`,
  lightning:           `${ICON_BASE}/elements/lightning2.png`,
  // static
  quest:               `${ICON_BASE}/quest.png`,
  adaptation:          `${ICON_BASE}/adaptation.png`,
  mutation:            `${ICON_BASE}/mutation.png`,
  aetheryte:           `${ICON_BASE}/aetheryte.png`,
  fate:                `${ICON_BASE}/fate.png`,
  blessing:            `${ICON_BASE}/blessing.png`,
  lock:                `${ICON_BASE}/lock.png`,
  ashkin:              `${ICON_BASE}/ashkin.png`,
  carrot:              `${ICON_BASE}/carrot.png`,
  pin:                 `${ICON_BASE}/pin.png`,
  // ranks
  rank_0:              `${ICON_BASE}/ranks/0.png`,
  rank_1:              `${ICON_BASE}/ranks/1.png`,
  rank_2:              `${ICON_BASE}/ranks/2.png`,
  rank_3:              `${ICON_BASE}/ranks/3.png`,
  rank_4:              `${ICON_BASE}/ranks/4.png`,
  rank_5:              `${ICON_BASE}/ranks/5.png`,
  // engagements
  engagements_boss:    `${ICON_BASE}/engagements/boss.png`,
  engagements_duel:    `${ICON_BASE}/engagements/duel.png`,
  // skirmishes
  skirmishes_boss:     `${ICON_BASE}/skirmishes/boss.png`,
  skirmishes_defend:   `${ICON_BASE}/skirmishes/defend.png`,
  skirmishes_gather:   `${ICON_BASE}/skirmishes/gather.png`,
  skirmishes_slay:     `${ICON_BASE}/skirmishes/slay.png`,
}

export { iconPaths }

// --- Types matching the icon config in zone JSON ---

interface PrimaryStrategy {
  strategy: 'element' | 'rank' | 'prefixed' | 'static'
  field?: string
  prefix?: string
  value?: string
}

interface BadgeRule {
  field: string
  match: any
  icon: string
}

interface IconConfig {
  drawStyle: string
  primary: PrimaryStrategy
  badges?: BadgeRule[]
}

// --- Nested field access (supports dot paths like "adaptation.canAdapt") ---

function getNestedField(obj: any, path: string): any {
  return path.split('.').reduce((o, key) => o?.[key], obj)
}

// --- Resolution ---

function resolvePrimary(strategy: PrimaryStrategy, item: any): string {
  switch (strategy.strategy) {
    case 'element':
      return iconPaths[item[strategy.field!]] || iconPaths.noelement
    case 'rank':
      return iconPaths[`rank_${item[strategy.field!]}`] ?? iconPaths.noelement
    case 'prefixed':
      return iconPaths[`${strategy.prefix}_${item[strategy.field!]}`] ?? iconPaths.fate
    case 'static':
      return iconPaths[strategy.value!] ?? iconPaths.noelement
    default:
      return iconPaths.noelement
  }
}

function resolveBadges(badges: BadgeRule[], item: any): string[] {
  return badges
    .filter(badge => getNestedField(item, badge.field) === badge.match)
    .map(badge => iconPaths[badge.icon])
    .filter(Boolean)
}

export function resolveIcons(config: IconConfig, item: any): { drawStyle: string; icons: string[] } {
  const primary = resolvePrimary(config.primary, item)
  const badgeIcons = resolveBadges(config.badges ?? [], item)
  return {
    drawStyle: config.drawStyle,
    icons: [primary, ...badgeIcons].filter(Boolean),
  }
}

/**
 * Resolve the icon HTML for the clicked-item info panel.
 * Returns HTML img tags for the item's icons based on its section's icon config.
 */
export function resolveIconHtml(config: IconConfig, item: any): string {
  const { icons } = resolveIcons(config, item)
  return icons.map(src => `<img src="${src}" />`).join('')
}
