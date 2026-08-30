<template>
  <div id="viewer" class="relative" ref="viewerEl">
    <Filters
      :filters="cFilters"
      :jsonData="sections"
      @updateFilters="cFilters = $event"
      @resetFilters="cFilters = JSON.parse(JSON.stringify(pFilters))"
    />

    <EurekaCanvas
      :canvasImage="imageSource"
      :gridSizeInPixels="gridSizeInPixels"
      :coordinatesOffset="coordinatesOffset"
      :positions="positions"
      :maximumZoom="maximumZoom"
      :positionsIdKey="'id'"
      @click="clickedCanvas"
      @clickedElement="clickedElement"
    />

    <ItemInformation
      v-if="clickedItem"
      :position="clickPosition"
      @closeItemInformation="closeItemInformation"
    >
      <template #icon>
        <div v-html="clickedItemIcon" />
      </template>
      <template #header>
        {{ clickedItemLabel }}
      </template>
      <template #content>
        <component :is="clickedItemComponent" :item="clickedItemSourceItem" v-bind="itemComponentProps" />
      </template>
    </ItemInformation>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted, onUnmounted } from 'vue'
import { EurekaCanvas } from 'eureka-canvas'
import Filters from '~/components/Viewer/Filters.vue'
import ItemInformation from '~/components/Viewer/ItemInformation.vue'
import { getViewerComponent, BONUS_POOL } from '~/composables/useSectionRegistry'
import { resolveIcons, resolveIconHtml } from '~/composables/useIconResolver'
import { zoneConfigKey, type ZoneConfig } from '~/composables/useZoneConfig'

const props = defineProps<{
  imageSource: string
  jsonData: any
  pFilters: any
  gridSizeInPixels?: number
  coordinatesOffset?: number
  maximumZoom?: number
}>()

const cFilters = ref(JSON.parse(JSON.stringify(props.pFilters)))
const zoneConfig = computed<ZoneConfig>(() => props.pFilters.config ?? {})
provide(zoneConfigKey, zoneConfig)

const clickedItem = ref<any>(false)
const clickPosition = ref({ x: 0, y: 0 })
const viewerEl = ref<HTMLElement | null>(null)

const sections = computed(() => props.jsonData.sections ?? props.jsonData)

const gridSizeInPixels = props.gridSizeInPixels ?? 100
const coordinatesOffset = props.coordinatesOffset ?? 0
const maximumZoom = props.maximumZoom ?? 100

const sortedKeys = computed(() => {
  if (!sections.value) {
    return []
  }
  return Object.keys(sections.value).sort((a, b) => sections.value[a].order - sections.value[b].order)
})

const positions = computed(() => {
  const pos: any[] = []
  sortedKeys.value.forEach(key => {
    const section = sections.value[key]
    if (cFilters.value.sections[key].enabled) {
      for (const item of section.items) {
        if (!shouldFilterItem(key, item)) {
          let multiple = false
          let coordinates = item.position
          if (Array.isArray(item.position)) {
            multiple = item.position.length > 1
            coordinates = item.position[0]
          }

          const resolved = resolveIcons(section.icon, item)

          let itemObj: any = {
            id: item.id,
            key: key,
            label: item.name,
            coordinates: coordinates,
            icons: resolved.icons,
            drawStyle: resolved.drawStyle,
          }

          if (item.level !== undefined) {
            itemObj.label = `${item.name} (${item.level})`
          }

          pos.push(itemObj)

          if (multiple) {
            item.position.slice(1).forEach((position: any) => {
              pos.push({ ...itemObj, coordinates: position })
            })
          }
        }
      }
    }
  })
  return pos
})

// --- Clicked item ---

const clickedItemSourceItem = computed(() => {
  if (!clickedItem.value) return null
  return sections.value[clickedItem.value.key].items.find(
    (item: any) => item.id == clickedItem.value.id
  ) ?? null
})

const clickedItemIcon = computed(() => {
  if (!clickedItem.value || !clickedItemSourceItem.value) return ''
  const section = sections.value[clickedItem.value.key]
  return resolveIconHtml(section.icon, clickedItemSourceItem.value)
})

const clickedItemLabel = computed(() => {
  if (!clickedItem.value || !clickedItemSourceItem.value) return ''
  return clickedItemSourceItem.value.name || sections.value[clickedItem.value.key]?.name || ''
})

const clickedItemComponent = computed(() => {
  if (!clickedItem.value) return null
  return getViewerComponent(sections.value[clickedItem.value.key]?.type)
})

const itemComponentProps = computed(() => {
  if (!clickedItem.value) return {}
  return {
    fates: sections.value.fates?.items ?? [],
    monsters: sections.value.monsters?.items ?? [],
    enemies: sections.value.enemies?.items ?? [],
    skirmishes: sections.value.skirmishes?.items ?? [],
  }
})

// --- Event handlers ---

const trackClickPosition = (evt: MouseEvent) => {
  clickPosition.value = { x: evt.offsetX, y: evt.offsetY }
}

onMounted(() => {
  viewerEl.value?.addEventListener('click', trackClickPosition, false)
})

onUnmounted(() => {
  viewerEl.value?.removeEventListener('click', trackClickPosition, false)
})

const closeItemInformation = () => { clickedItem.value = false }
const clickedCanvas = () => { clickedItem.value = false }
const clickedElement = (item: any) => { clickedItem.value = item }

onMounted(() => {
  cFilters.value = JSON.parse(JSON.stringify(props.pFilters))
})

function shouldFilterItem(key: string, item: any): boolean {
  const checks: boolean[] = []
  const sectionType = sections.value[key]?.type

  if (
    cFilters.value.hasOwnProperty('level') &&
    item.hasOwnProperty('level') &&
    !(item.level >= cFilters.value.level.from && item.level <= cFilters.value.level.to)
  ) {
    checks.push(true)
  }

  if (
    cFilters.value.hasOwnProperty('element') &&
    item.hasOwnProperty('element') &&
    cFilters.value.element !== '' &&
    item.element !== cFilters.value.element
  ) {
    checks.push(true)
  }

  if (
    cFilters.value.hasOwnProperty('drops') &&
    item.hasOwnProperty('drops') &&
    cFilters.value.drops.value !== ''
  ) {
    if (!item.drops.find((drop: any) => drop.name == cFilters.value.drops.value)) {
      checks.push(true)
    }
  }

  if (sectionType === 'mob') {
    const sf = cFilters.value.sections[key].filters
    const mobFamilies = zoneConfig.value.lookups?.mobFamilies ?? []

    // Family toggles: an unchecked family hides every item carrying it.
    for (const family of mobFamilies) {
      if (family in sf && !sf[family] && item.family?.includes(family)) checks.push(true)
    }

    // sf.rank is indexed by the item's rank, which is stored in level.
    if ('rank' in sf && 'level' in item && !sf.rank[item.level]) checks.push(true)

    // Checked narrows to matching items; unchecked imposes no constraint.
    if ('fate' in sf && sf.fate && !item.fate?.forFate) checks.push(true)
    if ('mutates' in sf && sf.mutates && !item.mutation?.canMutate) checks.push(true)
    if ('adapts' in sf && sf.adapts && !item.adaptation?.canAdapt) checks.push(true)

    // Aggro select; an item may list several triggers separated by commas.
    if ('aggro' in sf && sf.aggro !== '') {
      const triggers = String(item.aggro ?? '').split(',').map((t: string) => t.trim())
      if (!triggers.includes(sf.aggro)) checks.push(true)
    }

    // Weather/time conditions
    const maweather = 'maweather' in sf ? sf.maweather : ''
    const matime = 'matime' in sf ? sf.matime : ''
    if (maweather !== '' || matime !== '') {
      const adaptConditions = item.adaptation?.conditions ?? []
      const mutateConditions = item.mutation?.conditions ?? []

      if (maweather !== '' && matime !== '') {
        const adaptFound = adaptConditions.some((c: any) => c.weather === maweather && c.time === matime)
        const mutateFound = mutateConditions.some((c: any) => c.weather === maweather && c.time === matime)
        checks.push(!(adaptFound || mutateFound))
      } else if (maweather !== '') {
        const adaptFound = adaptConditions.some((c: any) => c.weather === maweather)
        const mutateFound = mutateConditions.some((c: any) => c.weather === maweather)
        checks.push(!(adaptFound || mutateFound))
      } else if (matime !== '') {
        const adaptFound = adaptConditions.some((c: any) => c.time === matime)
        const mutateFound = mutateConditions.some((c: any) => c.time === matime)
        checks.push(!(adaptFound || mutateFound))
      }
    }

    // Mutation element
    if ('mutateElement' in sf && sf.mutateElement !== '' && item.mutation?.element !== sf.mutateElement) {
      checks.push(true)
    }
  }

  if (sectionType === 'loot') {
    const sf = cFilters.value.sections[key].filters

    // Spawn pool holds either a fate id or the bonus-roll marker.
    if ('pool' in sf && sf.pool !== '') {
      const matched = sf.pool === BONUS_POOL
        ? item.fate?.bonus === true
        : item.fate?.fateId === sf.pool
      if (!matched) checks.push(true)
    }

    if ('grade' in sf && sf.grade !== '' && item.grade !== sf.grade) checks.push(true)
  }

  if (sectionType === 'event') {
    const sf = cFilters.value.sections[key].filters

    if ('participants' in sf) {
      const participants = sf.participants.find((p: any) => p.amount == item.participants)
      if (participants && !participants.enabled) checks.push(true)
    }
    if ('hiddenEngagements' in sf && sf.hiddenEngagements.includes(item.id)) checks.push(true)
    if ('hiddenSkirmishes' in sf && sf.hiddenSkirmishes.includes(item.id)) checks.push(true)
  }

  return [...new Set(checks)].filter(el => el).length === 1
}
</script>
