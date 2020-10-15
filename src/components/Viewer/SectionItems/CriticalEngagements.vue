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
    </div>
</template>

<script>
    export default {
        name: 'CriticalEngagements',
        props: {
            filters: {
                type: Object
            }
        },
        methods: {
            updateParticipants(evt, index) {
                let newPartAr = [...this.filters.participants]
                newPartAr[index].enabled = evt.target.checked
                this.$emit('updateFilters', Object.assign(this.filters, {participants: newPartAr}))
            }
        }
    }
</script>