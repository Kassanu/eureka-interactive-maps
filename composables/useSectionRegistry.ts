import type { Component } from 'vue'

import DefaultItemInformation from '~/components/Viewer/DefaultItemInformation.vue'
import MobItemInformation from '~/components/Viewer/ItemInformation/MobItemInformation.vue'
import EventItemInformation from '~/components/Viewer/ItemInformation/EventItemInformation.vue'
import LootItemInformation from '~/components/Viewer/ItemInformation/LootItemInformation.vue'
import PoiItemInformation from '~/components/Viewer/ItemInformation/PoiItemInformation.vue'

import Generic from '~/components/Editor/SectionItems/Generic.vue'
import MobEditor from '~/components/Editor/SectionItems/MobEditor.vue'
import EventEditor from '~/components/Editor/SectionItems/EventEditor.vue'
import LootEditor from '~/components/Editor/SectionItems/LootEditor.vue'
import PoiEditor from '~/components/Editor/SectionItems/PoiEditor.vue'

import MobFilters from '~/components/Viewer/SectionItems/MobFilters.vue'
import EventFilters from '~/components/Viewer/SectionItems/EventFilters.vue'
import LootFilters from '~/components/Viewer/SectionItems/LootFilters.vue'

// Spawn pool value for loot that comes from a bonus roll rather than a fate.
export const BONUS_POOL = 'bonus'

// Sections dispatch on their type, so a new zone reuses these components and
// only supplies data. A type with no entry falls back to the generic component;
// poi has no filter controls, so a null filter component is expected.

const viewerByType: Record<string, Component> = {
  mob: MobItemInformation,
  event: EventItemInformation,
  loot: LootItemInformation,
  poi: PoiItemInformation,
}

export function getViewerComponent(sectionType?: string): Component {
  return (sectionType && viewerByType[sectionType]) || DefaultItemInformation
}

const editorByType: Record<string, Component> = {
  mob: MobEditor,
  event: EventEditor,
  loot: LootEditor,
  poi: PoiEditor,
}

export function getEditorComponent(sectionType?: string): Component {
  return (sectionType && editorByType[sectionType]) || Generic
}

const filterByType: Record<string, Component> = {
  mob: MobFilters,
  event: EventFilters,
  loot: LootFilters,
}

export function getFilterComponent(sectionType?: string): Component | null {
  return (sectionType && filterByType[sectionType]) || null
}
