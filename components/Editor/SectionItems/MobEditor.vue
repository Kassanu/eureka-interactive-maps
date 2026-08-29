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
          <Positions :positions="item.position" @updatePosition="updatePosition" @addPosition="addPosition" @setItemPosition="setItemPosition" :multiple="Array.isArray(item.position)" class="w-full w-full px-3 mb-6 md:mb-0" />
        </div>

        <div v-if="'aggro' in item" class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full w-full px-3 mb-2 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Aggro
            </label>
            <div class="relative">
              <select :value="item.aggro" @change="updateAggro"
                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full">
                <option value=''>None</option>
                <option value='sight'>Sight</option>
                <option value='sound'>Sound</option>
                <option value='magic'>Magic</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="familyKeys.length" class="flex flex-wrap -mx-3 mb-2">
          <div v-for="family in familyKeys" :key="family" class="w-full w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              {{ capitalize(family) }}
            </label>
            <input :checked="item.family?.includes(family)" @change="updateFamily($event, family)"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox">
          </div>
        </div>

        <!-- Attack / Weakness (enemies) -->
        <div v-if="'attack' in item || 'weakness' in item" class="flex w-full w-full px-3 mb-3 -mx-3">
          <div v-if="'attack' in item" class="w-1/3 px-3">
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
          <div v-if="'weakness' in item" class="w-1/3 px-3">
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

        <!-- Mutation -->
        <div v-if="'mutation' in item" class="flex flex-wrap -mx-3">
          <div class="w-full w-full px-3 mb-6 md:mb-0 bg-blue-100">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Mutation
            </label>
            <input :checked="item.mutation.canMutate" @input="updateMutation"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox">
          </div>
          <div v-if="item.mutation.canMutate" class="w-full w-full px-3 mb-6 md:mb-0 bg-blue-100">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Mutated Element
            </label>
            <select :value="item.mutation.element" @change="updateMutationElement"
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
          <div v-if="item.mutation.canMutate" class="w-full w-full px-3 mb-6 md:mb-0 bg-blue-100">
            <button @click="addCondition('mutation')"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <font-awesome-icon icon="plus" class="cursor-pointer" />
            </button>
          </div>
        </div>

        <MutationAdaptionConditions v-if="'mutation' in item && item.mutation.canMutate" :conditions="item.mutation.conditions"
          :type="'mutation'" :bgClass="'bg-blue-100'" @changeConditions="changeConditions"
          @deleteCondition="deleteCondition" />

        <!-- Adaptation -->
        <div v-if="'adaptation' in item" class="flex flex-wrap -mx-3 mt-2">
          <div class="w-full w-full px-3 mb-6 md:mb-0 bg-green-100">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Adaptation
            </label>
            <input :checked="item.adaptation.canAdapt" @input="updateAdaptation"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox">
          </div>
          <div v-if="item.adaptation.canAdapt" class="w-full w-full px-3 mb-6 md:mb-0 bg-green-100">
            <button @click="addCondition('adaptation')"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <font-awesome-icon icon="plus" class="cursor-pointer" />
            </button>
          </div>
          <div v-if="item.adaptation.canAdapt" class="w-full w-full px-3 mb-6 md:mb-0 bg-green-100"></div>
        </div>

        <MutationAdaptionConditions v-if="'adaptation' in item && item.adaptation.canAdapt" :conditions="item.adaptation.conditions"
          :type="'adaptation'" :bgClass="'bg-green-100'" @changeConditions="changeConditions"
          @deleteCondition="deleteCondition" />

        <!-- Fate -->
        <div v-if="'fate' in item" class="flex flex-wrap -mx-3 mt-2 mb-2">
          <div class="w-full w-full px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Fate
            </label>
            <input :checked="item.fate.forFate" @input="updateFate"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox">
          </div>
          <div v-show="item.fate.forFate" class="w-full w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Fate
            </label>
            <select :value="item.fate.fateId" @change="updateForFateId"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full">
              <option value=''></option>
              <option v-for="fate in fates" :key="fate.id" :value="fate.id">{{ fate.name }}</option>
            </select>
          </div>
        </div>

        <Drops v-if="'drops' in item" :drops="item.drops" @updateDrops="updateDrops" @addDrop="addDrop" class="w-full w-full px-3" />
        <Spawns v-if="'spawns' in item" :spawns="item.spawns" @updateSpawns="updateSpawns" @addSpawn="addSpawn" class="w-full w-full px-3" />
      </div>
    </form>
  </SectionItem>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SectionItem from './SectionItem.vue'
import MutationAdaptionConditions from './MutationAdaptionConditions.vue'
import Positions from './Positions.vue'
import Drops from './Drops.vue'
import Spawns from './Spawns.vue'
import { useSectionItemFields } from '~/composables/useSectionItemFields'
import { useZoneLookups } from '~/composables/useZoneConfig'

const props = defineProps<{
  item: any
  sectionKey: string
  jsonDataShow: Record<string, any>
  fates: any[]
}>()

const emit = defineEmits<{
  (e: 'updateItem', sectionKey: string, item: any): void
  (e: 'setItemPosition', data: any): void
  (e: 'updateItemShowData', itemId: string, showKey: string, value: any): void
  (e: 'updateAllItemShowData', sectionKey: string, showKey: string, value: any): void
  (e: 'deleteItem', sectionKey: string, itemId: string): void
}>()

const lookups = useZoneLookups()

const familyKeys = computed(() =>
  'family' in props.item ? (lookups.value.mobFamilies ?? []) : []
)

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

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
  updatePosition,
  addPosition,
  setItemPosition,
  updateAggro,
  updateFamily,
  updateAdaptation,
  updateMutation,
  updateFate,
  updateForFateId,
  updateMutationElement,
  addCondition,
  deleteCondition,
  changeConditions,
  updateAttack,
  updateWeakness,
  updateDrops,
  addDrop,
  updateSpawns,
  addSpawn,
} = useSectionItemFields(props, emit)
</script>
