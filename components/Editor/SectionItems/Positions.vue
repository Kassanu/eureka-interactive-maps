<template>
  <div>
    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
      Position <span v-if="multiple" @click="$emit('addPosition')"><font-awesome-icon icon="plus" class="cursor-pointer" title="Add new position to this item" /></span>
    </label>
    <div v-for="(position, index) in cPositions" :key="index" class="flex flex-wrap -mx-3">
      <div class="w-full inline-flex w-full px-3 mb-6 md:mb-0">
        <input
          :value="formatedPosition(position)"
          @change="updatePosition($event, index)"
          class="px-2 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded-l text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
          :class="borderClass(index)"
          type="text"
          placeholder="(X, Y)"
        >
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 rounded-r">
          <font-awesome-icon @click="$emit('setItemPosition', index)" icon="plus" class="cursor-pointer" title="Update position" />
        </button>
        <button v-show="index > 0" @click="deletePosition(index)" class="bg-red-500 hover:bg-red-700 text-white font-bold px-2 ml-2 rounded">
          <font-awesome-icon icon="times" class="cursor-pointer" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  positions: any[] | Record<string, any>
  multiple?: boolean
}>()

const emit = defineEmits<{
  (e: 'updatePosition', positions: any[]): void
  (e: 'addPosition'): void
  (e: 'setItemPosition', index: number): void
}>()

const positionError = ref<boolean[]>([])

const cPositions = computed(() => {
  return Array.isArray(props.positions) ? props.positions : [props.positions]
})

const formatedPosition = (position: any) => {
  return `(${position.x}, ${position.y})`
}

const borderClass = (index: number) => {
  return {
    'border-gray-400': positionError.value[index] ? !positionError.value[index] : true,
    'border-red-400': positionError.value[index] ? !positionError.value[index] : false
  }
}

const updatePosition = (evt: Event, index: number) => {
  const coordRegex = /^\(?(\d+\.{0,1}\d{0,1}),\s{0,1}(\d+\.{0,1}\d{0,1})\)?/
  const matches = (evt.target as HTMLInputElement).value.match(coordRegex)
  if (matches) {
    positionError.value[index] = false
    const newPositions = [...cPositions.value]
    newPositions[index] = {
      x: matches[1].includes('.') ? parseFloat(matches[1]) : parseInt(matches[1]),
      y: matches[2].includes('.') ? parseFloat(matches[2]) : parseInt(matches[2]),
    }
    emit('updatePosition', newPositions)
  } else {
    positionError.value[index] = true
  }
}

const deletePosition = (index: number) => {
  emit('updatePosition', cPositions.value.slice(0, index).concat(cPositions.value.slice(index + 1)))
}
</script>
