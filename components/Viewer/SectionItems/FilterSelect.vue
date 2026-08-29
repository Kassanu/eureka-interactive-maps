<template>
  <div>
    <label class="block text-sm font-bold mb-2" :title="title">{{ label }}</label>
    <div class="inline-block relative w-full">
      <select
        :value="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="">Any</option>
        <option v-for="option in options" :key="option" :value="option">
          {{ capitalize(option) }}
        </option>
      </select>
      <div class="pointer-events-none absolute flex items-center px-2 inset-y-0 right-0">
        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  label: string
  options: string[]
  title?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
</script>
