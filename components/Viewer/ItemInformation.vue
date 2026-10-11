<template>
  <div
    ref="container"
    class="itemInformation rounded overflow-hidden shadow-md absolute p-2 flex flex-col"
    :style="styles"
    @click.stop
  >
    <div class="flex items-center flex-shrink-0 border-b border-gray-600">
      <div class="itemInformationIcons mr-2 flex-shrink-0"><slot name="icon" /></div>
      <div class="mr-auto min-w-0 font-bold"><slot name="header" /></div>
      <font-awesome-icon icon="times" class="ml-2 flex-shrink-0 cursor-pointer" @click="$emit('closeItemInformation')" />
    </div>
    <div class="p-2 min-h-0 overflow-y-auto">
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePanelPlacement } from '~/composables/usePanelPlacement'

const props = defineProps<{
  position: { x: number; y: number }
}>()

defineEmits<{ (e: 'closeItemInformation'): void }>()

const container = ref<HTMLElement | null>(null)
const styles = usePanelPlacement(container, () => props.position)
</script>
