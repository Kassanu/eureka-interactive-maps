<template>
  <div class="w-full rounded">
    <div class="sectionHeader bg-white p-4 border-b border-gray-200 sticky top-0 z-50">
      <div class="flex justify-between content-center">
        <input
          :checked="editor.isVisible(section.key)"
          type="checkbox"
          :title="t('editor.toggleSection')"
          @change="editor.setVisible(section.key, ($event.target as HTMLInputElement).checked)"
        >
        <div>
          <span class="font-bold mr-1">{{ section.definition.name(t) }} ({{ matching.length }})</span>
          <button v-if="!entities || entityOptions.length" type="button" :title="t('editor.addItem')" @click="add">
            <font-awesome-icon icon="plus" class="cursor-pointer" />
          </button>
        </div>
        <button type="button" @click="editor.toggleExpanded(section.key)">
          <font-awesome-icon :icon="editor.isExpanded(section.key) ? 'caret-up' : 'caret-down'" class="cursor-pointer" />
        </button>
      </div>

      <select v-if="picking" class="editor-input mt-2" @change="pick">
        <option value="" disabled selected>{{ t('editor.pickEntity') }}</option>
        <option v-for="option in entityOptions" :key="option.key" :value="option.key">
          {{ option.label(t) }}
        </option>
      </select>
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
import { computed, ref } from 'vue'
import EditorItem from '~/components/Editor/EditorItem.vue'
import { useTranslate } from '~/composables/useTranslate'
import { useEditor } from '~/composables/useZoneEditor'
import { takesEntity, type LoadedSection } from '~/zones'

const props = defineProps<{ section: LoadedSection }>()

const t = useTranslate()
const editor = useEditor()

// What the search leaves, which is not the same as what the map shows.
const matching = computed(() => props.section.items.filter(item => editor.matches(item, t)))

const entities = computed(() => takesEntity(props.section.definition))
const entityOptions = computed(() => editor.zone.value?.entities.get(props.section.key)?.options() ?? [])
const picking = ref(false)

function add() {
  if (entities.value) picking.value = !picking.value
  else editor.addTo(props.section)
}

function pick(event: Event) {
  editor.addTo(props.section, (event.target as HTMLSelectElement).value)
  picking.value = false
}
</script>
