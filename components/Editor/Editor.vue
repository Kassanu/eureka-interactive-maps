<template>
  <div id="editor" class="relative">
    <div v-show="showAddNewItemBanner" @click="cancelAddNewItem" class="addNewItemBanner absolute top-0 left-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Click on the map to add a new item for {{ addNewItemSelectedName }}. Click this message to cancel.
    </div>
    <MapDataEditor
      :jsonData="jsonData"
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
import { ref, computed, nextTick } from 'vue'
import { EurekaCanvas } from 'eureka-canvas'
import MapDataEditor from './MapDataEditor.vue'

const props = defineProps<{
  imageSource: string
  jsonData: any
  mapName: string
  gridSizeInPixels?: number
  coordinatesOffset?: number
  maximumZoom?: number
}>()

const gridSizeInPixels = props.gridSizeInPixels ?? 100
const coordinatesOffset = props.coordinatesOffset ?? 0
const maximumZoom = props.maximumZoom ?? 100

const clickCoordinates = ref({ x: 0, y: 0 })
const jsonDataShow = ref<Record<string, any>>({})
const addToSectionKey = ref<string | null>(null)

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
const setPositionToItem = ref<any>(null)

const sortedKeys = computed(() => {
  return Object.keys(props.jsonData).sort((a, b) => props.jsonData[a].order - props.jsonData[b].order)
})

const positions = computed(() => {
  const pos: any[] = []
  sortedKeys.value.forEach(key => {
    const section = props.jsonData[key]
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

          const itemObj: any = {
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
              break
            case 'engagements':
              itemObj.icons.push(iconPaths[`engagements_${item.icon}`] || iconPaths.fate)
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

const addNewItemSelectedName = computed(() => {
  if (addToSectionKey.value !== null) {
    return props.jsonData[addToSectionKey.value].name
  } else if (setPositionToItem.value !== null) {
    return `${props.jsonData[setPositionToItem.value.section].name} - ${setPositionToItem.value['id']}`
  }
  return ''
})

const showAddNewItemBanner = computed(() => {
  return addToSectionKey.value !== null || setPositionToItem.value !== null
})

const canvasClick = (evt: any) => {
  clickCoordinates.value = evt.coordinates
  if (addToSectionKey.value !== null) {
    const newItem = Object.assign({}, props.jsonData[addToSectionKey.value].baseItem)
    newItem.position = clickCoordinates.value
    newItem.id = crypto.randomUUID()
    props.jsonData[addToSectionKey.value].items.push(newItem)
    addToSectionKey.value = null
  }

  if (setPositionToItem.value !== null) {
    const index = props.jsonData[setPositionToItem.value.section].items.findIndex((item: any) => {
      return item.id == setPositionToItem.value.id
    })
    if (Array.isArray(props.jsonData[setPositionToItem.value.section].items[index].position)) {
      props.jsonData[setPositionToItem.value.section].items[index].position[setPositionToItem.value.index] = clickCoordinates.value
    } else {
      props.jsonData[setPositionToItem.value.section].items[index].position = [clickCoordinates.value]
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
  const index = props.jsonData[sectionKey].items.findIndex((item: any) => {
    return item.id === newItem.id
  })
  if (index !== -1) {
    props.jsonData[sectionKey].items.splice(index, 1, newItem)
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
  props.jsonData[sectionKey].items.forEach((item: any) => {
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
  const index = props.jsonData[sectionKey].items.findIndex((item: any) => {
    return item.id === itemId
  })
  if (index !== -1) {
    props.jsonData[sectionKey].items.splice(index, 1)
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
