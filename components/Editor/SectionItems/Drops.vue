<template>
  <div>
    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
      Drops <span @click="$emit('addDrop')"><font-awesome-icon icon="plus" class="cursor-pointer" title="Add new drop" /></span>
    </label>
    <div v-for="(drop, index) in drops" :key="index" class="flex flex-wrap -mx-3">
      <div class="w-full inline-flex w-full px-3 mb-6 md:mb-0">
        <input
          :value="drop.name"
          @change="updateName($event, index)"
          class="px-2 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded-l text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
          type="text"
        >
        <input
          :value="drop.amount"
          @change="updateAmount($event, index)"
          class="px-2 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded-l text-sm border outline-none focus:outline-none focus:shadow-outline"
          type="number"
        >
        <input
          :value="drop.percent"
          @change="updatePercent($event, index)"
          class="px-2 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded-l text-sm border outline-none focus:outline-none focus:shadow-outline"
          type="number"
        >
        <button @click="deleteDrop(index)" class="bg-red-500 hover:bg-red-700 text-white font-bold px-2 ml-2 rounded">
          <font-awesome-icon icon="times" class="cursor-pointer" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  drops: Array<{ name: string; amount: number; percent: number }>
}>()

const emit = defineEmits<{
  (e: 'updateDrops', drops: any[]): void
  (e: 'addDrop'): void
}>()

const updateName = (evt: Event, index: number) => {
  updateDrops(index, 'name', (evt.target as HTMLInputElement).value)
}

const updateAmount = (evt: Event, index: number) => {
  updateDrops(index, 'amount', parseInt((evt.target as HTMLInputElement).value))
}

const updatePercent = (evt: Event, index: number) => {
  updateDrops(index, 'percent', parseInt((evt.target as HTMLInputElement).value))
}

const updateDrops = (index: number, key: string, value: any) => {
  const newDrops = [...props.drops]
  newDrops[index] = { ...newDrops[index], [key]: value }
  emit('updateDrops', newDrops)
}

const deleteDrop = (index: number) => {
  emit('updateDrops', props.drops.slice(0, index).concat(props.drops.slice(index + 1)))
}
</script>
