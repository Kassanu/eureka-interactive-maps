<template>
  <SectionItem
    :item="item"
    :sectionKey="sectionKey"
    :jsonDataShow="jsonDataShow"
    @updateItemShowData="(id, key, val) => emit('updateItemShowData', id, key, val)"
    @updateAllItemShowData="(skey, key, val) => emit('updateAllItemShowData', skey, key, val)"
    @deleteItem="(skey, id) => emit('deleteItem', skey, id)"
  >
    <form @submit.prevent>
      <div class="flex flex-wrap -mx-3 mb-2">
        <div class="w-full w-full px-3">
          <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            ID
          </label>
          <input :value="item.id"
            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
            type="text" readonly>
        </div>
        <div class="w-full w-full px-3">
          <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Name
          </label>
          <input :value="item.name" @change="updateName"
            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
            type="text">
        </div>
      </div>
      <div v-show="expanded">
        <div class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Level
            </label>
            <input :value="item.level" @change="updateLevel"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="number">
          </div>
          <Positions :positions="item.position" @updatePosition="updatePosition" @addPosition="addPosition" @setItemPosition="setItemPosition" :multiple="true" class="w-full w-full px-3"></Positions>
          <div class="w-full w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Participants
            </label>
            <input :value="item.participants" @change="updateParticipants"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="number">
          </div>
          <Icon :icons="icons" :icon="item.icon" @updateIcon="updateIcon" class="w-full w-full px-3"></Icon>
          <Spawns :spawns="item.spawns" @updateSpawns="updateSpawns" @addSpawn="addSpawn" class="w-full w-full px-3"></Spawns>
        </div>
      </div>
    </form>
  </SectionItem>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SectionItem from './SectionItem.vue'
import Positions from './Positions.vue'
import Icon from './Icon.vue'
import Spawns from './Spawns.vue'
import { useSectionItemFields } from '~/composables/useSectionItemFields'

const props = defineProps<{
  item: any
  sectionKey: string
  jsonDataShow: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'updateItem', sectionKey: string, item: any): void
  (e: 'setItemPosition', data: any): void
  (e: 'updateItemShowData', itemId: string, showKey: string, value: any): void
  (e: 'updateAllItemShowData', sectionKey: string, showKey: string, value: any): void
  (e: 'deleteItem', sectionKey: string, itemId: string): void
}>()

const icons = [
  { value: 'boss', name: 'Boss' },
  { value: 'duel', name: 'Duel' },
]

const expanded = computed(() => {
  if (Object.prototype.hasOwnProperty.call(props.jsonDataShow, props.item.id) &&
      Object.prototype.hasOwnProperty.call(props.jsonDataShow[props.item.id], 'expanded')) {
    return props.jsonDataShow[props.item.id].expanded
  }
  return true
})

const {
  updateName,
  updateLevel,
  updatePosition,
  addPosition,
  setItemPosition,
  updateParticipants,
  updateIcon,
  updateSpawns,
  addSpawn,
} = useSectionItemFields(props, emit)
</script>
