<template>
  <div>
    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
      Icon
    </label>
    <div class="relative">
      <select
        :value="icon"
        @change="updateIcon"
        class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
      >
        <option value='' disabled></option>
        <option v-for="iconOption in icons" :key="iconOption.value" :value="iconOption.value">{{ iconOption.name }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon: string
  icons: Array<{ value: string; name: string }>
}>()

const emit = defineEmits<{
  (e: 'updateIcon', icon: string): void
}>()

const updateIcon = (evt: Event) => {
  emit('updateIcon', (evt.target as HTMLSelectElement).value)
}
</script>
