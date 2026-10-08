<template>
  <div>
    <Field v-if="'level' in item" :label="level">{{ formatLevel(item.level, t) }}</Field>
    <Field v-if="'rank' in item" :label="t('fields.rank')">
      {{ ranks.label(item.rank, t) }}
    </Field>
    <Field v-if="'spellLevel' in item" :label="t('fields.spellLevel')">{{ item.spellLevel }}</Field>
    <Field v-if="'element' in item" :label="t('fields.element')">
      {{ elements.label(item.element, t) }}
    </Field>

    <Field :label="t('fields.coordinates')" stacked>
      <div v-for="(point, index) in item.positions" :key="index">({{ point.x }}, {{ point.y }})</div>
    </Field>

    <Field v-if="'grade' in item" :label="t('fields.grade')">{{ grades.label(item.grade, t) }}</Field>
    <Field v-if="'direction' in item && item.direction" :label="t('fields.direction')">
      {{ directions.label(item.direction, t) }}
    </Field>
    <Field v-if="'aggro' in item" :label="t('fields.aggro')">
      {{ list(aggroTypes, item.aggro) }}
    </Field>
    <Field v-if="'spawnCondition' in item && item.spawnCondition" :label="t('fields.spawnsUnder')">
      {{ spawnConditions.label(item.spawnCondition, t) }}
    </Field>
    <Field v-if="'attack' in item" :label="t('fields.attack')">
      {{ attacks.label(item.attack, t) || t('values.both') }}
    </Field>
    <Field v-if="'weakness' in item" :label="t('fields.weakness')">{{ weakness }}</Field>
    <Field v-if="'participants' in item" :label="t('fields.participants')">
      {{ item.participants }}
    </Field>
    <Field v-if="'weather' in item && item.weather" :label="t('fields.weather')">
      {{ weatherTypes.label(item.weather, t) }}
    </Field>

    <template v-for="(boss, index) in bosses" :key="index">
      <Field :label="t('fields.boss')">{{ boss.name }}</Field>
      <Field v-if="boss.weakness?.length" :label="t('fields.bossWeakness')">
        {{ list(elements, boss.weakness) }}
      </Field>
    </template>

    <Field v-if="spawnsFate" :label="t('fields.spawnsFate')">{{ spawnsFate }}</Field>
    <Field v-if="spawnedBy" :label="t('fields.spawnedBy')">{{ spawnedBy }}</Field>
    <Field v-if="spawnPool" :label="t('fields.spawnsFrom')">{{ spawnPool }}</Field>

    <Field v-if="'learnedFrom' in item" :label="learnedFromLabel">
      {{ describeRef(zone, item.learnedFrom, t) }}
    </Field>
    <Field v-if="'requires' in item && item.requires" :label="t('fields.requires')">
      {{ labelOfId(item.requires) }}
    </Field>
    <Field v-if="'replaces' in item && item.replaces" :label="t('fields.replaces')">
      {{ labelOfId(item.replaces) }}
    </Field>

    <template v-if="'mutation' in item && item.mutation">
      <Field v-if="item.mutation.element" :label="t('fields.mutatedElement')">
        {{ elements.label(item.mutation.element, t) }}
      </Field>
      <Field :label="t('fields.mutationConditions')" stacked>
        <Conditions :conditions="item.mutation.conditions" />
      </Field>
    </template>
    <Field
      v-if="'adaptation' in item && item.adaptation"
      :label="t('fields.adaptationConditions')"
      stacked
    >
      <Conditions :conditions="item.adaptation.conditions" />
    </Field>

    <Field v-if="'drops' in item && item.drops.length" :label="t('fields.drops')" stacked>
      <div v-for="(drop, index) in item.drops" :key="index">
        {{ dropItems.label(drop.item, t) }} ({{ drop.amount }})<span v-if="drop.percent != null">
          {{ drop.percent }}%</span>
      </div>
    </Field>

    <Field v-if="'spawns' in item && item.spawns.length" :label="t('fields.spawnConditions')" stacked>
      <div v-for="(spawn, index) in item.spawns" :key="index">
        {{ describeSpawn(zone, spawn, t) }}
      </div>
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
  ranks,
  spawnConditions,
  weatherTypes,
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

const { t } = useI18n()

// An empty list is no aggro and no weakness rather than an unrecorded one, so it reads as None.
function list<K extends string>(lookup: Lookup<K>, keys: readonly K[]): string {
  return keys.map(key => lookup.label(key, t)).join(', ') || t('values.none')
}

const level = computed(() => operations[props.zone.definition.operation].levelLabel(t))

type Element = (typeof elements.keys)[number]

const bosses = computed(() =>
  ('bosses' in props.item ? props.item.bosses : []) as { name: string; weakness?: Element[] }[]
)

function labelOfId(id: string): string {
  const target = props.zone.byId.get(id)
  return target ? props.zone.labelOf(target)(t) : ''
}

// Bozja grades an enemy by one attack type it is weak to; the Occult zones list elements.
const weakness = computed(() => {
  const value = 'weakness' in props.item ? props.item.weakness : ''
  return Array.isArray(value) ? list(elements, value) : attacks.label(value, t) || t('values.none')
})

const spawnsFate = computed(() =>
  'spawnsFate' in props.item ? describeRef(props.zone, props.item.spawnsFate, t) : ''
)

const spawnedBy = computed(() =>
  props.zone.spawnersOf(props.item.id)
    .map(item => describeRef(props.zone, item.id, t))
    .filter(Boolean)
    .join(', ')
)

// A pot appears during one FATE, or comes from the bonus roll after opening a coffer.
const spawnPool = computed(() => {
  if (!('source' in props.item)) return ''
  return props.item.source.type === 'bonus'
    ? t('values.bonusRoll')
    : describeRef(props.zone, props.item.source.fateId, t)
})

// A spell is taught by an enemy or by a critical encounter, and the section holding the teacher
// says which.
const learnedFromLabel = computed(() => {
  const teacher = 'learnedFrom' in props.item
    ? props.zone.sectionOf.get(props.item.learnedFrom)
    : undefined
  return teacher?.definition.type === 'event'
    ? t('fields.criticalEncounter')
    : t('fields.learnedFrom')
})
</script>
