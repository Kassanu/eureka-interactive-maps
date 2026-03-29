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
          <div class="w-full w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Ashkin
            </label>
            <input :checked="item.ashkin" @change="updateAshkin"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox">
          </div>
          <div class="w-full w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Elemental
            </label>
            <input :checked="item.elemental" @change="updateElemental"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox">
          </div>
          <div class="w-full w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Fauna
            </label>
            <input :checked="item.fauna" @change="updateFauna"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox">
          </div>
          <div class="w-full w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Machine
            </label>
            <input :checked="item.machina" @change="updateMachine"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox">
          </div>
          <Positions :positions="item.position" @updatePosition="updatePosition" @addPosition="addPosition" @setItemPosition="setItemPosition" :multiple="true" class="w-full w-full px-3"></Positions>
          <div class="flex w-full w-full px-3 mb-3">
            <div class="w-1/3 px-3">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Aggro
              </label>
              <select :value="item.aggro" @change="updateAggro"
                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline mr-2">
                <option value=''>None</option>
                <option value='sight'>Sight</option>
                <option value='sound'>Sound</option>
                <option value='magic'>Magic</option>
              </select>
            </div>
            <div class="w-1/3 px-3">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Attack
              </label>
              <select :value="item.attack" @change="updateAttack"
                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline mr-2">
                <option value=''>Both</option>
                <option value='physical'>Physical</option>
                <option value='magical'>Magical</option>
              </select>
            </div>
            <div class="w-1/3 px-3">
              <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Weakness
              </label>
              <select :value="item.weakness" @change="updateWeakness"
                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline mr-2">
                <option value=''>None</option>
                <option value='physical'>Physical</option>
                <option value='magical'>Magical</option>
              </select>
            </div>
          </div>
          <Drops :drops="item.drops" @updateDrops="updateDrops" @addDrop="addDrop" class="w-full w-full px-3"></Drops>
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
  updateAggro,
  updateAshkin,
  updateElemental,
  updateFauna,
  updateMachine,
  updateDrops,
  addDrop,
  updateSpawns,
  addSpawn,
  updateAttack,
  updateWeakness,
} = useSectionItemFields(props, emit)
</script>
