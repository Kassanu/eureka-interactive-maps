<template>
  <form @submit.prevent>
    <FormField label="ID">
      <input :value="item.id" class="editor-input" type="text" readonly>
    </FormField>

    <FormField v-if="'name' in shape" label="Name">
      <input :value="item.name ?? ''" class="editor-input" type="text" @change="rename">
    </FormField>

    <div class="editor-columns">
      <FormField v-if="'level' in item" :label="level">
        <div class="editor-row">
          <input v-model.number="item.level.from" type="number" min="1" class="editor-input">
          <span class="text-xs">to</span>
          <input v-model.number="item.level.to" type="number" min="1" class="editor-input">
        </div>
      </FormField>

      <FormField v-if="'rank' in item" label="Rank">
        <select v-model="item.rank" class="editor-input">
          <option v-for="option in ranks.options()" :key="option.key" :value="option.key">
            {{ option.label }}
          </option>
        </select>
      </FormField>

      <FormField v-if="'spellLevel' in item" label="Spell Level">
        <input v-model.number="item.spellLevel" type="number" min="1" class="editor-input">
      </FormField>

      <FormField v-if="'element' in item" label="Element">
        <select v-model="item.element" class="editor-input">
          <option v-for="option in elements.options()" :key="option.key" :value="option.key">
            {{ option.label }}
          </option>
        </select>
      </FormField>

      <FormField v-if="'grade' in item" label="Grade">
        <select v-model="item.grade" class="editor-input">
          <option v-for="option in grades.options()" :key="option.key" :value="option.key">
            {{ option.label }}
          </option>
        </select>
      </FormField>

      <FormField v-if="'participants' in item" label="Participants">
        <input v-model.number="item.participants" type="number" min="1" class="editor-input">
      </FormField>

      <FormField v-if="'weather' in item" label="Weather">
        <select v-model="item.weather" class="editor-input">
          <option value="">Any</option>
          <option v-for="option in weathers.options()" :key="option.key" :value="option.key">
            {{ option.label }}
          </option>
        </select>
      </FormField>

      <FormField v-if="'spawnCondition' in item" label="Spawns Under">
        <select v-model="item.spawnCondition" class="editor-input">
          <option value="">Always</option>
          <option v-for="option in spawnConditions.options()" :key="option.key" :value="option.key">
            {{ option.label }}
          </option>
        </select>
      </FormField>

      <FormField v-if="'direction' in item" label="Faces">
        <select v-model="item.direction" class="editor-input">
          <option value="">Unknown</option>
          <option v-for="option in directions.options()" :key="option.key" :value="option.key">
            {{ option.label }}
          </option>
        </select>
      </FormField>

      <FormField v-if="'attack' in item" label="Attack">
        <select v-model="item.attack" class="editor-input">
          <option value="">Both</option>
          <option v-for="option in attacks.options()" :key="option.key" :value="option.key">
            {{ option.label }}
          </option>
        </select>
      </FormField>

      <FormField v-if="'weakness' in item && !Array.isArray(item.weakness)" label="Weakness">
        <select v-model="item.weakness" class="editor-input">
          <option value="">None</option>
          <option v-for="option in attacks.options()" :key="option.key" :value="option.key">
            {{ option.label }}
          </option>
        </select>
      </FormField>

      <FormField v-if="'icon' in shape" label="Icon">
        <select :value="item.icon ?? ''" class="editor-input" @change="setIcon">
          <option v-if="iconOptional" value="">Default</option>
          <option v-for="key in iconKeys" :key="key" :value="key">{{ key }}</option>
        </select>
      </FormField>
    </div>

    <PositionList :item="item" />

    <FormField v-if="'aggro' in item" label="Aggro">
      <KeyChecks :keys="item.aggro" :options="aggroTypes.options()" />
    </FormField>

    <FormField v-if="'family' in item" label="Family">
      <KeyChecks :keys="item.family" :options="mobFamilies.options()" />
    </FormField>

    <FormField v-if="'weakness' in item && Array.isArray(item.weakness)" label="Weakness">
      <KeyChecks :keys="item.weakness" :options="elements.options()" />
    </FormField>

    <FormField v-if="'spawnsFate' in item" label="Spawns FATE">
      <ItemPicker v-model="item.spawnsFate" :zone="zone" :types="EVENT" />
    </FormField>

    <FormField v-if="'spawnedBy' in item" label="Spawned By">
      <ItemPicker v-model="item.spawnedBy" :zone="zone" :types="ENEMY" />
    </FormField>

    <FormField v-if="'learnedFrom' in item" label="Learned From">
      <ItemPicker v-model="item.learnedFrom" :zone="zone" :types="ENEMY_OR_EVENT" />
    </FormField>

    <div v-if="'requires' in item" class="editor-columns">
      <FormField label="Requires">
        <ItemPicker v-model="item.requires" :zone="zone" :types="SPELL" :exclude="item.id" />
      </FormField>
      <FormField label="Replaces">
        <ItemPicker v-model="item.replaces" :zone="zone" :types="SPELL" :exclude="item.id" />
      </FormField>
    </div>

    <FormField v-if="'source' in item" label="Spawns From">
      <select :value="poolValue" class="editor-input" @change="setPool">
        <option value="__bonus">Bonus Roll</option>
        <optgroup label="During a FATE">
          <option v-for="fate in fates" :key="fate.id" :value="fate.id">
            {{ describeRef(zone, fate.id) }}
          </option>
        </optgroup>
      </select>
    </FormField>

    <template v-if="'boss' in shape">
      <FormField label="Boss">
        <label class="editor-checks">
          <input :checked="hasBoss" type="checkbox" @change="toggleBoss">
          <span>This event has a single enemy to fight</span>
        </label>
      </FormField>
      <template v-if="'boss' in item && item.boss">
        <FormField label="Boss Name">
          <input v-model="item.boss.name" class="editor-input" type="text">
        </FormField>
        <FormField v-if="'weakness' in item.boss" label="Boss Weakness">
          <KeyChecks :keys="item.boss.weakness" :options="elements.options()" />
        </FormField>
      </template>
    </template>

    <template v-if="'mutation' in shape">
      <FormField label="Mutation">
        <label class="editor-checks">
          <input :checked="'mutation' in item && !!item.mutation" type="checkbox" @change="toggleMutation">
          <span>This enemy mutates</span>
        </label>
      </FormField>
      <template v-if="'mutation' in item && item.mutation">
        <FormField label="Mutates Into">
          <select :value="item.mutation.element ?? ''" class="editor-input" @change="setMutationElement">
            <option value="">Unknown</option>
            <option v-for="option in elements.options()" :key="option.key" :value="option.key">
              {{ option.label }}
            </option>
          </select>
        </FormField>
        <ConditionList :conditions="item.mutation.conditions" label="Mutation Conditions" />
      </template>
    </template>

    <template v-if="'adaptation' in shape">
      <FormField label="Adaptation">
        <label class="editor-checks">
          <input :checked="'adaptation' in item && !!item.adaptation" type="checkbox" @change="toggleAdaptation">
          <span>This enemy adapts</span>
        </label>
      </FormField>
      <ConditionList
        v-if="'adaptation' in item && item.adaptation"
        :conditions="item.adaptation.conditions"
        label="Adaptation Conditions"
      />
    </template>

    <DropList v-if="'drops' in item" :drops="item.drops" />
    <SpawnList v-if="'spawns' in item" :spawns="item.spawns" :zone="zone" />
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConditionList from '~/components/Editor/ConditionList.vue'
import DropList from '~/components/Editor/DropList.vue'
import FormField from '~/components/Editor/FormField.vue'
import ItemPicker from '~/components/Editor/ItemPicker.vue'
import KeyChecks from '~/components/Editor/KeyChecks.vue'
import PositionList from '~/components/Editor/PositionList.vue'
import SpawnList from '~/components/Editor/SpawnList.vue'
import { useEditor } from '~/composables/useZoneEditor'
import { iconKeys, type IconKey } from '~/model/icons'
import {
  aggroTypes,
  attacks,
  directions,
  elements,
  grades,
  mobFamilies,
  ranks,
  spawnConditions,
  weathers,
} from '~/model/lookups'
import {
  BONUS_POOL,
  describeRef,
  firstAccepted,
  isOptionalField,
  shapeOf,
  operations,
  setField,
  type LoadedSection,
  type LoadedZone,
  type ZoneItem,
} from '~/zones'

// Every field the item's own schema declares, in the order the viewer shows them. `in item`
// narrows a required field to its real type; a field the schema makes optional is absent from an
// item that has none, so which of those to draw comes from the schema's shape instead.
const props = defineProps<{
  item: ZoneItem
  section: LoadedSection
}>()

const EVENT = ['event'] as const
const ENEMY = ['enemy'] as const
const ENEMY_OR_EVENT = ['enemy', 'event'] as const
const SPELL = ['spell'] as const

const editor = useEditor()
const zone = computed(() => editor.zone.value as LoadedZone)

const shape = computed(() => shapeOf(props.section.definition.schema))
const iconOptional = computed(() => isOptionalField(shape.value, 'icon'))
const level = computed(() => operations[zone.value.definition.operation].levelLabel)

const hasBoss = computed(() => 'boss' in props.item && props.item.boss !== undefined)

const fates = computed(() =>
  zone.value.sections
    .filter(section => section.definition.type === 'event')
    .flatMap(section => section.items)
)

// A pot names the FATE it spawns under, or the bonus roll, and never both.
const poolValue = computed(() =>
  'source' in props.item && props.item.source.type === 'fate' ? props.item.source.fateId : BONUS_POOL
)

function rename(event: Event) {
  const value = (event.target as HTMLInputElement).value
  setOptional('name', value === '' ? undefined : value)
}

function setOptional(field: string, value: unknown) {
  setField(props.item, shape.value, field, value)
}

function setIcon(event: Event) {
  const key = (event.target as HTMLSelectElement).value as IconKey | ''
  setOptional('icon', key === '' ? undefined : key)
}

function setPool(event: Event) {
  if (!('source' in props.item)) return
  const value = (event.target as HTMLSelectElement).value
  props.item.source = value === BONUS_POOL ? { type: 'bonus' } : { type: 'fate', fateId: value }
}

function setMutationElement(event: Event) {
  if (!('mutation' in props.item) || !props.item.mutation) return
  const key = (event.target as HTMLSelectElement).value
  if (key === '') delete props.item.mutation.element
  else props.item.mutation.element = key as typeof props.item.mutation.element
}

const ticked = (event: Event) => (event.target as HTMLInputElement).checked

// Presence is what says an enemy mutates, so the checkbox adds the object or takes it away rather
// than setting a flag inside one that is always there.
function toggleMutation(event: Event) {
  setOptional('mutation', ticked(event) ? { conditions: [] } : undefined)
}

function toggleAdaptation(event: Event) {
  setOptional('adaptation', ticked(event) ? { conditions: [] } : undefined)
}

function toggleBoss(event: Event) {
  if (!ticked(event)) {
    setOptional('boss', undefined)
    return
  }
  setOptional('boss', firstAccepted(shape.value, 'boss', [
    { name: 'New boss', weakness: [] },
    { name: 'New boss' },
  ]))
}
</script>
