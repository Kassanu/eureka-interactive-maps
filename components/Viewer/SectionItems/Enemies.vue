<template>
  <div class="p-2 rounded overflow-hidden shadow-md section-filters">
    <div class="mb-3">
      <label class="block text-sm font-bold mb-2">Enemy Rank</label>
      <div class="mb-3">
        <div class="flex flex-wrap -mx-3">
          <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
            <input
              :checked="filters.rank[1]"
              @change="updateRank($event, 1)"
              id="rank1Checkbox"
              class="mr-2 leading-tight"
              type="checkbox"
            />
            <label for="rank1Checkbox" class="text-sm font-bold">Rank 1</label>
          </div>
          <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
            <input
              :checked="filters.rank[2]"
              @change="updateRank($event, 2)"
              id="rank2Checkbox"
              class="mr-2 leading-tight"
              type="checkbox"
            />
            <label for="rank2Checkbox" class="text-sm font-bold">Rank 2</label>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <div class="flex flex-wrap -mx-3">
          <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
            <input
              :checked="filters.rank[3]"
              @change="updateRank($event, 3)"
              id="rank3Checkbox"
              class="mr-2 leading-tight"
              type="checkbox"
            />
            <label for="rank3Checkbox" class="text-sm font-bold">Rank 3</label>
          </div>
          <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
            <input
              :checked="filters.rank[4]"
              @change="updateRank($event, 4)"
              id="rank4Checkbox"
              class="mr-2 leading-tight"
              type="checkbox"
            />
            <label for="rank4Checkbox" class="text-sm font-bold">Rank 4</label>
          </div>
        </div>
      </div>

      <div>
        <div class="flex flex-wrap -mx-3">
          <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
            <input
              :checked="filters.rank[5]"
              @change="updateRank($event, 5)"
              id="rank5Checkbox"
              class="mr-2 leading-tight"
              type="checkbox"
            />
            <label for="rank5Checkbox" class="text-sm font-bold">Rank 5</label>
          </div>
          <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
            <input
              :checked="filters.rank[0]"
              @change="updateRank($event, 0)"
              id="rank0Checkbox"
              class="mr-2 leading-tight"
              type="checkbox"
            />
            <label for="rank0Checkbox" class="text-sm font-bold">Star Rank</label>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-3">
      <label class="block text-sm font-bold mb-2">Enemy Type</label>
      <div class="flex flex-wrap -mx-3">
        <div class="w-1/2 sm:w-full px-3 mb-6 md:mb-0" v-for="key in checkboxKeys" :key="key">
          <input
            :checked="filters[key]"
            @change="updateFilter($event, key)"
            :id="`${key}Checkbox`"
            class="mr-2 leading-tight"
            type="checkbox"
          />
          <label :for="`${key}Checkbox`" class="text-sm font-bold">
            {{ key.charAt(0).toUpperCase() + key.slice(1) }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  filters: any
}>()

const emit = defineEmits(['updateFilters'])

const checkboxKeys = ['ashkin', 'elemental', 'fauna', 'machine']

const updateRank = (evt: Event, index: number) => {
  const target = evt.target as HTMLInputElement
  const newRanks = [...props.filters.rank]
  newRanks[index] = target.checked
  emit('updateFilters', { ...props.filters, rank: newRanks })
}

const updateFilter = (evt: Event, key: string) => {
  const target = evt.target as HTMLInputElement
  emit('updateFilters', { ...props.filters, [key]: target.checked })
}
</script>
