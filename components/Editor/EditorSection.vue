<template>
  <div class="w-full rounded">
    <div class="sectionHeader bg-white p-4 border-b border-gray-200 flex justify-between content-center sticky top-0 z-50">
      <input
        :checked="editor.isVisible(section.key)"
        type="checkbox"
        title="Show or hide this section on the map"
        @change="editor.setVisible(section.key, ($event.target as HTMLInputElement).checked)"
      >
      <div>
        <span class="font-bold mr-1">{{ section.definition.name }} ({{ matching.length }})</span>
        <button type="button" title="Add an item to this section" @click="editor.addTo(section)">
          <font-awesome-icon icon="plus" class="cursor-pointer" />
        </button>
      </div>
      <button type="button" @click="editor.toggleExpanded(section.key)">
        <font-awesome-icon :icon="editor.isExpanded(section.key) ? 'caret-up' : 'caret-down'" class="cursor-pointer" />
      </button>
    </div>

    <div v-if="editor.isExpanded(section.key) && matching.length" class="sectionBody p-4 bg-gray-100">
      <EditorItem
        v-for="item in matching"
        :id="item.id"
        :key="item.id"
        :section="section"
        :item="item"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EditorItem from '~/components/Editor/EditorItem.vue'
import { useEditor } from '~/composables/useZoneEditor'
import type { LoadedSection } from '~/zones'

const props = defineProps<{ section: LoadedSection }>()

const editor = useEditor()

// What the search leaves, which is not the same as what the map shows.
const matching = computed(() => props.section.items.filter(editor.matches))
</script>
