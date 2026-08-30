<template>
  <div id="editorContainer" class="flex flex-col">
    <div class="flex justify-end mt-1 mb-2 px-2">
      <input v-model="searchValue" placeholder="Search by Name or ID" class="px-2 py-1 mr-2 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full" type="text">
      <button
        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        @click="saveJson">
        Save
      </button>
    </div>
    <div id="mapDataList" class="flex-grow overflow-y-scroll relative">
      <Section
        v-for="(section, index) in jsonData"
        :key="index"
        :section-key="index"
        :section="section"
        :json-data-show="jsonDataShow"
        :search-value="searchValue"
        :json-data="jsonData"
        @add-to-section="addItemToSection"
        @set-item-position="setItemPosition"
        @update-item="updateItem"
        @update-show-data="updateShowData"
        @update-item-show-data="updateItemShowData"
        @update-all-item-show-data="updateAllItemShowData"
        @delete-item="deleteItem"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Section from './Section.vue'

const props = defineProps<{
  jsonData: Record<string, any>
  fullJsonData?: Record<string, any>
  jsonDataShow: Record<string, any>
  clickCoordinates: { x: number; y: number }
  mapName: string
}>()

const emit = defineEmits<{
  (e: 'addItemToSection', sectionKey: string): void
  (e: 'setItemPosition', data: any): void
  (e: 'updateItem', sectionKey: string, item: any): void
  (e: 'updateShowData', sectionKey: string, showKey: string, value: any): void
  (e: 'updateAllItemShowData', sectionKey: string, showKey: string, value: any): void
  (e: 'deleteItem', sectionKey: string, itemId: string): void
}>()

const searchValue = ref('')

const addItemToSection = (evt: { key: string }) => {
  emit('addItemToSection', evt.key)
}

const setItemPosition = (evt: any) => {
  emit('setItemPosition', evt)
}

const updateItem = (sectionKey: string, newItem: any) => {
  emit('updateItem', sectionKey, newItem)
}

const updateShowData = (sectionKey: string, showKey: string, value: any) => {
  emit('updateShowData', sectionKey, showKey, value)
}

const updateItemShowData = (itemId: string, showKey: string, value: any) => {
  emit('updateShowData', itemId, showKey, value)
}

const updateAllItemShowData = (sectionKey: string, showKey: string, value: any) => {
  emit('updateAllItemShowData', sectionKey, showKey, value)
}

const deleteItem = (sectionKey: string, itemId: string) => {
  emit('deleteItem', sectionKey, itemId)
}

const saveJson = () => {
  const a = document.createElement('a')
  const file = new Blob([JSON.stringify(props.fullJsonData ?? props.jsonData, null, 4)], { type: 'application/json' })
  a.href = URL.createObjectURL(file)
  a.download = `${props.mapName}.json`
  a.click()
}
</script>
