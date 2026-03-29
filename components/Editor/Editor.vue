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
      v-if="!loading"
      :canvasImage="image!"
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
import { ref, computed, onMounted, nextTick } from 'vue'
import EurekaCanvas from 'eureka-canvas'
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

const image = ref<HTMLImageElement | null>(null)
const clickCoordinates = ref({ x: 0, y: 0 })
const icons = ref<Record<string, any>>({})
const jsonDataShow = ref<Record<string, any>>({})
const loading = ref(true)
const addToSectionKey = ref<string | null>(null)
const setPositionToItem = ref<any>(null)

const sortedKeys = computed(() => {
  return Object.keys(props.jsonData).sort((a, b) => props.jsonData[a].order - props.jsonData[b].order)
})

const positions = computed(() => {
  const pos: any[] = []
  if (!loading.value) {
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
                if (!Object.prototype.hasOwnProperty.call(icons.value, item.element)) {
                  itemObj.icons.push({ image: icons.value.noelement })
                } else {
                  itemObj.icons.push({ image: icons.value[item.element] })
                }
                itemObj.label = `${item.name} (${item.level})`
                break
              case 'fates':
                itemObj.icons.push({ image: icons.value.fate })
                if (!Object.prototype.hasOwnProperty.call(icons.value, item.element)) {
                  itemObj.icons.push({ image: icons.value.noelement })
                } else {
                  itemObj.icons.push({ image: icons.value[item.element] })
                }
                break
              case 'quests':
                itemObj.icons.push({ image: icons.value.quest })
                break
              case 'aethernet':
                itemObj.icons.push({ image: icons.value.aetheryte })
                break
              case 'elementals':
                itemObj.icons.push({ image: icons.value.blessing })
                break
              case 'lockboxes':
                itemObj.icons.push({ image: icons.value.lock })
                break
              case 'enemies':
                itemObj.icons.push({ image: icons.value.rank[item.level] ? icons.value.rank[item.level] : icons.value.noelement })
                break
              case 'skirmishes':
                if (Object.prototype.hasOwnProperty.call(item, 'icon') && icons.value.skirmishes[item.icon]) {
                  itemObj.icons.push({ image: icons.value.skirmishes[item.icon] })
                } else {
                  itemObj.icons.push({ image: icons.value.fate })
                }
                break
              case 'engagements':
                if (Object.prototype.hasOwnProperty.call(item, 'icon') && icons.value.engagements[item.icon]) {
                  itemObj.icons.push({ image: icons.value.engagements[item.icon] })
                } else {
                  itemObj.icons.push({ image: icons.value.fate })
                }
                break
              default:
                itemObj.icons.push({ image: icons.value.noelement })
                break
            }

            pos.push(itemObj)

            if (multiple) {
              item.position.slice(1).forEach((position: any) => {
                const multiItem = Object.assign({}, itemObj)
                multiItem.coordinates = position
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

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = url
  })

const loadIcons = async () => {
  const iconsData: Record<string, any> = {}
  iconsData.noelement = await loadImage('/images/icons/elements/noelement.png')
  iconsData.fire = await loadImage('/images/icons/elements/fire2.png')
  iconsData.wind = await loadImage('/images/icons/elements/wind2.png')
  iconsData.water = await loadImage('/images/icons/elements/water2.png')
  iconsData.lightning = await loadImage('/images/icons/elements/lightning2.png')
  iconsData.ice = await loadImage('/images/icons/elements/ice2.png')
  iconsData.earth = await loadImage('/images/icons/elements/earth2.png')
  iconsData.quest = await loadImage('/images/icons/quest.png')
  iconsData.adaptation = await loadImage('/images/icons/adaptation.png')
  iconsData.mutation = await loadImage('/images/icons/mutation.png')
  iconsData.aetheryte = await loadImage('/images/icons/aetheryte.png')
  iconsData.fate = await loadImage('/images/icons/fate.png')
  iconsData.blessing = await loadImage('/images/icons/blessing.png')
  iconsData.lock = await loadImage('/images/icons/lock.png')
  iconsData.rank = []
  iconsData.rank[0] = await loadImage('/images/icons/ranks/0.png')
  iconsData.rank[1] = await loadImage('/images/icons/ranks/1.png')
  iconsData.rank[2] = await loadImage('/images/icons/ranks/2.png')
  iconsData.rank[3] = await loadImage('/images/icons/ranks/3.png')
  iconsData.rank[4] = await loadImage('/images/icons/ranks/4.png')
  iconsData.rank[5] = await loadImage('/images/icons/ranks/5.png')
  iconsData.engagements = {}
  iconsData.engagements.boss = await loadImage('/images/icons/engagements/boss.png')
  iconsData.engagements.duel = await loadImage('/images/icons/engagements/duel.png')
  iconsData.skirmishes = {}
  iconsData.skirmishes.boss = await loadImage('/images/icons/skirmishes/boss.png')
  iconsData.skirmishes.defend = await loadImage('/images/icons/skirmishes/defend.png')
  iconsData.skirmishes.gather = await loadImage('/images/icons/skirmishes/gather.png')
  iconsData.skirmishes.slay = await loadImage('/images/icons/skirmishes/slay.png')
  icons.value = iconsData
}

onMounted(async () => {
  image.value = await loadImage(props.imageSource)
  await loadIcons()
  loading.value = false
})
</script>
