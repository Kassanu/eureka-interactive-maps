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
          <div class="w-full w-full px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Level
            </label>
            <input :value="item.level" @change="updateLevel"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
              type="number">
          </div>
          <div class="w-full w-full px-3 mb-6 md:mb-0">
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
          <Positions :positions="item.position" @updatePosition="updatePosition" @addPosition="addPosition" @setItemPosition="setItemPosition" :multiple="false" class="w-full w-full px-3 mb-6 md:mb-0"></Positions>
        </div>

        <div class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full w-full px-3 mb-2 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Aggro
            </label>
            <div class="relative">
              <select :value="item.aggro" @change="updateAggro"
                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full">
                <option value=''></option>
                <option value='sight'>Sight</option>
                <option value='sound'>Sound</option>
                <option value='magic'>Magic</option>
              </select>
            </div>
          </div>

          <div class="w-full w-full px-3 mb-2 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Ashkin
            </label>
            <input :checked="item.ashkin" @input="updateAshkin"
              class="px-2 py-1 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
              type="checkbox">
          </div>
        </div>

        <div class="flex flex-wrap -mx-3">
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

        <MutationAdaptionConditions v-if="item.mutation.canMutate" :conditions="item.mutation.conditions"
          :type="'mutation'" :bgClass="'bg-blue-100'" @changeConditions="changeConditions"
          @deleteCondition="deleteCondition" />

        <div class="flex flex-wrap -mx-3 mt-2">
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

        <MutationAdaptionConditions v-if="item.adaptation.canAdapt" :conditions="item.adaptation.conditions"
          :type="'adaptation'" :bgClass="'bg-green-100'" @changeConditions="changeConditions"
          @deleteCondition="deleteCondition" />

        <div class="flex flex-wrap -mx-3 mt-2 mb-2">
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
      </div>
    </form>
  </SectionItem>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SectionItem from './SectionItem.vue'
import MutationAdaptionConditions from './MutationAdaptionConditions.vue'
import Positions from './Positions.vue'
import { useSectionItemFields } from '~/composables/useSectionItemFields'

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
  updateAdaptation,
  updateMutation,
  updateFate,
  updateAshkin,
  updateForFateId,
  updateMutationElement,
  addCondition,
  deleteCondition,
  changeConditions,
} = useSectionItemFields(props, emit)
</script>
