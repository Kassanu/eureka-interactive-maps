<template>
  <div class="p-2 rounded overflow-hidden shadow-md section-filters">
    <div class="mb-3">
      <label class="block text-sm font-bold mb-2">Participants</label>
      <div class="flex flex-wrap -mx-3">
        <div
          v-for="(participants, index) in filters.participants"
          :key="participants.amount"
          class="px-3 mb-6 md:mb-0 sm:mr-0 mr-2"
        >
          <input
            :checked="participants.enabled"
            @change="updateParticipants($event, index)"
            :id="participants.amount"
            class="mr-2 leading-tight"
            type="checkbox"
          />
          <label :for="participants.amount" class="text-sm font-bold">
            {{ participants.amount }}
          </label>
        </div>
      </div>
    </div>

    <ExpandableSection :startExpanded="false">
      <template #header>Duels</template>
      <template #content>
        <div class="flex flex-wrap">
          <div
            v-for="duel in duels"
            :key="duel.id"
            class="px-3 mb-6 md:mb-0 sm:mr-0 mr-2"
          >
            <input
              :checked="!filters.hiddenEngagements.includes(duel.id)"
              @change="updateHiddenEngagements($event, duel.id)"
              :id="duel.id"
              class="mr-2 leading-tight"
              type="checkbox"
            />
            <label :for="duel.id" class="text-sm font-bold">
              {{ duel.name }}
            </label>
          </div>
        </div>
      </template>
    </ExpandableSection>

    <ExpandableSection :startExpanded="false">
      <template #header>Engagements</template>
      <template #content>
        <div class="flex flex-wrap">
          <div
            v-for="engagement in engagements"
            :key="engagement.id"
            class="px-3 mb-6 md:mb-0 sm:mr-0 mr-2"
          >
            <input
              :checked="!filters.hiddenEngagements.includes(engagement.id)"
              @change="updateHiddenEngagements($event, engagement.id)"
              :id="engagement.id"
              class="mr-2 leading-tight"
              type="checkbox"
            />
            <label :for="engagement.id" class="text-sm font-bold">
              {{ engagement.name }}
            </label>
          </div>
        </div>
      </template>
    </ExpandableSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ExpandableSection from './ExpandableSection.vue'

const props = defineProps<{
  filters: any
  jsonData: any
}>()

const emit = defineEmits(['updateFilters'])

const duels = computed(() =>
  props.jsonData.engagements.items.filter((engagement: any) => engagement.participants === 1)
)

const engagements = computed(() =>
  props.jsonData.engagements.items.filter((engagement: any) => engagement.participants !== 1)
)

const updateParticipants = (evt: Event, index: number) => {
  const target = evt.target as HTMLInputElement
  const newParticipants = [...props.filters.participants]
  newParticipants[index].enabled = target.checked
  emit('updateFilters', { ...props.filters, participants: newParticipants })
}

const updateHiddenEngagements = (evt: Event, id: string) => {
  const target = evt.target as HTMLInputElement
  const newHidden = [...props.filters.hiddenEngagements]
  if (!target.checked) {
    newHidden.push(id)
  } else {
    const idx = newHidden.indexOf(id)
    if (idx !== -1) newHidden.splice(idx, 1)
  }
  emit('updateFilters', { ...props.filters, hiddenEngagements: newHidden })
}
</script>
