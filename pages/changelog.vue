<template>
  <div id="changelog" class="base-page flex flex-col flex-grow">
    <div class="flex-grow flex justify-center">
      <div class="flex flex-col w-full max-w-2xl px-4 py-8">
        <h1 class="text-2xl text-white mb-6">Changelog</h1>
        <div
          v-for="entry in entries"
          :key="entry.version"
          class="mb-6 border-l-2 border-gray-500 pl-4"
        >
          <div class="flex items-baseline gap-3 mb-1">
            <span class="text-white font-bold">{{ entry.version }}</span>
            <span class="text-gray-400 text-sm">{{ entry.date }}</span>
          </div>
          <p class="text-gray-200">{{ entry.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import entries from '~/assets/changelog.json'
</script>
