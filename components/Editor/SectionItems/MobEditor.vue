<template>
  <SectionItem
    :item="item"
    :section-key="sectionKey"
    :json-data-show="jsonDataShow"
    @update-item-show-data="(id, key, val) => emit('updateItemShowData', id, key, val)"
    @update-all-item-show-data="(skey, key, val) => emit('updateAllItemShowData', skey, key, val)"
    @delete-item="(skey, id) => emit('deleteItem', skey, id)"
  >
    <form class="w-full max-w-lg" @submit.prevent>
      <div class="flex flex-wrap -mx-3 mb-2">
        <div class="w-full w-full px-3 mb-2 md:mb-0">
          <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            ID
          </label>
          <input
:value="item.id"
            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
            type="text" readonly>
        </div>
        <div class="w-full w-full px-3">
          <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Name
          </label>
          <input
:value="item.name" class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
            type="text"
            @change="updateName">
        </div>
      </div>
      <div v-show="expanded">
        <div class="flex flex-wrap -mx-3 mb-2">
          <div v-if="'level' in item" class="w-full w-full px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Level
            </label>
            <input
:value="item.level" class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="number"
              @change="updateLevel">
          </div>
          <div v-if="'element' in item" class="w-full w-full px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Element
            </label>
            <div class="relative">
              <select
:value="item.element" class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                @change="updateElement">
                <option value='' disabled/>
                <option value='fire'>Fire</option>
                <option value='earth'>Earth</option>
                <option value='lightning'>Lightning</option>
                <option value='water'>Water</option>
                <option value='wind'>Wind</option>
                <option value='ice'>Ice</option>
              </select>
            </div>
          </div>
          <Positions :positions="item.position" :multiple="Array.isArray(item.position)" class="w-full w-full px-3 mb-6 md:mb-0" @update-position="updatePosition" @add-position="addPosition" @set-item-position="setItemPosition" />
        </div>

        <div v-if="'aggro' in item" class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full w-full px-3 mb-2 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Aggro
            </label>
            <div class="relative">
              <select
:value="item.aggro" class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                @change="updateAggro">
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
            <input
:checked="item.family?.includes(family)" class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox"
              @change="updateFamily($event, family)">
          </div>
        </div>

        <!-- Attack / Weakness (enemies) -->
        <div v-if="'attack' in item || 'weakness' in item" class="flex w-full w-full px-3 mb-3 -mx-3">
          <div v-if="'attack' in item" class="w-1/3 px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Attack
            </label>
            <select
:value="item.attack" class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline mr-2"
              @change="updateAttack">
              <option value=''>Both</option>
              <option value='physical'>Physical</option>
              <option value='magical'>Magical</option>
            </select>
          </div>
          <div v-if="'weakness' in item" class="w-1/3 px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Weakness
            </label>
            <select
:value="item.weakness" class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline mr-2"
              @change="updateWeakness">
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
            <input
:checked="item.mutation.canMutate" class="px-2 py-1 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox"
              @input="updateMutation">
          </div>
          <div v-if="item.mutation.canMutate" class="w-full w-full px-3 mb-6 md:mb-0 bg-blue-100">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Mutated Element
            </label>
            <select
:value="item.mutation.element" class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              @change="updateMutationElement">
              <option value='' disabled/>
              <option value='fire'>Fire</option>
              <option value='earth'>Earth</option>
              <option value='lightning'>Lightning</option>
              <option value='water'>Water</option>
              <option value='wind'>Wind</option>
              <option value='ice'>Ice</option>
            </select>
          </div>
          <div v-if="item.mutation.canMutate" class="w-full w-full px-3 mb-6 md:mb-0 bg-blue-100">
            <button
class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              @click="addCondition('mutation')">
              <font-awesome-icon icon="plus" class="cursor-pointer" />
            </button>
          </div>
        </div>

        <MutationAdaptionConditions
v-if="'mutation' in item && item.mutation.canMutate" :conditions="item.mutation.conditions"
          :type="'mutation'" :bg-class="'bg-blue-100'" @change-conditions="changeConditions"
          @delete-condition="deleteCondition" />

        <!-- Adaptation -->
        <div v-if="'adaptation' in item" class="flex flex-wrap -mx-3 mt-2">
          <div class="w-full w-full px-3 mb-6 md:mb-0 bg-green-100">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Adaptation
            </label>
            <input
:checked="item.adaptation.canAdapt" class="px-2 py-1 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox"
              @input="updateAdaptation">
          </div>
          <div v-if="item.adaptation.canAdapt" class="w-full w-full px-3 mb-6 md:mb-0 bg-green-100">
            <button
class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              @click="addCondition('adaptation')">
              <font-awesome-icon icon="plus" class="cursor-pointer" />
            </button>
          </div>
          <div v-if="item.adaptation.canAdapt" class="w-full w-full px-3 mb-6 md:mb-0 bg-green-100"/>
        </div>

        <MutationAdaptionConditions
v-if="'adaptation' in item && item.adaptation.canAdapt" :conditions="item.adaptation.conditions"
          :type="'adaptation'" :bg-class="'bg-green-100'" @change-conditions="changeConditions"
          @delete-condition="deleteCondition" />

        <!-- Fate -->
        <div v-if="'fate' in item" class="flex flex-wrap -mx-3 mt-2 mb-2">
          <div class="w-full w-full px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Fate
            </label>
            <input
:checked="item.fate.forFate" class="px-2 py-1 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox"
              @input="updateFate">
          </div>
          <div v-show="item.fate.forFate" class="w-full w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Fate
            </label>
            <select
:value="item.fate.fateId" class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              @change="updateForFateId">
              <option value=''/>
              <option v-for="fate in fates" :key="fate.id" :value="fate.id">{{ fate.name }}</option>
            </select>
          </div>
        </div>

        <Drops v-if="'drops' in item" :drops="item.drops" class="w-full w-full px-3" @update-drops="updateDrops" @add-drop="addDrop" />
        <Spawns v-if="'spawns' in item" :spawns="item.spawns" class="w-full w-full px-3" @update-spawns="updateSpawns" @add-spawn="addSpawn" />
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
  jsonData?: Record<string, any>
}>()

const fates = computed(() => props.jsonData?.fates?.items ?? [])

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
