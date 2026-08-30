<template>
  <SectionItem
    :item="item"
    :sectionKey="sectionKey"
    :jsonDataShow="jsonDataShow"
    @updateItemShowData="(id, key, val) => emit('updateItemShowData', id, key, val)"
    @updateAllItemShowData="(skey, key, val) => emit('updateAllItemShowData', skey, key, val)"
    @deleteItem="(skey, id) => emit('deleteItem', skey, id)"
  >
    <form class="w-full max-w-lg" @submit.prevent>
      <div class="flex flex-wrap -mx-3 mb-2">
        <div class="w-full w-full px-3 mb-2 md:mb-0">
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
          <div v-if="'level' in item" class="w-full w-full px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Level
            </label>
            <input :value="item.level" @change="updateLevel"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="number">
          </div>
          <div v-if="'element' in item" class="w-full w-full px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Element
            </label>
            <div class="relative">
              <select :value="item.element" @change="updateElement"
                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full">
                <option value='' disabled></option>
                <option value='fire'>Fire</option>
                <option value='earth'>Earth</option>
                <option value='lightning'>Lightning</option>
                <option value='water'>Water</option>
                <option value='wind'>Wind</option>
                <option value='ice'>Ice</option>
              </select>
            </div>
          </div>
          <Positions :positions="item.position" @updatePosition="updatePosition" @addPosition="addPosition" @setItemPosition="setItemPosition" :multiple="Array.isArray(item.position)" class="w-full w-full px-3" />
        </div>

        <div v-if="'weather' in item" class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full w-full px-3 mb-2 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Weather
            </label>
            <select :value="item.weather" @change="updateWeather"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full">
              <option value='fairskies'>Fair Skies</option>
              <option value='heatwave'>Heat Wave</option>
              <option value='snow'>Snow</option>
              <option value='blizzard'>Blizzard</option>
              <option value='showers'>Showers</option>
              <option value='thunderstorm'>Thunderstorm</option>
              <option value='fog'>Fog</option>
              <option value='umbralwind'>Umbral Wind</option>
              <option value='gales'>Gales</option>
              <option value='gloom'>Gloom</option>
            </select>
          </div>
        </div>

        <div v-if="'boss' in item" class="mb-2">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Boss
          </label>
          <div class="flex flex-wrap -mx-3">
            <div class="w-full w-full px-3 mb-6 md:mb-0">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Name
              </label>
              <input :value="item.boss.name" @change="updateBoss($event, 'name')"
                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                type="text">
            </div>
          </div>
        </div>

        <div v-if="'participants' in item" class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Participants
            </label>
            <input :value="item.participants" @change="updateParticipants"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="number">
          </div>
        </div>

        <Icon v-if="'icon' in item" :icons="iconOptions" :icon="item.icon" @updateIcon="updateIcon" class="w-full w-full px-3" />
        <Drops v-if="'drops' in item" :drops="item.drops" @updateDrops="updateDrops" @addDrop="addDrop" class="w-full w-full px-3" />
        <Spawns v-if="'spawns' in item" :spawns="item.spawns" @updateSpawns="updateSpawns" @addSpawn="addSpawn" class="w-full w-full px-3" />
      </div>
    </form>
  </SectionItem>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SectionItem from './SectionItem.vue'
import Positions from './Positions.vue'
import Icon from './Icon.vue'
import Drops from './Drops.vue'
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

const allIcons = [
  { value: 'boss', name: 'Boss' },
  { value: 'duel', name: 'Duel' },
  { value: 'defend', name: 'Defend' },
  { value: 'gather', name: 'Gather' },
  { value: 'slay', name: 'Slay' },
]

const iconOptions = computed(() => {
  if ('participants' in props.item) {
    return allIcons.filter(i => ['boss', 'duel'].includes(i.value))
  }
  return allIcons.filter(i => ['boss', 'defend', 'gather', 'slay'].includes(i.value))
})

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
  updateElement,
  updateWeather,
  updatePosition,
  addPosition,
  setItemPosition,
  updateBoss,
  updateParticipants,
  updateIcon,
  updateDrops,
  addDrop,
  updateSpawns,
  addSpawn,
} = useSectionItemFields(props, emit)
</script>
