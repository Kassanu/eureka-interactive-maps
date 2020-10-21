<template>
    <div class="p-2 rounded overflow-hidden shadow-md section-filters">
        <div class="mb-3">
            <label class="block text-sm font-bold mb-2">
                Participants
            </label>
            <div class="flex flex-wrap -mx-3">
                <div v-for="(participants, index) in filters.participants" :key="participants.amount" class="px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
                    <input :checked="participants.enabled" @change="updateParticipants($event, index)" :id="participants.amount" class="mr-2 leading-tight" type="checkbox">
                    <label :for="participants.amount" class="text-sm font-bold">
                        {{ participants.amount }}
                    </label>
                </div>
            </div>
        </div>
        <ExpandableSection :startExpanded="false">
            <template v-slot:header>
                Duels
            </template>
            <template v-slot:content>
                <div class="flex flex-wrap">
                    <div v-for="duel in duels" :key="duel.id" class="px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
                        <input :checked="!filters.hiddenEngagements.includes(duel.id)" @change="updateHiddenEngagements($event, duel.id)" :id="duel.id" class="mr-2 leading-tight" type="checkbox">
                        <label :for="duel.id" class="text-sm font-bold">
                            {{ duel.name }}
                        </label>
                    </div>
                </div>
            </template>
        </ExpandableSection>
        <ExpandableSection :startExpanded="false">
            <template v-slot:header>
                Engagements
            </template>
            <template v-slot:content>
                <div class="flex flex-wrap">
                    <div v-for="engagement in engagements" :key="engagement.id" class="px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
                        <input :checked="!filters.hiddenEngagements.includes(engagement.id)" @change="updateHiddenEngagements($event, engagement.id)" :id="engagement.id" class="mr-2 leading-tight" type="checkbox">
                        <label :for="engagement.id" class="text-sm font-bold">
                            {{ engagement.name }}
                        </label>
                    </div>
                </div>
            </template>
        </ExpandableSection>
    </div>
</template>

<script>
    import ExpandableSection from './ExpandableSection'

    export default {
        name: 'CriticalEngagements',
        components: {
            ExpandableSection
        },
        props: {
            filters: {
                type: Object,
                required: true
            },
            jsonData: {
                type: Object,
                required: true
            }
        },
        computed: {
            duels() {
                return this.jsonData.engagements.items.filter(engagement => {
                    return engagement.participants === 1
                })
            },
            engagements() {
                return this.jsonData.engagements.items.filter(engagement => {
                    return engagement.participants !== 1
                })
            }
        },
        methods: {
            updateParticipants(evt, index) {
                let newPartAr = [...this.filters.participants]
                newPartAr[index].enabled = evt.target.checked
                this.$emit('updateFilters', Object.assign(this.filters, {participants: newPartAr}))
            },
            updateHiddenEngagements(evt, id) {
                let newPartAr = [...this.filters.hiddenEngagements]
                if (!evt.target.checked) {
                    newPartAr.push(id)
                } else {
                    newPartAr.splice(newPartAr.indexOf(id), 1);
                }
                
                this.$emit('updateFilters', Object.assign(this.filters, {hiddenEngagements: newPartAr}))
            }
        }
    }
</script>