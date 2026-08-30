<template>
  <div class="relative rounded overflow-hidden shadow-md bg-white mb-4 px-4 pb-4">
    <div class="mb-2 py-1 flex items-center gap-2 border border-gray-100">
      <input
        :checked="editor.isVisible(item.id)"
        type="checkbox"
        title="Show or hide on the map. Hold Alt to set every item in this section."
        @click="setVisible"
      >
      <button type="button" title="Delete this item" @click="remove">
        <font-awesome-icon icon="times" class="cursor-pointer" />
      </button>
      <span class="text-sm text-gray-600 truncate">{{ item.name || item.id }}</span>
      <button type="button" class="ml-auto" @click="editor.toggleExpanded(item.id)">
        <font-awesome-icon :icon="editor.isExpanded(item.id) ? 'caret-up' : 'caret-down'" class="cursor-pointer" />
      </button>
    </div>

    <div v-if="editor.isExpanded(item.id)" class="w-full">
      <ItemForm :item="item" :section="section" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ItemForm from '~/components/Editor/ItemForm.vue'
import { useEditor } from '~/composables/useZoneEditor'
import type { LoadedSection, ZoneItem } from '~/zones'

const props = defineProps<{
  section: LoadedSection
  item: ZoneItem
}>()

const editor = useEditor()

// Holding Alt sets every item in the section to what this one was just set to, which is how a
// section of eighty coffers is cleared off the map in one click.
function setVisible(event: MouseEvent) {
  const on = (event.target as HTMLInputElement).checked
  const ids = event.altKey ? props.section.items.map(item => item.id) : [props.item.id]
  for (const id of ids) editor.setVisible(id, on)
}

function remove() {
  if (confirm('You will be unable to recover this item after deleting. Are you sure?')) {
    editor.removeItem(props.section.key, props.item)
  }
}
</script>
