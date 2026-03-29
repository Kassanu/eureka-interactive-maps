<template>
  <div>
    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
      Spawn Conditions <span @click="$emit('addSpawn')"><font-awesome-icon icon="plus" class="cursor-pointer" title="Add new spawn to this item" /></span>
    </label>
    <div v-for="(spawn, index) in spawns" :key="index" class="flex flex-wrap -mx-3">
      <div class="w-full inline-flex w-full px-3 mb-6 md:mb-0">
        <select
          :value="spawn.type"
          @change="updateType($event, index)"
          class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline mr-2"
        >
          <option value='enemy'>Enemy</option>
          <option value='skirmish'>Skirmish</option>
          <option value='time'>Time</option>
        </select>
        <input
          :value="spawn.value"
          @change="updateValue($event, index)"
          class="px-2 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded-l text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
          type="text"
          :placeholder="valuePlaceholder(index)"
          :title="valueTitle(index)"
        >
        <button @click="deleteSpawn(index)" class="bg-red-500 hover:bg-red-700 text-white font-bold px-2 ml-2 rounded">
          <font-awesome-icon icon="times" class="cursor-pointer" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  spawns: Array<{ type: string; value: string }>
}>()

const emit = defineEmits<{
  (e: 'updateSpawns', spawns: any[]): void
  (e: 'addSpawn'): void
}>()

const valuePlaceholder = (index: number) => {
  switch (props.spawns[index].type) {
    case 'enemy': return 'Enter Enemy ID'
    case 'skirmish': return 'Enter Skirmish ID'
    case 'time': return 'Enter time in SECONDS'
    default: return ''
  }
}

const valueTitle = (index: number) => {
  switch (props.spawns[index].type) {
    case 'enemy': return 'Enter Enemy ID'
    case 'skirmish': return 'Enter Skirmish ID'
    case 'time': return 'Enter time in SECONDS'
    default: return ''
  }
}

const updateType = (evt: Event, index: number) => {
  const newSpawns = props.spawns.map(s => ({ ...s }))
  newSpawns[index] = { ...newSpawns[index], type: (evt.target as HTMLSelectElement).value, value: '' }
  emit('updateSpawns', newSpawns)
}

const updateValue = (evt: Event, index: number) => {
  const newSpawns = props.spawns.map(s => ({ ...s }))
  newSpawns[index] = { ...newSpawns[index], value: (evt.target as HTMLInputElement).value }
  emit('updateSpawns', newSpawns)
}

const deleteSpawn = (index: number) => {
  emit('updateSpawns', props.spawns.slice(0, index).concat(props.spawns.slice(index + 1)))
}
</script>
