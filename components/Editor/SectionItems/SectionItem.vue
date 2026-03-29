<template>
  <div class="relative rounded overflow-hidden shadow-md bg-white mb-4 px-4 pb-4">
    <div class="mb-2 py-1 flex justify-between content-center border border-gray-100">
      <div class="mr-1">
        <input :checked="showOnMap" @click="updateShowOnMap($event)" type="checkbox" title="Show/Hide this section from the map" />
      </div>
      <div class="mr-auto">
        <span @click="deleteItem"><font-awesome-icon icon="times" class="cursor-pointer" /></span>
      </div>
      <div>
        <span v-show="expanded" @click="toggleExpanded"><font-awesome-icon icon="caret-up" class="cursor-pointer" /></span>
        <span v-show="!expanded" @click="toggleExpanded"><font-awesome-icon icon="caret-down" class="cursor-pointer" /></span>
      </div>
    </div>
    <div class="w-full">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  item: any
  sectionKey: string
  jsonDataShow: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'updateItemShowData', itemId: string, showKey: string, value: any): void
  (e: 'updateAllItemShowData', sectionKey: string, showKey: string, value: any): void
  (e: 'deleteItem', sectionKey: string, itemId: string): void
}>()

const expanded = computed(() => {
  if (Object.prototype.hasOwnProperty.call(props.jsonDataShow, props.item.id) &&
      Object.prototype.hasOwnProperty.call(props.jsonDataShow[props.item.id], 'expanded')) {
    return props.jsonDataShow[props.item.id].expanded
  }
  return true
})

const showOnMap = computed(() => {
  if (Object.prototype.hasOwnProperty.call(props.jsonDataShow, props.item.id) &&
      Object.prototype.hasOwnProperty.call(props.jsonDataShow[props.item.id], 'showOnMap')) {
    return props.jsonDataShow[props.item.id].showOnMap
  }
  return true
})

const updateShowOnMap = (evt: MouseEvent) => {
  const target = evt.target as HTMLInputElement
  if (evt.altKey) {
    emit('updateAllItemShowData', props.sectionKey, 'showOnMap', target.checked)
  } else {
    emit('updateItemShowData', props.item.id, 'showOnMap', target.checked)
  }
}

const toggleExpanded = () => {
  emit('updateItemShowData', props.item.id, 'expanded', !expanded.value)
}

const deleteItem = () => {
  if (confirm('You will be unable to recover this item after deleting. Are you sure?')) {
    emit('deleteItem', props.sectionKey, props.item.id)
  }
}
</script>
