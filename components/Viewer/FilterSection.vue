<template>
  <div class="mb-2">
    <div class="border-b border-gray-200 flex justify-start">
      <div>
        <input
          :id="viewInputId"
          :checked="section.enabled"
          type="checkbox"
          title="Show/Hide this section from the map"
          class="mr-2"
          @change="updateEnabled"
        >
      </div>
      <div>
        <label class="font-bold mr-1" :for="viewInputId">{{ section.name }}</label>
      </div>
      <div v-if="showExpanded" class="ml-auto">
        <span v-show="expanded" @click="toggleExpanded">
          <font-awesome-icon icon="caret-up" class="cursor-pointer" />
        </span>
        <span v-show="!expanded" @click="toggleExpanded">
          <font-awesome-icon icon="caret-down" class="cursor-pointer" />
        </span>
      </div>
    </div>

    <component
      :is="filterComponent"
      v-if="showExpanded && expanded"
      :filters="section.filters"
      :json-data="jsonData"
      :section-key="section.key"
      @update-filters="updateFilters"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getFilterComponent } from '~/composables/useSectionRegistry'

const props = defineProps<{
  section: any
  jsonData: any
}>()

const emit = defineEmits(['updateSection'])

const expanded = ref(true)

const showExpanded = computed(() => Object.keys(props.section.filters).length !== 0)

const filterComponent = computed(() =>
  getFilterComponent(props.jsonData[props.section.key]?.type)
)

const viewInputId = computed(() => `showhidecheckbox-${props.section.key}`)

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const updateEnabled = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('updateSection', { ...props.section, enabled: target.checked })
}

const updateFilters = (filters: any) => {
  emit('updateSection', { ...props.section, filters })
}
</script>
