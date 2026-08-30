<template>
  <div class="w-full rounded">
    <div class="sectionHeader bg-white p-4 border-b border-gray-200 flex justify-between content-center sticky top-0 z-50">
      <div>
        <input
:checked="showOnMap" type="checkbox" title="Show/Hide this section from the map"
          @input="updateShowOnMap" >
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
        :id="item.id"
        :key="item.id"
        :item="item"
        :section-key="sectionKey"
        :json-data-show="jsonDataShow"
        :json-data="jsonData"
        @update-item="updateItem"
        @set-item-position="setItemPosition"
        @update-item-show-data="updateItemShowData"
        @delete-item="deleteItem"
        @update-all-item-show-data="updateAllItemShowData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getEditorComponent } from '~/composables/useSectionRegistry'

const props = defineProps<{
  section: any
  sectionKey: string
  jsonDataShow: Record<string, any>
  searchValue: string
  jsonData?: Record<string, any>
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

const itemComponent = computed(() => getEditorComponent(props.section.type))

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
