<template>
  <div class="w-full rounded">
    <div class="sectionHeader bg-white p-4 border-b border-gray-200 flex justify-between content-center sticky top-0 z-50">
      <div>
        <input :checked="showOnMap" @input="updateShowOnMap" type="checkbox"
          title="Show/Hide this section from the map" />
      </div>
      <div>
        <span class="font-bold mr-1">{{ section.name }} ({{ filteredItems.length }})</span>
        <span @click="addToSection">
          <font-awesome-icon icon="plus" class="cursor-pointer" /></span>
      </div>
      <div>
        <span v-show="expanded" @click="toggleExpanded">
          <font-awesome-icon icon="caret-up" class="cursor-pointer" /></span>
        <span v-show="!expanded" @click="toggleExpanded">
          <font-awesome-icon icon="caret-down" class="cursor-pointer" /></span>
      </div>
    </div>
    <div v-show="expanded && filteredItems.length" class="sectionBody p-4 bg-gray-100">
      <component
        :is="itemComponent"
        v-for="item in filteredItems"
        :key="item.id"
        :id="item.id"
        :item="item"
        :sectionKey="sectionKey"
        :jsonDataShow="jsonDataShow"
        :fates="fates"
        @updateItem="updateItem"
        @setItemPosition="setItemPosition"
        @updateItemShowData="updateItemShowData"
        @deleteItem="deleteItem"
        @updateAllItemShowData="updateAllItemShowData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Generic from './SectionItems/Generic.vue'
import Monster from './SectionItems/Monster.vue'
import Quest from './SectionItems/Quest.vue'
import Aetheryte from './SectionItems/Aetheryte.vue'
import Fate from './SectionItems/Fate.vue'
import Elemental from './SectionItems/Elemental.vue'
import Lockbox from './SectionItems/Lockbox.vue'
import CriticalEngagements from './SectionItems/CriticalEngagements.vue'
import Skirmishes from './SectionItems/Skirmishes.vue'
import Enemies from './SectionItems/Enemies.vue'

const props = defineProps<{
  section: any
  sectionKey: string
  jsonDataShow: Record<string, any>
  searchValue: string
  fates: any[]
}>()

const emit = defineEmits<{
  (e: 'addToSection', data: { key: string }): void
  (e: 'setItemPosition', data: any): void
  (e: 'updateItem', sectionKey: string, item: any): void
  (e: 'updateShowData', sectionKey: string, showKey: string, value: any): void
  (e: 'updateItemShowData', itemId: string, showKey: string, value: any): void
  (e: 'updateAllItemShowData', sectionKey: string, showKey: string, value: any): void
  (e: 'deleteItem', sectionKey: string, itemId: string): void
}>()

const filteredItems = computed(() => {
  let items = []

  if (props.searchValue !== '') {
    items = props.section.items.filter((item: any) => {
      return item.id.toLowerCase().includes(props.searchValue.toLowerCase()) ||
        item.name.toLowerCase().includes(props.searchValue.toLowerCase())
    })
  } else {
    items = props.section.items
  }

  const baseItems = JSON.parse(JSON.stringify(props.section.baseItem))
  items = JSON.parse(JSON.stringify(items))
  items = items.map((item: any) => {
    return Object.assign({}, baseItems, item)
  })

  return items
})

const itemComponent = computed(() => {
  switch (props.sectionKey) {
    case 'monsters': return Monster
    case 'quests': return Quest
    case 'aethernet': return Aetheryte
    case 'fates': return Fate
    case 'elementals': return Elemental
    case 'lockboxes': return Lockbox
    case 'engagements': return CriticalEngagements
    case 'skirmishes': return Skirmishes
    case 'enemies': return Enemies
    default: return Generic
  }
})

const showOnMap = computed(() => {
  if (Object.prototype.hasOwnProperty.call(props.jsonDataShow, props.sectionKey) &&
      Object.prototype.hasOwnProperty.call(props.jsonDataShow[props.sectionKey], 'showOnMap')) {
    return props.jsonDataShow[props.sectionKey].showOnMap
  }
  return true
})

const expanded = computed(() => {
  if (Object.prototype.hasOwnProperty.call(props.jsonDataShow, props.sectionKey) &&
      Object.prototype.hasOwnProperty.call(props.jsonDataShow[props.sectionKey], 'expanded')) {
    return props.jsonDataShow[props.sectionKey].expanded
  }
  return true
})

const addToSection = () => {
  emit('addToSection', { key: props.sectionKey })
}

const setItemPosition = (evt: any) => {
  emit('setItemPosition', evt)
}

const updateItem = (sectionKey: string, newItem: any) => {
  emit('updateItem', sectionKey, newItem)
}

const updateShowOnMap = (evt: Event) => {
  emit('updateShowData', props.sectionKey, 'showOnMap', (evt.target as HTMLInputElement).checked)
}

const toggleExpanded = () => {
  emit('updateShowData', props.sectionKey, 'expanded', !expanded.value)
}

const updateItemShowData = (itemId: string, showKey: string, value: any) => {
  emit('updateItemShowData', itemId, showKey, value)
}

const updateAllItemShowData = (sectionKey: string, showKey: string, value: any) => {
  emit('updateAllItemShowData', sectionKey, showKey, value)
}

const deleteItem = (sectionKey: string, itemId: string) => {
  emit('deleteItem', sectionKey, itemId)
}
</script>
