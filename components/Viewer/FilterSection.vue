<template>
  <div class="mb-2">
    <div class="border-b border-gray-200 flex justify-start">
      <div>
        <input
          :checked="section.enabled"
          @change="updateEnabled"
          :id="viewInputId"
          type="checkbox"
          title="Show/Hide this section from the map"
          class="mr-2"
        />
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
      v-if="showExpanded && expanded"
      :is="filterComponent"
      :filters="section.filters"
      :jsonData="jsonData"
      @updateFilters="updateFilters"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Monsters from './SectionItems/Monsters.vue'
import Enemies from './SectionItems/Enemies.vue'
import CriticalEngagements from './SectionItems/CriticalEngagements.vue'
import Skirmishes from './SectionItems/Skirmishes.vue'

const props = defineProps<{
  section: any
  jsonData: any
}>()

const emit = defineEmits(['updateSection'])

const expanded = ref(true)

const showExpanded = computed(() => Object.keys(props.section.filters).length !== 0)

const filterComponent = computed(() => {
  switch (props.section.key) {
    case 'monsters':
      return Monsters
    case 'enemies':
      return Enemies
    case 'engagements':
      return CriticalEngagements
    case 'skirmishes':
      return Skirmishes
    default:
      return null
  }
})

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
