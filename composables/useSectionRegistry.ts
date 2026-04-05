import type { Component } from 'vue'

// Viewer info panel components (keyed by section type)
import DefaultItemInformation from '~/components/Viewer/DefaultItemInformation.vue'
import MonsterItemInformation from '~/components/Viewer/MonsterItemInformation.vue'
import FateItemInformation from '~/components/Viewer/FateItemInformation.vue'
import EnemyItemInformation from '~/components/Viewer/ItemInformation/EnemyItemInformation.vue'
import SkirmishesItemInformation from '~/components/Viewer/ItemInformation/SkirmishesItemInformation.vue'
import CriticalEngagementsItemInformation from '~/components/Viewer/ItemInformation/CriticalEngagementsItemInformation.vue'

// Editor item components (keyed by section key — these are per-key, not per-type yet)
import Generic from '~/components/Editor/SectionItems/Generic.vue'
import Monster from '~/components/Editor/SectionItems/Monster.vue'
import Quest from '~/components/Editor/SectionItems/Quest.vue'
import Aetheryte from '~/components/Editor/SectionItems/Aetheryte.vue'
import Fate from '~/components/Editor/SectionItems/Fate.vue'
import Elemental from '~/components/Editor/SectionItems/Elemental.vue'
import Lockbox from '~/components/Editor/SectionItems/Lockbox.vue'
import EditorCriticalEngagements from '~/components/Editor/SectionItems/CriticalEngagements.vue'
import EditorSkirmishes from '~/components/Editor/SectionItems/Skirmishes.vue'
import EditorEnemies from '~/components/Editor/SectionItems/Enemies.vue'

// Viewer filter section components (keyed by section key)
import FilterMonsters from '~/components/Viewer/SectionItems/Monsters.vue'
import FilterEnemies from '~/components/Viewer/SectionItems/Enemies.vue'
import FilterCriticalEngagements from '~/components/Viewer/SectionItems/CriticalEngagements.vue'
import FilterSkirmishes from '~/components/Viewer/SectionItems/Skirmishes.vue'

// --- Viewer info panel ---
// Maps section key → component. Will migrate to type-based in Phase 4.
const viewerComponents: Record<string, Component> = {
  monsters: MonsterItemInformation,
  fates: FateItemInformation,
  enemies: EnemyItemInformation,
  skirmishes: SkirmishesItemInformation,
  engagements: CriticalEngagementsItemInformation,
}

export function getViewerComponent(sectionKey: string): Component {
  return viewerComponents[sectionKey] ?? DefaultItemInformation
}

// --- Editor item ---
// Maps section key → component. Will migrate to type-based in Phase 4.
const editorComponents: Record<string, Component> = {
  monsters: Monster,
  quests: Quest,
  aethernet: Aetheryte,
  fates: Fate,
  elementals: Elemental,
  lockboxes: Lockbox,
  engagements: EditorCriticalEngagements,
  skirmishes: EditorSkirmishes,
  enemies: EditorEnemies,
}

export function getEditorComponent(sectionKey: string): Component {
  return editorComponents[sectionKey] ?? Generic
}

// --- Viewer filter section ---
// Maps section key → component (or null for sections with no filters).
const filterComponents: Record<string, Component | null> = {
  monsters: FilterMonsters,
  enemies: FilterEnemies,
  engagements: FilterCriticalEngagements,
  skirmishes: FilterSkirmishes,
}

export function getFilterComponent(sectionKey: string): Component | null {
  return filterComponents[sectionKey] ?? null
}
