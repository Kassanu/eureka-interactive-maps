<template>
  <div class="mb-2">
    <div class="border-b border-gray-200 mb-1 flex justify-start">
      <div>
        <label class="font-bold mr-1">
          <slot name="header"></slot>
        </label>
      </div>
      <div class="ml-auto">
        <span @click="toggleExpanded">
          <font-awesome-icon :icon="caretIcon" class="cursor-pointer" />
        </span>
      </div>
    </div>
    <div v-show="expanded">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  startExpanded?: boolean
}>()

const expanded = ref(true)

onMounted(() => {
  expanded.value = props.startExpanded ?? true
})

const caretIcon = computed(() => (expanded.value ? 'caret-up' : 'caret-down'))

const toggleExpanded = () => {
  expanded.value = !expanded.value
}
</script>
