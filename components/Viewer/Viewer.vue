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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { EurekaCanvas } from 'eureka-canvas'
import Filters from '~/components/Viewer/Filters.vue'
import ItemInformation from '~/components/Viewer/ItemInformation.vue'
import { getViewerComponent } from '~/composables/useSectionRegistry'
import { resolveIcons, resolveIconHtml } from '~/composables/useIconResolver'

const props = defineProps<{
  imageSource: string
  jsonData: any
  pFilters: any
  gridSizeInPixels?: number
  coordinatesOffset?: number
  maximumZoom?: number
}>()

const cFilters = ref(JSON.parse(JSON.stringify(props.pFilters)))
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
  return getViewerComponent(clickedItem.value.key)
})

const itemComponentProps = computed(() => {
  if (!clickedItem.value) return {}
  switch (clickedItem.value.key) {
    case 'monsters': return { fates: sections.value.fates?.items ?? [] }
    case 'fates': return { monsters: sections.value.monsters?.items ?? [] }
    case 'enemies':
    case 'skirmishes':
    case 'engagements':
      return {
        enemies: sections.value.enemies?.items ?? [],
        skirmishes: sections.value.skirmishes?.items ?? []
      }
    default: return {}
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

  if (key === 'monsters') {
    const sectionFilters = cFilters.value.sections.monsters.filters

    if (sectionFilters.ashkin && !(item.family && item.family.includes('ashkin'))) checks.push(true)
    if (sectionFilters.sprite && !item.name.includes('Sprite')) checks.push(true)
    if (sectionFilters.fate && !item.fate.forFate) checks.push(true)
    if (sectionFilters.aggro !== '' && item.aggro !== sectionFilters.aggro) checks.push(true)
    if (sectionFilters.mutates && !item.mutation.canMutate) checks.push(true)
    if (sectionFilters.adapts && !item.adaptation.canAdapt) checks.push(true)

    if (sectionFilters.maweather !== '' && sectionFilters.matime !== '') {
      const adaptFound = item.adaptation.conditions.some(
        (c: any) => c.weather === sectionFilters.maweather && c.time === sectionFilters.matime
      )
      const mutateFound = item.mutation.conditions.some(
        (c: any) => c.weather === sectionFilters.maweather && c.time === sectionFilters.matime
      )
      checks.push(!(adaptFound || mutateFound))
    } else if (sectionFilters.maweather !== '') {
      const adaptFound = item.adaptation.conditions.some((c: any) => c.weather === sectionFilters.maweather)
      const mutateFound = item.mutation.conditions.some((c: any) => c.weather === sectionFilters.maweather)
      checks.push(!(adaptFound || mutateFound))
    } else if (sectionFilters.matime !== '') {
      const adaptFound = item.adaptation.conditions.some((c: any) => c.time === sectionFilters.matime)
      const mutateFound = item.mutation.conditions.some((c: any) => c.time === sectionFilters.matime)
      checks.push(!(adaptFound || mutateFound))
    }

    if (sectionFilters.mutateElement !== '' && item.mutation.element !== sectionFilters.mutateElement) {
      checks.push(true)
    }
  }

  if (key === 'enemies') {
    const sectionFilters = cFilters.value.sections.enemies.filters
    if (sectionFilters.hasOwnProperty('rank') && item.hasOwnProperty('level') && !sectionFilters.rank[item.level]) checks.push(true)
    if (item.family?.includes('elemental') && !sectionFilters.elemental) checks.push(true)
    if (item.family?.includes('ashkin') && !sectionFilters.ashkin) checks.push(true)
    if (item.family?.includes('fauna') && !sectionFilters.fauna) checks.push(true)
    if (item.family?.includes('machine') && !sectionFilters.machine) checks.push(true)
  }

  if (key === 'engagements') {
    const sectionFilters = cFilters.value.sections.engagements.filters
    const participants = sectionFilters.participants.find((p: any) => p.amount == item.participants)
    if (participants && !participants.enabled) checks.push(true)
    if (sectionFilters.hiddenEngagements.includes(item.id)) checks.push(true)
  }

  if (key === 'skirmishes') {
    const sectionFilters = cFilters.value.sections.skirmishes.filters
    if (sectionFilters.hiddenSkirmishes.includes(item.id)) checks.push(true)
  }

  return [...new Set(checks)].filter(el => el).length === 1
}
</script>
