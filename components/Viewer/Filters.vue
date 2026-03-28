<template>
  <div id="filters" class="flex">
    <div
      v-show="expanded"
      @click.stop
      id="filtersCard"
      class="relative overflow-auto rounded px-8 pt-6 pb-8 mb-4 text-gray-200"
    >
      <div @click="$emit('resetFilters')" class="absolute top-0 right-0 cursor-pointer">
        Reset
      </div>
      <form>
        <div class="mb-2" v-if="hasLevelRange">
          <label class="block text-sm font-bold mb-2">Level Range</label>
          <div class="flex flex-wrap -mx-3">
            <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <input
                :value="filters.level.from"
                @change="updateLevelRange($event, 'from')"
                class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="From"
              />
            </div>
            <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <input
                :value="filters.level.to"
                @change="updateLevelRange($event, 'to')"
                class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="To"
              />
            </div>
          </div>
        </div>

        <div class="mb-2" v-if="hasElement">
          <label class="block text-sm font-bold mb-2">Element</label>
          <div class="inline-block relative w-full">
            <select
              :value="filters.element"
              @change="updateFilters($event, 'element')"
              class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Any</option>
              <option value="fire">Fire</option>
              <option value="earth">Earth</option>
              <option value="lightning">Lightning</option>
              <option value="water">Water</option>
              <option value="wind">Wind</option>
              <option value="ice">Ice</option>
            </select>
            <div
              class="pointer-events-none absolute flex items-center px-2 inset-y-0 right-0"
            >
              <svg
                class="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="mb-2" v-if="hasDrops">
          <label class="block text-sm font-bold mb-2">Drops</label>
          <div class="inline-block relative w-full">
            <select
              :value="filters.drops.value"
              @change="updateDrops"
              class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Any</option>
              <option
                v-for="option in filters.drops.options"
                :key="option.id"
                :value="option.name"
              >
                {{ option.name }}
              </option>
            </select>
            <div
              class="pointer-events-none absolute flex items-center px-2 inset-y-0 right-0"
            >
              <svg
                class="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        <FilterSection
          v-for="(section, index) in filters.sections"
          :key="index"
          :section="section"
          :jsonData="jsonData"
          @updateSection="updateSection(index, ...arguments)"
        />
      </form>
    </div>

    <div class="filterExpander relative">
      <div>
        <div
          @click="expanded = !expanded"
          class="cursor-pointer w-full h-full flex justify-center items-center"
        >
          <font-awesome-icon :icon="expandFiltersIcon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FilterSection from './FilterSection.vue'

const props = defineProps<{
  filters: any
  jsonData: any
}>()

const emit = defineEmits(['updateFilters', 'resetFilters'])

const expanded = ref(true)
const windowWidth = ref(window.innerWidth)

const onResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

const expandFiltersIcon = computed(() => {
  if (windowWidth.value < 640) {
    return expanded.value ? 'caret-up' : 'caret-down'
  } else {
    return expanded.value ? 'caret-left' : 'caret-right'
  }
})

const hasLevelRange = computed(() => 'level' in props.filters)
const hasElement = computed(() => 'element' in props.filters)
const hasDrops = computed(() => 'drops' in props.filters)

const updateLevelRange = (event: Event, key: string) => {
  const target = event.target as HTMLInputElement
  emit('updateFilters', {
    ...props.filters,
    level: {
      ...props.filters.level,
      [key]: parseInt(target.value)
    }
  })
}

const updateFilters = (event: Event, key: string) => {
  const target = event.target as HTMLSelectElement
  emit('updateFilters', {
    ...props.filters,
    [key]: target.value
  })
}

const updateDrops = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('updateFilters', {
    ...props.filters,
    drops: {
      ...props.filters.drops,
      value: target.value
    }
  })
}

const updateSection = (key: number, section: any) => {
  emit('updateFilters', {
    ...props.filters,
    sections: {
      ...props.filters.sections,
      [key]: section
    }
  })
}
</script>
