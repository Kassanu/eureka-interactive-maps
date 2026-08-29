<template>
  <div id="editor" class="relative">
    <div v-show="showAddNewItemBanner" @click="cancelAddNewItem" class="addNewItemBanner absolute top-0 left-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Click on the map to add a new item for {{ addNewItemSelectedName }}. Click this message to cancel.
    </div>
    <MapDataEditor
      :jsonData="sections"
      :fullJsonData="jsonData"
      :jsonDataShow="jsonDataShow"
      :clickCoordinates="clickCoordinates"
      :mapName="mapName"
      @addItemToSection="addItemToSection"
      @setItemPosition="setItemPosition"
      @updateItem="updateItem"
      @updateShowData="updateShowData"
      @updateAllItemShowData="updateAllItemShowData"
      @deleteItem="deleteItem"
    />
    <EurekaCanvas
      :canvasImage="imageSource"
      :gridSizeInPixels="gridSizeInPixels"
      :coordinatesOffset="coordinatesOffset"
      :positions="positions"
      :maximumZoom="maximumZoom"
      @click="canvasClick"
      @clickedElement="clickedElement"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, provide } from 'vue'
import { EurekaCanvas } from 'eureka-canvas'
import MapDataEditor from './MapDataEditor.vue'
import { resolveIcons } from '~/composables/useIconResolver'
import { zoneConfigKey, type ZoneConfig } from '~/composables/useZoneConfig'

const props = defineProps<{
  imageSource: string
  jsonData: any
  mapName: string
  config?: ZoneConfig
  gridSizeInPixels?: number
  coordinatesOffset?: number
  maximumZoom?: number
}>()

const sections = computed(() => props.jsonData.sections ?? props.jsonData)

const zoneConfig = computed<ZoneConfig>(() => props.config ?? {})
provide(zoneConfigKey, zoneConfig)

const gridSizeInPixels = props.gridSizeInPixels ?? 100
const coordinatesOffset = props.coordinatesOffset ?? 0
const maximumZoom = props.maximumZoom ?? 100

const clickCoordinates = ref({ x: 0, y: 0 })
const jsonDataShow = ref<Record<string, any>>({})
const addToSectionKey = ref<string | null>(null)

const setPositionToItem = ref<any>(null)

const sortedKeys = computed(() => {
  return Object.keys(sections.value).sort((a, b) => sections.value[a].order - sections.value[b].order)
})

const positions = computed(() => {
  const pos: any[] = []
  sortedKeys.value.forEach(key => {
    const section = sections.value[key]
    if (!(Object.prototype.hasOwnProperty.call(jsonDataShow.value, key) &&
          Object.prototype.hasOwnProperty.call(jsonDataShow.value[key], 'showOnMap') &&
          jsonDataShow.value[key].showOnMap === false)) {
      for (const item of section.items) {
        if (!(Object.prototype.hasOwnProperty.call(jsonDataShow.value, item.id) &&
              Object.prototype.hasOwnProperty.call(jsonDataShow.value[item.id], 'showOnMap') &&
              jsonDataShow.value[item.id].showOnMap === false)) {
          let multiple = false
          let coordinates = item.position
          if (Array.isArray(item.position)) {
            multiple = item.position.length > 1
            coordinates = item.position[0]
          }

          const resolved = resolveIcons(section.icon, item)

          const itemObj: any = {
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

const addNewItemSelectedName = computed(() => {
  if (addToSectionKey.value !== null) {
    return sections.value[addToSectionKey.value].name
  } else if (setPositionToItem.value !== null) {
    return `${sections.value[setPositionToItem.value.section].name} - ${setPositionToItem.value['id']}`
  }
  return ''
})

const showAddNewItemBanner = computed(() => {
  return addToSectionKey.value !== null || setPositionToItem.value !== null
})

const canvasClick = (evt: any) => {
  clickCoordinates.value = evt.coordinates
  if (addToSectionKey.value !== null) {
    const newItem = Object.assign({}, sections.value[addToSectionKey.value].baseItem)
    newItem.position = clickCoordinates.value
    newItem.id = crypto.randomUUID()
    sections.value[addToSectionKey.value].items.push(newItem)
    addToSectionKey.value = null
  }

  if (setPositionToItem.value !== null) {
    const index = sections.value[setPositionToItem.value.section].items.findIndex((item: any) => {
      return item.id == setPositionToItem.value.id
    })
    if (Array.isArray(sections.value[setPositionToItem.value.section].items[index].position)) {
      sections.value[setPositionToItem.value.section].items[index].position[setPositionToItem.value.index] = clickCoordinates.value
    } else {
      sections.value[setPositionToItem.value.section].items[index].position = [clickCoordinates.value]
    }
    setPositionToItem.value = null
  }
}

const addItemToSection = (sectionKey: string) => {
  addToSectionKey.value = sectionKey
  setPositionToItem.value = null
}

const setItemPosition = (data: any) => {
  setPositionToItem.value = data
  addToSectionKey.value = null
}

const cancelAddNewItem = () => {
  addToSectionKey.value = null
  setPositionToItem.value = null
}

const updateItem = (sectionKey: string, newItem: any) => {
  const index = sections.value[sectionKey].items.findIndex((item: any) => {
    return item.id === newItem.id
  })
  if (index !== -1) {
    sections.value[sectionKey].items.splice(index, 1, newItem)
  }
}

const updateShowData = (sectionKey: string, showKey: string, value: any) => {
  const newShowData = Object.assign({}, jsonDataShow.value)
  let newShowKeyData: Record<string, any> = {}
  if (Object.prototype.hasOwnProperty.call(newShowData, sectionKey)) {
    newShowKeyData = Object.assign(newShowData[sectionKey], { [showKey]: value })
  } else {
    newShowKeyData = { [showKey]: value }
  }
  newShowData[sectionKey] = newShowKeyData
  jsonDataShow.value = newShowData
}

const updateAllItemShowData = (sectionKey: string, showKey: string, value: any) => {
  const newShowData = Object.assign({}, jsonDataShow.value)
  sections.value[sectionKey].items.forEach((item: any) => {
    let newShowKeyData: Record<string, any> = {}
    if (Object.prototype.hasOwnProperty.call(newShowData, item.id)) {
      newShowKeyData = Object.assign(newShowData[item.id], { [showKey]: value })
    } else {
      newShowKeyData = { [showKey]: value }
    }
    newShowData[item.id] = newShowKeyData
  })
  jsonDataShow.value = newShowData
}

const deleteItem = (sectionKey: string, itemId: string) => {
  const index = sections.value[sectionKey].items.findIndex((item: any) => {
    return item.id === itemId
  })
  if (index !== -1) {
    sections.value[sectionKey].items.splice(index, 1)
  }
}

const clickedElement = (item: any) => {
  if (Object.prototype.hasOwnProperty.call(jsonDataShow.value, item.key) && !jsonDataShow.value[item.key].expanded) {
    jsonDataShow.value[item.key].expanded = true
  }

  nextTick(() => {
    const itemContainer = document.getElementById(item.id)
    if (itemContainer) {
      const mapDataList = document.getElementById('mapDataList')
      if (mapDataList) {
        mapDataList.scrollTop = itemContainer.offsetTop
      }
    }
  })
}

</script>
