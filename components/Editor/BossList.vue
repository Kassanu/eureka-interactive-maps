<template>
  <FormField :label="t('fields.bosses')">
    <template #actions>
      <button v-if="options.length" type="button" class="editor-button" :title="t('editor.addBoss')" @click="add">
        <font-awesome-icon icon="plus" />
      </button>
    </template>

    <div v-for="(boss, index) in bosses" :key="index">
      <div class="editor-row">
        <select v-model="boss.entity" class="editor-input" :title="t('fields.bossName')">
          <option v-for="option in options" :key="option.key" :value="option.key">
            {{ option.label(t) }}
          </option>
        </select>
        <button type="button" class="editor-button editor-remove" @click="bosses.splice(index, 1)">
          <font-awesome-icon icon="times" />
        </button>
      </div>
      <FormField v-if="'weakness' in boss && boss.weakness" :label="t('fields.bossWeakness')">
        <KeyChecks :keys="boss.weakness" :options="elements.options()" />
      </FormField>
    </div>
  </FormField>
</template>

<script setup lang="ts">
import FormField from '~/components/Editor/FormField.vue'
import KeyChecks from '~/components/Editor/KeyChecks.vue'
import { useTranslate } from '~/composables/useTranslate'
import { elements, type LookupOption } from '~/model/lookups'

interface Boss {
  entity: string
  weakness?: string[]
}

// `create` returns a boss in the shape the item's operation records, or nothing where the zone
// has no bosses to pick from.
const props = defineProps<{
  bosses: Boss[]
  options: readonly LookupOption<string>[]
  create: () => Boss | undefined
}>()

const t = useTranslate()

function add() {
  const boss = props.create()
  if (boss) props.bosses.push(boss)
}
</script>
