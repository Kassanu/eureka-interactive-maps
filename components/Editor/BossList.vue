<template>
  <FormField :label="t('fields.bosses')">
    <template #actions>
      <button type="button" class="editor-button" :title="t('editor.addBoss')" @click="add">
        <font-awesome-icon icon="plus" />
      </button>
    </template>

    <div v-for="(boss, index) in bosses" :key="index">
      <div class="editor-row">
        <input v-model="boss.name" class="editor-input" type="text" :title="t('fields.bossName')">
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
import { elements } from '~/model/lookups'

interface Boss {
  name: string
  weakness?: string[]
}

// `create` returns a boss in the shape the item's operation records.
const props = defineProps<{
  bosses: Boss[]
  create: () => Boss | undefined
}>()

const { t } = useI18n()

function add() {
  const boss = props.create()
  if (boss) props.bosses.push(boss)
}
</script>
