<template>
    <div id="filters" class="flex">
        <div v-show="expanded" @click.stop="" id="filtersCard" class="relative overflow-auto rounded px-8 pt-6 pb-8 mb-4 text-gray-200">
            <div @click="$emit('resetFilters')" class="absolute top-0 right-0 cursor-pointer">Reset</div>
            <form>
                <div class="mb-2" v-if="hasLevelRange">
                    <label class="block text-sm font-bold mb-2" for="username">
                        Level Range
                    </label>
                    <div class="flex flex-wrap -mx-3">
                        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <input :value="filters.level.from" @change="updateLevelRange($event, 'from')" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="From">
                        </div>
                        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <input :value="filters.level.to" @change="updateLevelRange($event, 'to')" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="To">
                        </div>
                    </div>
                </div>

                <div class="mb-2" v-if="hasElement">
                    <label class="block text-sm font-bold mb-2" for="username">
                        Element
                    </label>
                    <div class="inline-block relative w-full">
                        <select :value="filters.element" @change="updateFilters($event, 'element')" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="">Any</option>
                            <option value='fire'>Fire</option>
                            <option value='earth'>Earth</option>
                            <option value='lightning'>Lightning</option>
                            <option value='water'>Water</option>
                            <option value='wind'>Wind</option>
                            <option value='ice'>Ice</option>
                        </select>
                        <div class="pointer-events-none absolute flex items-center px-2 inset-y-0 right-0">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div class="mb-2" v-if="hasDrops">
                    <label class="block text-sm font-bold mb-2" for="username">
                        Drops
                    </label>
                    <div class="inline-block relative w-full">
                        <select :value="filters.drops.value" @change="updateDrops" class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="">Any</option>
                            <option v-for="option in filters.drops.options" :key="option.id" :value="option.name">{{ option.name }}</option>
                        </select>
                        <div class="pointer-events-none absolute flex items-center px-2 inset-y-0 right-0">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
                <filter-section v-for="(section, index) in filters.sections" :key="index" :section="section" :jsonData="jsonData" @updateSection="updateSection(index, ...arguments)"></filter-section>
            </form>
        </div>
        <div class="filterExpander relative">
            <div>
                <div @click="expanded = !expanded" class="cursor-pointer w-full h-full flex justify-center items-center">
                    <font-awesome-icon :icon="expandFiltersIcon" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import FilterSection from './FilterSection'

    export default {
        name: 'filters',
        components: {
            FilterSection
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
        data() {
            return {
                expanded: true,
                windowWidth: window.innerWidth
            }
        },
        mounted() {
            window.onresize = () => {
                this.windowWidth = window.innerWidth
            }
        },
        computed: {
            expandFiltersIcon() {
                if (this.windowWidth < 640) {
                    return this.expanded ? 'caret-up' : 'caret-down'
                } else {
                    return this.expanded ? 'caret-left' : 'caret-right'
                }
            },
            hasLevelRange () {
                return this.filters.hasOwnProperty("level")
            },
            hasElement () {
                return this.filters.hasOwnProperty("element")
            },
            hasDrops () {
                return this.filters.hasOwnProperty("drops")
            }
        },
        methods: {
            updateLevelRange(event, key) {
                this.$emit('updateFilters', Object.assign(this.filters, {level: Object.assign(this.filters.level, {[key]: parseInt(event.target.value)})}))
            },
            updateFilters(event, key) {
                this.$emit('updateFilters', Object.assign(this.filters, {[key]: event.target.value}))
            },
            updateSection(key, section) {
                this.$emit('updateFilters', Object.assign(this.filters, {sections: Object.assign(this.filters.sections, {[key]: section})}))
            },
            updateDrops(event) {
                this.$emit('updateFilters', Object.assign(this.filters, {drops: Object.assign(this.filters.drops, {value: event.target.value})}))
            }
        }
    }
</script>