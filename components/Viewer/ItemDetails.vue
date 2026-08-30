<template>
  <div>
    <Field v-if="'level' in item" :label="level">{{ formatLevel(item.level) }}</Field>
    <Field v-if="'rank' in item" label="Rank">{{ item.rank === 'star' ? 'Star' : item.rank }}</Field>
    <Field v-if="'spellLevel' in item" label="Spell Level">{{ item.spellLevel }}</Field>
    <Field v-if="'element' in item" label="Element">{{ elements.label(item.element) }}</Field>

    <Field label="Coordinates" stacked>
      <div v-for="(point, index) in item.positions" :key="index">({{ point.x }}, {{ point.y }})</div>
    </Field>

    <Field v-if="'grade' in item" label="Grade">{{ grades.label(item.grade) }}</Field>
    <Field v-if="'direction' in item && item.direction" label="Direction">
      {{ directions.label(item.direction) }}
    </Field>
    <Field v-if="'aggro' in item" label="Aggro">{{ list(aggroTypes, item.aggro) }}</Field>
    <Field v-if="'spawnCondition' in item && item.spawnCondition" label="Spawns">
      {{ spawnConditions.label(item.spawnCondition) }}
    </Field>
    <Field v-if="'attack' in item" label="Attack">{{ attacks.label(item.attack) || 'Both' }}</Field>
    <Field v-if="'weakness' in item" label="Weakness">{{ weakness }}</Field>
    <Field v-if="'participants' in item" label="Participants">{{ item.participants }}</Field>
    <Field v-if="'weather' in item && item.weather" label="Weather">
      {{ weathers.label(item.weather) }}
    </Field>

    <template v-if="'boss' in item && item.boss">
      <Field label="Boss">{{ item.boss.name }}</Field>
      <Field v-if="'weakness' in item.boss && item.boss.weakness.length" label="Boss Weakness">
        {{ list(elements, item.boss.weakness) }}
      </Field>
    </template>

    <Field v-if="spawnsFate" label="Spawns FATE">{{ spawnsFate }}</Field>
    <Field v-if="spawnedBy" label="Spawned By">{{ spawnedBy }}</Field>
    <Field v-if="spawnPool" label="Spawns From">{{ spawnPool }}</Field>

    <Field v-if="'learnedFrom' in item" :label="learnedFromLabel">
      {{ describeRef(zone, item.learnedFrom) }}
    </Field>
    <Field v-if="'requires' in item && item.requires" label="Requires">
      {{ zone.byId.get(item.requires)?.name }}
    </Field>
    <Field v-if="'replaces' in item && item.replaces" label="Replaces">
      {{ zone.byId.get(item.replaces)?.name }}
    </Field>

    <template v-if="'mutation' in item && item.mutation">
      <Field v-if="item.mutation.element" label="Mutated Element">
        {{ elements.label(item.mutation.element) }}
      </Field>
      <Field label="Mutation Conditions" stacked>
        <Conditions :conditions="item.mutation.conditions" />
      </Field>
    </template>
    <Field v-if="'adaptation' in item && item.adaptation" label="Adaptation Conditions" stacked>
      <Conditions :conditions="item.adaptation.conditions" />
    </Field>

    <Field v-if="'drops' in item && item.drops.length" label="Drops" stacked>
      <div v-for="(drop, index) in item.drops" :key="index">
        {{ dropItems.label(drop.item) }} ({{ drop.amount }})<span v-if="drop.percent != null">
          {{ drop.percent }}%</span>
      </div>
    </Field>

    <Field v-if="'spawns' in item && item.spawns.length" label="Spawn Conditions" stacked>
      <div v-for="(spawn, index) in item.spawns" :key="index">{{ describeSpawn(zone, spawn) }}</div>
    </Field>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Conditions from '~/components/Viewer/Conditions.vue'
import Field from '~/components/Viewer/Field.vue'
import { dropItems } from '~/model/lookups/drops'
import {
  aggroTypes,
  attacks,
  directions,
  elements,
  grades,
  spawnConditions,
  weathers,
  type Lookup,
} from '~/model/lookups'
import { formatLevel } from '~/model/primitives'
import { describeRef, describeSpawn, operations, type LoadedZone, type ZoneItem } from '~/zones'

// Every row the panel can draw, in the order it draws them. Which rows appear follows from the
// item's own type: `in` narrows to the members declaring the field, so a row cannot read one an
// item does not have.
const props = defineProps<{
  item: ZoneItem
  zone: LoadedZone
}>()

// An empty list is no aggro and no weakness rather than an unrecorded one, so it reads as None.
function list<K extends string>(lookup: Lookup<K>, keys: readonly K[]): string {
  return keys.map(key => lookup.label(key)).join(', ') || 'None'
}

const level = computed(() => operations[props.zone.definition.operation].levelLabel)

// Bozja grades an enemy by one attack type it is weak to; the Occult zones list elements.
const weakness = computed(() => {
  const value = 'weakness' in props.item ? props.item.weakness : ''
  return Array.isArray(value) ? list(elements, value) : attacks.label(value) || 'None'
})

const spawnsFate = computed(() =>
  'spawnsFate' in props.item ? describeRef(props.zone, props.item.spawnsFate) : ''
)

const spawnedBy = computed(() =>
  props.zone.spawnersOf(props.item.id)
    .map(item => describeRef(props.zone, item.id))
    .filter(Boolean)
    .join(', ')
)

// A pot appears during one FATE, or comes from the bonus roll after opening a coffer.
const spawnPool = computed(() => {
  if (!('source' in props.item)) return ''
  return props.item.source.type === 'bonus'
    ? 'Bonus Roll'
    : describeRef(props.zone, props.item.source.fateId)
})

// A spell is taught by an enemy or by a critical encounter, and the section holding the teacher
// says which.
const learnedFromLabel = computed(() => {
  const teacher = 'learnedFrom' in props.item
    ? props.zone.sectionOf.get(props.item.learnedFrom)
    : undefined
  return teacher?.definition.type === 'event' ? 'Critical Encounter' : 'Learned From'
})
</script>
