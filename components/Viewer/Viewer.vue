<template>
  <div id="viewer" class="relative" ref="viewerEl">
    <Filters
      :filters="cFilters"
      :jsonData="jsonData"
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
import DefaultItemInformation from '~/components/Viewer/DefaultItemInformation.vue'
import MonsterItemInformation from '~/components/Viewer/MonsterItemInformation.vue'
import FateItemInformation from '~/components/Viewer/FateItemInformation.vue'
import EnemyItemInformation from '~/components/Viewer/ItemInformation/EnemyItemInformation.vue'
import SkirmishesItemInformation from '~/components/Viewer/ItemInformation/SkirmishesItemInformation.vue'
import CriticalEngagementsItemInformation from '~/components/Viewer/ItemInformation/CriticalEngagementsItemInformation.vue'

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

const iconPaths: Record<string, string> = {
  noelement:           '/images/icons/elements/noelement.png',
  fire:                '/images/icons/elements/fire2.png',
  wind:                '/images/icons/elements/wind2.png',
  water:               '/images/icons/elements/water2.png',
  earth:               '/images/icons/elements/earth2.png',
  ice:                 '/images/icons/elements/ice2.png',
  lightning:           '/images/icons/elements/lightning2.png',
  quest:               '/images/icons/quest.png',
  adaptation:          '/images/icons/adaptation.png',
  mutation:            '/images/icons/mutation.png',
  aetheryte:           '/images/icons/aetheryte.png',
  fate:                '/images/icons/fate.png',
  blessing:            '/images/icons/blessing.png',
  lock:                '/images/icons/lock.png',
  ashkin:              '/images/icons/ashkin.png',
  rank_0:              '/images/icons/ranks/0.png',
  rank_1:              '/images/icons/ranks/1.png',
  rank_2:              '/images/icons/ranks/2.png',
  rank_3:              '/images/icons/ranks/3.png',
  rank_4:              '/images/icons/ranks/4.png',
  rank_5:              '/images/icons/ranks/5.png',
  engagements_boss:    '/images/icons/engagements/boss.png',
  engagements_duel:    '/images/icons/engagements/duel.png',
  skirmishes_boss:     '/images/icons/skirmishes/boss.png',
  skirmishes_defend:   '/images/icons/skirmishes/defend.png',
  skirmishes_gather:   '/images/icons/skirmishes/gather.png',
  skirmishes_slay:     '/images/icons/skirmishes/slay.png',
}

const gridSizeInPixels = props.gridSizeInPixels ?? 100
const coordinatesOffset = props.coordinatesOffset ?? 0
const maximumZoom = props.maximumZoom ?? 100

const sortedKeys = computed(() => {
  if (!props.jsonData) {
    return []
  }
  return Object.keys(props.jsonData).sort((a, b) => props.jsonData[a].order - props.jsonData[b].order)
})

const positions = computed(() => {
  const pos: any[] = []
  sortedKeys.value.forEach(key => {
    const section = props.jsonData[key]
    if (cFilters.value.sections[key].enabled) {
      for (const item of section.items) {
        if (!shouldFilterItem(key, item)) {
          let multiple = false
          let coordinates = item.position
          if (Array.isArray(item.position)) {
            multiple = item.position.length > 1
            coordinates = item.position[0]
          }

          let itemObj: any = {
            id: item.id,
            key: key,
            label: item.name,
            coordinates: coordinates,
            icons: []
          }

          switch (key) {
            case 'monsters':
              itemObj.icons.push(iconPaths[item.element] || iconPaths.noelement)
              itemObj.label = `${item.name} (${item.level})`
              break
            case 'fates':
              itemObj.icons.push(iconPaths.fate)
              itemObj.icons.push(iconPaths[item.element] || iconPaths.noelement)
              itemObj.drawStyle = 'circle'
              break
            case 'quests':
              itemObj.icons.push(iconPaths.quest)
              break
            case 'aethernet':
              itemObj.icons.push(iconPaths.aetheryte)
              break
            case 'elementals':
              itemObj.icons.push(iconPaths.blessing)
              break
            case 'lockboxes':
              itemObj.icons.push(iconPaths.lock)
              break
            case 'enemies':
              itemObj.icons.push(iconPaths[`rank_${item.level}`] || iconPaths.noelement)
              break
            case 'skirmishes':
              itemObj.icons.push(iconPaths[`skirmishes_${item.icon}`] || iconPaths.fate)
              itemObj.drawStyle = 'circle'
              break
            case 'engagements':
              itemObj.icons.push(iconPaths[`engagements_${item.icon}`] || iconPaths.fate)
              itemObj.drawStyle = 'circle'
              break
            default:
              itemObj.icons.push(iconPaths.noelement)
              break
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
  return props.jsonData[clickedItem.value.key].items.find(
    (item: any) => item.id == clickedItem.value.id
  ) ?? null
})

const clickedItemIcon = computed(() => {
  if (!clickedItem.value || !clickedItemSourceItem.value) return ''
  const src = clickedItemSourceItem.value
  let html = ''

  switch (clickedItem.value.key) {
    case 'fates':
      html = `<img title="FATE" src="${iconPaths.fate}" />`
      break
    case 'elementals':
      html = `<img title="Eurekan Elemental" src="${iconPaths.blessing}" />`
      break
    case 'lockboxes':
      html = `<img title="Bunny Lockbox" src="${iconPaths.lock}" />`
      break
    case 'aethernet':
      html = `<img title="Aetheryte" src="${iconPaths.aetheryte}" />`
      break
    case 'quests':
      html = `<img title="Quest" src="${iconPaths.quest}" />`
      break
    case 'monsters': {
      html += `<img src="${iconPaths[src.element] || iconPaths.noelement}" />`
      if (src.ashkin) html += `<img title="Ashkin" src="${iconPaths.ashkin}" />`
      if (src.mutation?.canMutate) html += `<img title="Mutates" src="${iconPaths.mutation}" />`
      if (src.adaptation?.canAdapt) html += `<img title="Adapts" src="${iconPaths.adaptation}" />`
      break
    }
    case 'enemies': {
      const rank = src.level
      html = `<img title="Rank ${rank == 0 ? 'Star' : rank}" src="${iconPaths[`rank_${rank}`] || iconPaths.noelement}" />`
      break
    }
    case 'skirmishes':
      html = `<img title="Skirmish" src="${iconPaths[`skirmishes_${src.icon}`] || iconPaths.fate}" />`
      break
    case 'engagements':
      html = `<img title="Critical Engagement" src="${iconPaths[`engagements_${src.icon}`] || iconPaths.fate}" />`
      break
    default:
      html = `<img src="${iconPaths.noelement}" />`
      break
  }

  return html
})

const clickedItemLabel = computed(() => {
  if (!clickedItem.value || !clickedItemSourceItem.value) return ''
  switch (clickedItem.value.key) {
    case 'elementals': return 'Eurekan Elementals'
    case 'lockboxes': return 'Bunny Lockboxes'
    default: return clickedItemSourceItem.value.name
  }
})

const clickedItemComponent = computed(() => {
  if (!clickedItem.value) return null
  switch (clickedItem.value.key) {
    case 'monsters': return MonsterItemInformation
    case 'fates': return FateItemInformation
    case 'enemies': return EnemyItemInformation
    case 'skirmishes': return SkirmishesItemInformation
    case 'engagements': return CriticalEngagementsItemInformation
    default: return DefaultItemInformation
  }
})

const itemComponentProps = computed(() => {
  if (!clickedItem.value) return {}
  switch (clickedItem.value.key) {
    case 'monsters': return { fates: props.jsonData.fates?.items ?? [] }
    case 'fates': return { monsters: props.jsonData.monsters?.items ?? [] }
    case 'enemies':
    case 'skirmishes':
    case 'engagements':
      return {
        enemies: props.jsonData.enemies?.items ?? [],
        skirmishes: props.jsonData.skirmishes?.items ?? []
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

    if (sectionFilters.ashkin && !item.ashkin) checks.push(true)
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
    if (item.hasOwnProperty('elemental') && item.elemental && !sectionFilters.elemental) checks.push(true)
    if (item.hasOwnProperty('ashkin') && item.ashkin && !sectionFilters.ashkin) checks.push(true)
    if (item.hasOwnProperty('fauna') && item.fauna && !sectionFilters.fauna) checks.push(true)
    if (item.hasOwnProperty('machine') && item.machine && !sectionFilters.machine) checks.push(true)
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
