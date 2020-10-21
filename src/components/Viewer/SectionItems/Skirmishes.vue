<template>
    <div class="p-2 rounded overflow-hidden shadow-md section-filters">
        <ExpandableSection :startExpanded="false">
            <template v-slot:header>
                Skirmishes
            </template>
            <template v-slot:content>
                <div class="flex flex-wrap">
                    <div v-for="skirmish in skirmishes" :key="skirmish.id" class="px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
                        <input :checked="!filters.hiddenSkirmishes.includes(skirmish.id)" @change="updateHiddenSkirmishes($event, skirmish.id)" :id="skirmish.id" class="mr-2 leading-tight" type="checkbox">
                        <label :for="skirmish.id" class="text-sm font-bold">
                            {{ skirmish.name }}
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
        name: 'Skirmishes',
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
            skirmishes() {
                return this.jsonData.skirmishes.items
            }
        },
        methods: {
            updateHiddenSkirmishes(evt, id) {
                let newPartAr = [...this.filters.hiddenSkirmishes]
                if (!evt.target.checked) {
                    newPartAr.push(id)
                } else {
                    newPartAr.splice(newPartAr.indexOf(id), 1);
                }
                
                this.$emit('updateFilters', Object.assign(this.filters, {hiddenSkirmishes: newPartAr}))
            }
        }
    }
</script>