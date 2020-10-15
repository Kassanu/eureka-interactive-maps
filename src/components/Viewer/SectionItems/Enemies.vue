<template>
    <div class="p-2 rounded overflow-hidden shadow-md section-filters">
        <div class="mb-3">
            <label class="block text-sm font-bold mb-2">
                Enemy Rank
            </label>
            <div class="mb-3">
                <div class="flex flex-wrap -mx-3">
                    <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
                        <input :checked="filters.rank[1]" @change="updateRank($event, 1)" id="rank1Checkbox" class="mr-2 leading-tight" type="checkbox">
                        <label for="rank1Checkbox" class="text-sm font-bold">
                            Rank 1
                        </label>
                    </div>
                    <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
                        <input :checked="filters.rank[2]" @change="updateRank($event, 2)" id="rank2Checkbox" class="mr-2 leading-tight" type="checkbox">
                        <label for="rank2Checkbox" class="text-sm font-bold">
                            Rank 2
                        </label>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div class="flex flex-wrap -mx-3">
                    <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
                        <input :checked="filters.rank[3]" @change="updateRank($event, 3)" id="rank3Checkbox" class="mr-2 leading-tight" type="checkbox">
                        <label for="rank3Checkbox" class="text-sm font-bold">
                            Rank 3
                        </label>
                    </div>
                    <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
                        <input :checked="filters.rank[4]" @change="updateRank($event, 4)" id="rank4Checkbox" class="mr-2 leading-tight" type="checkbox">
                        <label for="rank4Checkbox" class="text-sm font-bold">
                            Rank 4
                        </label>
                    </div>
                </div>
            </div>
            <div>
                <div class="flex flex-wrap -mx-3">
                    <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
                        <input :checked="filters.rank[5]" @change="updateRank($event, 5)" id="rank5Checkbox" class="mr-2 leading-tight" type="checkbox">
                        <label for="rank5Checkbox" class="text-sm font-bold">
                            Rank 5
                        </label>
                    </div>
                    <div class="md:w-1/2 sm:w-full px-3 mb-6 md:mb-0 sm:mr-0 mr-2">
                        <input :checked="filters.rank[0]" @change="updateRank($event, 0)" id="rank0Checkbox" class="mr-2 leading-tight" type="checkbox">
                        <label for="rank0Checkbox" class="text-sm font-bold">
                            Star Rank
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <div class="mb-3">
            <label class="block text-sm font-bold mb-2">
                Enemy Type
            </label>
            <div class="flex flex-wrap -mx-3">
                <div class="w-1/2 sm:w-full px-3 mb-6 md:mb-0">
                    <input :checked="filters.ashkin" @change="updateFilter($event, 'ashkin')" id="ashkinCheckbox" class="mr-2 leading-tight" type="checkbox">
                    <label for="ashkinCheckbox" class="text-sm font-bold">
                        Ashkin
                    </label>
                </div>
                <div class="w-1/2 sm:w-full px-3 mb-6 md:mb-0">
                    <input :checked="filters.elemental" @change="updateFilter($event, 'elemental')" id="elementalCheckbox" class="mr-2 leading-tight" type="checkbox">
                    <label for="elementalCheckbox" class="text-sm font-bold">
                        Elemental
                    </label>
                </div>
                <div class="w-1/2 sm:w-full px-3 mb-6 md:mb-0">
                    <input :checked="filters.fauna" @change="updateFilter($event, 'fauna')" id="faunaCheckbox" class="mr-2 leading-tight" type="checkbox">
                    <label for="faunaCheckbox" class="text-sm font-bold">
                        Fauna
                    </label>
                </div>
                <div class="w-1/2 sm:w-full px-3 mb-6 md:mb-0">
                    <input :checked="filters.machine" @change="updateFilter($event, 'machine')" id="machineCheckbox" class="mr-2 leading-tight" type="checkbox">
                    <label for="machineCheckbox" class="text-sm font-bold">
                        Machine
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'enemies',
        props: {
            filters: {
                type: Object
            }
        },
        data() {
            return {
                checkboxKeys: [
                    'ashkin',
                    'elemental',
                    'fauna',
                    'machine'
                ]
            }
        },
        methods: {
            updateRank(evt, index) {
                let newRankAr = [...this.filters.rank]
                newRankAr[index] = evt.target.checked
                this.$emit('updateFilters', Object.assign(this.filters, {rank: newRankAr}))
            },
            updateFilter(evt, key) {
                this.$emit('updateFilters', Object.assign(this.filters, {[key]: this.checkboxKeys.includes(key) ? event.target.checked : event.target.value}))
            }
        }
    }
</script>