<template>
  <div id="editorContainer" class="flex flex-col">
    <div class="flex justify-end mt-1 mb-2 px-2">
      <input
        v-model="editor.search.value"
        placeholder="Search by Name or ID"
        class="px-2 py-1 mr-2 placeholder-gray-400 text-gray-700 relative bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
        type="text"
      >
      <button
        type="button"
        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        @click="editor.save"
      >
        Save
      </button>
    </div>

    <!-- A save writes nothing while an item would not load back, so what is wrong is named here
         rather than discovered when the file is opened again. -->
    <div
      v-if="editor.saveIssues.value.length"
      class="mx-2 mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm"
    >
      <div class="font-bold mb-1">
        Not saved: {{ editor.saveIssues.value.length }} items would not load back.
      </div>
      <div v-for="issue in editor.saveIssues.value" :key="issue.itemId">
        {{ issue.section }}: {{ issue.name || issue.itemId }} - {{ issue.message }}
      </div>
    </div>

    <!-- What the file held that this build cannot read. -->
    <div
      v-if="editor.loadIssues.value.length"
      class="mx-2 mb-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-sm"
    >
      <div class="font-bold mb-1">
        {{ editor.loadIssues.value.length }} problems reading this file.
      </div>
      <div v-for="(issue, index) in editor.loadIssues.value" :key="index">
        {{ issue.section ?? 'file' }}{{ issue.index === undefined ? '' : `[${issue.index}]` }}:
        {{ issue.message }}
      </div>
    </div>

    <div id="mapDataList" class="flex-grow overflow-y-scroll relative">
      <EditorSection
        v-for="section in zone.sections"
        :key="section.key"
        :section="section"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import EditorSection from '~/components/Editor/EditorSection.vue'
import { useEditor } from '~/composables/useZoneEditor'
import type { LoadedZone } from '~/zones'

defineProps<{ zone: LoadedZone }>()

const editor = useEditor()
</script>
