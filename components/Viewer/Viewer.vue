<template>
  <div id="viewer" class="relative">
    <Filters
      :filters="cFilters"
      :jsonData="jsonData"
      @updateFilters="cFilters = $event"
      @resetFilters="cFilters = JSON.parse(JSON.stringify(pFilters))"
    />

    <EurekaCanvas
      v-if="!loading"
      :canvasImage="image"
      :gridSizeInPixels="gridSizeInPixels"
      :coordinatesOffset="coordinatesOffset"
      :positions="positions"
      :maximumZoom="maximumZoom"
      :positionsIdKey="'id'"
      @click="clickedCanvas"
      @clickedElement="clickedElement"
    />

    <!-- <ItemInformation
      v-if="clickedItem"
      :position="clickPosition"
      @closeItemInformation="closeItemInformation"
    >
      <template #icon>
        <div v-html="clickedItemLabel"></div>
      </template>
      <template #header>
        {{ clickedItemLabel }}
      </template>
      <template #content>
        <component :is="'DefaultItemInformation'" :item="clickedItem" />
      </template>
    </ItemInformation> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import EurekaCanvas from 'eureka-canvas'
import Filters from '~/components/Viewer/Filters.vue'
// import ItemInformation from '~/components/ItemInformation.vue'
// import DefaultItemInformation from '~/components/DefaultItemInformation.vue'
// import MonsterItemInformation from '~/components/MonsterItemInformation.vue'
// import FateItemInformation from '~/components/FateItemInformation.vue'
// import EnemyItemInformation from '~/components/ItemInformation/EnemyItemInformation.vue'
// import SkirmishesItemInformation from '~/components/ItemInformation/SkirmishesItemInformation.vue'
// import CriticalEngagementsItemInformation from '~/components/ItemInformation/CriticalEngagementsItemInformation.vue'

const props = defineProps<{
  imageSource: string
  jsonData: any
  pFilters: any
  gridSizeInPixels?: number
  coordinatesOffset?: number
  maximumZoom?: number
}>()

const cFilters = ref(JSON.parse(JSON.stringify(props.pFilters)))
const image = ref<HTMLImageElement | null>(null)
const clickedItem = ref<any>(false)
const clickPosition = ref({ x: 0, y: 0 })
const icons = ref<Record<string, any>>({})
const loading = ref(true)

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
  if (!loading.value) {
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

            // icon logic
            switch (key) {
              case 'monsters':
                if (item.element == '' && icons.value.hasOwnProperty('noelement')) {
                  itemObj.icons.push({ image: icons.value.noelement.image })
                } else if (icons.value.hasOwnProperty(item.element)) {
                  itemObj.icons.push({ image: icons.value[item.element].image })
                }
                itemObj.label = `${item.name} (${item.level})`
                break
              case 'fates':
                itemObj.icons.push({ image: icons.value.fate.image })
                if (item.element == '' && icons.value.hasOwnProperty('noelement')) {
                  itemObj.icons.push({ image: icons.value.noelement.image })
                } else if (icons.value.hasOwnProperty(item.element)) {
                  itemObj.icons.push({ image: icons.value[item.element].image })
                }
                itemObj.drawStyle = 'circle'
                break
              case 'quests':
                itemObj.icons.push({ image: icons.value.quest.image })
                break
              case 'aethernet':
                itemObj.icons.push({ image: icons.value.aetheryte.image })
                break
              case 'elementals':
                itemObj.icons.push({ image: icons.value.blessing.image })
                break
              case 'lockboxes':
                itemObj.icons.push({ image: icons.value.lock.image })
                break
              case 'enemies':
                itemObj.icons.push({
                  image: icons.value[`rank_${item.level}`]
                    ? icons.value[`rank_${item.level}`].image
                    : icons.value.noelement.image
                })
                break
              case 'skirmishes':
                if (item.hasOwnProperty('icon') && icons.value[`skirmishes_${item.icon}`]) {
                  itemObj.icons.push({ image: icons.value[`skirmishes_${item.icon}`].image })
                } else {
                  itemObj.icons.push({ image: icons.value.fate.image })
                }
                itemObj.drawStyle = 'circle'
                break
              case 'engagements':
                if (item.hasOwnProperty('icon') && icons.value[`engagements_${item.icon}`]) {
                  itemObj.icons.push({ image: icons.value[`engagements_${item.icon}`].image })
                } else {
                  itemObj.icons.push({ image: icons.value.fate.image })
                }
                itemObj.drawStyle = 'circle'
                break
              default:
                itemObj.icons.push({ image: icons.value.noelement.image })
                break
            }

            pos.push(itemObj)

            if (multiple) {
              item.position.slice(1).forEach((position: any) => {
                let multiItem = { ...itemObj, coordinates: position }
                pos.push(multiItem)
              })
            }
          }
        }
      }
    })
  }
  return pos
})

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = url
  })

// Dynamic icon loading (simplified!)
const loadIcons = async () => {
  const iconKeys = ['elements/noelement', 'elements/fire', 'elements/wind', 'elements/water', 'elements/earth', 'elements/ice', 'elements/lightning', 'aetheryte', 'ashkin', 'lock', 'mutation', 'blessing', 'quest', 'fate'] // and so on...
  const iconsObj: Record<string, any> = {}
  for (const key of iconKeys) {
    const path = `/images/icons/${key}.png`
    const finalKey = key.substring(key.lastIndexOf('/') + 1)
    iconsObj[finalKey] = {
      path,
      image: await loadImage(path)
    }
  }
  icons.value = iconsObj
}

onMounted(async () => {
  cFilters.value = JSON.parse(JSON.stringify(props.pFilters))
  image.value = await loadImage(props.imageSource)
  await loadIcons()
  loading.value = false
})

const closeItemInformation = () => {
  clickedItem.value = false
}

const clickedCanvas = () => {
  clickedItem.value = false
}

const clickedElement = (item: any) => {
  clickedItem.value = item
}

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

    if (sectionFilters.ashkin && !item.ashkin) {
      checks.push(true)
    }

    if (sectionFilters.sprite && !item.name.includes('Sprite')) {
      checks.push(true)
    }

    if (sectionFilters.fate && !item.fate.forFate) {
      checks.push(true)
    }

    if (sectionFilters.aggro !== '' && item.aggro !== sectionFilters.aggro) {
      checks.push(true)
    }

    if (sectionFilters.mutates && !item.mutation.canMutate) {
      checks.push(true)
    }

    if (sectionFilters.adapts && !item.adaptation.canAdapt) {
      checks.push(true)
    }

    if (sectionFilters.maweather !== '' && sectionFilters.matime !== '') {
      const adaptFound = item.adaptation.conditions.some(
        (condition: any) =>
          condition.weather === sectionFilters.maweather &&
          condition.time === sectionFilters.matime
      )
      const mutateFound = item.mutation.conditions.some(
        (condition: any) =>
          condition.weather === sectionFilters.maweather &&
          condition.time === sectionFilters.matime
      )
      checks.push(!(adaptFound || mutateFound))
    } else if (sectionFilters.maweather !== '') {
      const adaptFound = item.adaptation.conditions.some(
        (condition: any) => condition.weather === sectionFilters.maweather
      )
      const mutateFound = item.mutation.conditions.some(
        (condition: any) => condition.weather === sectionFilters.maweather
      )
      checks.push(!(adaptFound || mutateFound))
    } else if (sectionFilters.matime !== '') {
      const adaptFound = item.adaptation.conditions.some(
        (condition: any) => condition.time === sectionFilters.matime
      )
      const mutateFound = item.mutation.conditions.some(
        (condition: any) => condition.time === sectionFilters.matime
      )
      checks.push(!(adaptFound || mutateFound))
    }

    if (
      sectionFilters.mutateElement !== '' &&
      item.mutation.element !== sectionFilters.mutateElement
    ) {
      checks.push(true)
    }
  }

  if (key === 'enemies') {
    const sectionFilters = cFilters.value.sections.enemies.filters
    if (
      sectionFilters.hasOwnProperty('rank') &&
      item.hasOwnProperty('level') &&
      !sectionFilters.rank[item.level]
    ) {
      checks.push(true)
    }

    if (item.hasOwnProperty('elemental') && item.elemental && !sectionFilters.elemental) {
      checks.push(true)
    }

    if (item.hasOwnProperty('ashkin') && item.ashkin && !sectionFilters.ashkin) {
      checks.push(true)
    }

    if (item.hasOwnProperty('fauna') && item.fauna && !sectionFilters.fauna) {
      checks.push(true)
    }

    if (item.hasOwnProperty('machine') && item.machine && !sectionFilters.machine) {
      checks.push(true)
    }
  }

  if (key === 'engagements') {
    const sectionFilters = cFilters.value.sections.engagements.filters
    const participants = sectionFilters.participants.find(
      (p: any) => p.amount == item.participants
    )
    if (participants && !participants.enabled) {
      checks.push(true)
    }

    if (sectionFilters.hiddenEngagements.includes(item.id)) {
      checks.push(true)
    }
  }

  if (key === 'skirmishes') {
    const sectionFilters = cFilters.value.sections.skirmishes.filters
    if (sectionFilters.hiddenSkirmishes.includes(item.id)) {
      checks.push(true)
    }
  }

  return [...new Set(checks)].filter(el => el).length === 1
}


// Example computed
const clickedItemLabel = computed(() => {
  if (!clickedItem.value) return ''
  return clickedItem.value.label || 'Unknown'
})

</script>
