<template>
  <div
    ref="container"
    class="itemInformation bg-white rounded overflow-hidden shadow-md absolute p-2"
    :style="styles"
    @click.stop
  >
    <div class="flex items-center border-b border-gray-200">
      <div class="itemInformationIcons mr-2"><slot name="icon" /></div>
      <div class="mr-auto font-bold"><slot name="header" /></div>
      <font-awesome-icon icon="times" class="cursor-pointer" @click="$emit('closeItemInformation')" />
    </div>
    <div class="p-2">
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  position: { x: number; y: number }
}>()

defineEmits<{ (e: 'closeItemInformation'): void }>()

const container = ref<HTMLElement | null>(null)
const dimensions = ref({ width: 0, height: 0 })
const windowWidth = ref(window.innerWidth)

const onResize = () => { windowWidth.value = window.innerWidth }

onMounted(() => {
  if (container.value) {
    dimensions.value = {
      width: container.value.clientWidth,
      height: container.value.clientHeight
    }
  }
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

const top = computed(() => {
  if ((props.position.y + dimensions.value.height) > document.body.clientHeight) {
    return props.position.y - dimensions.value.height
  }
  return props.position.y
})

const left = computed(() => {
  if ((props.position.x + dimensions.value.width) > document.body.clientWidth) {
    return props.position.x - dimensions.value.width
  }
  return props.position.x
})

const styles = computed(() => {
  if (windowWidth.value < 640) {
    return 'top:5%;left:5%;'
  }
  return `top:${top.value}px;left:${left.value}px;`
})
</script>
