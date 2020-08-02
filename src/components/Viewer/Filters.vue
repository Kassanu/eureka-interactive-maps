<template>
    <div id="filters" @click.stop="" class="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div @click="$emit('resetFilters')" class="absolute top-0 right-0 cursor-pointer">Reset</div>
        <form>
            <div class="mb-2">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                    Level Range
                </label>
                <div class="flex flex-wrap -mx-3">
                    <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                        <input :value="filters.level.from" @change="updateLevelRange($event, 'from')" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="From">
                    </div>
                    <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                        <input :value="filters.level.to" @change="updateLevelRange($event, 'to')" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="To">
                    </div>
                </div>
            </div>
            <div class="mb-2">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                    Element
                </label>
                <div class="inline-block relative w-full">
                    <select :value="filters.element" @change="updateFilters($event, 'element')" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <option value="">Any</option>
                        <option value='fire'>Fire</option>
                        <option value='earth'>Earth</option>
                        <option value='lightning'>Lightning</option>
                        <option value='water'>Water</option>
                        <option value='wind'>Wind</option>
                        <option value='ice'>Ice</option>
                    </select>
                    <div class="pointer-events-none absolute flex items-center px-2 text-gray-700 inset-y-0 right-0">
                        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>
            <filter-section v-for="(section, index) in filters.sections" :key="index" :section="section" @updateSection="updateSection(index, ...arguments)"></filter-section>
        </form>
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
                type: Object
            }
        },
        data() {
            return {}
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

            }
        }
    }
</script>