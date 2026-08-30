<template>
  <SectionItem
    :item="item"
    :section-key="sectionKey"
    :json-data-show="jsonDataShow"
    @update-item-show-data="(id, key, val) => emit('updateItemShowData', id, key, val)"
    @update-all-item-show-data="(skey, key, val) => emit('updateAllItemShowData', skey, key, val)"
    @delete-item="(skey, id) => emit('deleteItem', skey, id)"
  >
    <form @submit.prevent>
      <div class="flex flex-wrap -mx-3 mb-2">
        <div class="w-full w-full px-3">
          <label :class="labelClass">ID</label>
          <input :value="item.id" :class="fieldClass" type="text" readonly>
        </div>
        <div class="w-full w-full px-3">
          <label :class="labelClass">Name</label>
          <input :value="item.name" :class="fieldClass" type="text" @change="updateName">
        </div>
      </div>
      <div v-show="expanded">
        <div class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full md:w-1/2 px-3">
            <label :class="labelClass">Icon Slug</label>
            <input :value="item.slug" :class="fieldClass" type="text" @change="updateField('slug', $event)">
          </div>
          <div class="w-full md:w-1/2 px-3">
            <label :class="labelClass">Spell Level</label>
            <input :value="item.spellLevel" :class="fieldClass" type="number" @change="updateNumber('spellLevel', $event)">
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full md:w-1/2 px-3">
            <label :class="labelClass">Taught By</label>
            <select :value="sourceValue" :class="fieldClass" @change="updateSource">
              <option value="">None</option>
              <optgroup v-for="group in sourceGroups" :key="group.key" :label="group.label">
                <option v-for="entry in group.items" :key="entry.id" :value="`${group.key}:${entry.id}`">
                  {{ entry.name }}
                </option>
              </optgroup>
            </select>
          </div>
          <div class="w-full md:w-1/2 px-3">
            <label :class="labelClass">Replaces</label>
            <input :value="item.replaces" :class="fieldClass" type="text" @change="updateField('replaces', $event)">
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full md:w-1/2 px-3">
            <label :class="labelClass">Requires Level</label>
            <input :value="item.requires.spellLevel" :class="fieldClass" type="number" @change="updateRequires('spellLevel', $event, true)">
          </div>
          <div class="w-full md:w-1/2 px-3">
            <label :class="labelClass">Requires Spell</label>
            <input :value="item.requires.spell" :class="fieldClass" type="text" @change="updateRequires('spell', $event, false)">
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-2">
          <Positions
            :positions="item.position"
            :multiple="Array.isArray(item.position)"
            class="w-full w-full px-3"
            @update-position="updatePosition"
            @add-position="addPosition"
            @set-item-position="setItemPosition"
          />
        </div>
      </div>
    </form>
  </SectionItem>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SectionItem from './SectionItem.vue'
import Positions from './Positions.vue'
import { useSectionItemFields } from '~/composables/useSectionItemFields'

const props = defineProps<{
  item: any
  sectionKey: string
  jsonDataShow: Record<string, any>
  jsonData?: any
}>()

const emit = defineEmits<{
  (e: 'updateItem', sectionKey: string, item: any): void
  (e: 'setItemPosition', data: any): void
  (e: 'updateItemShowData', itemId: string, showKey: string, value: any): void
  (e: 'updateAllItemShowData', sectionKey: string, showKey: string, value: any): void
  (e: 'deleteItem', sectionKey: string, itemId: string): void
}>()

const labelClass = 'block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'
const fieldClass = 'px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full'

const expanded = computed(() => {
  if (Object.prototype.hasOwnProperty.call(props.jsonDataShow, props.item.id) &&
      Object.prototype.hasOwnProperty.call(props.jsonDataShow[props.item.id], 'expanded')) {
    return props.jsonDataShow[props.item.id].expanded
  }
  return true
})

const { updateName, updatePosition, addPosition, setItemPosition } =
  useSectionItemFields(props, emit)

const sourceGroups = computed(() => (
  [
    { key: 'enemies', label: 'Enemies' },
    { key: 'critical_encounters', label: 'Critical Encounters' },
  ]
    .map(group => ({ ...group, items: props.jsonData?.[group.key]?.items ?? [] }))
    .filter(group => group.items.length)
))

// The select carries section and id together so one change sets both.
const sourceValue = computed(() => (
  props.item.source?.id ? `${props.item.source.section}:${props.item.source.id}` : ''
))

const emitItem = (patch: any) => emit('updateItem', props.sectionKey, { ...props.item, ...patch })

const updateField = (key: string, evt: Event) =>
  emitItem({ [key]: (evt.target as HTMLInputElement).value })

const updateNumber = (key: string, evt: Event) =>
  emitItem({ [key]: parseInt((evt.target as HTMLInputElement).value) || 0 })

const updateRequires = (key: string, evt: Event, numeric: boolean) => {
  const raw = (evt.target as HTMLInputElement).value
  emitItem({ requires: { ...props.item.requires, [key]: numeric ? parseInt(raw) || 0 : raw } })
}

const updateSource = (evt: Event) => {
  const value = (evt.target as HTMLSelectElement).value
  if (!value) {
    emitItem({ source: { section: '', id: '', name: '' } })
    return
  }
  const [section, id] = value.split(':')
  const found = (props.jsonData?.[section]?.items ?? []).find((entry: any) => entry.id === id)
  emitItem({ source: { section, id, name: found?.name ?? '' } })
}
</script>
