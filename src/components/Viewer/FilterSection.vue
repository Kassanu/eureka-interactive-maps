<template>
    <div class="mb-2">
        <div class="border-b border-gray-200 flex justify-start">
            <div>
                <input :checked="section.enabled" @change="updateEnabled" type="checkbox" title="Show/Hide this section from the map"
                    class="mr-2" />
            </div>
            <div>
                <span class="font-bold mr-1">{{ section.name }}</span>
            </div>
            <div v-if="showExpanded" class="ml-auto">
                <span v-show="expanded" @click="toggleExpanded">
                    <font-awesome-icon icon="caret-up" class="cursor-pointer" /></span>
                <span v-show="!expanded" @click="toggleExpanded">
                    <font-awesome-icon icon="caret-down" class="cursor-pointer" /></span>
            </div>
        </div>
        <component v-if="showExpanded && expanded" :is="filterComponent" :filters="section.filters" @updateFilters="updateFilters"></component>
    </div>
</template>

<script>
    import Monsters from './SectionItems/Monsters'

    export default {
        name: 'filter-section',
        components: {
            Monsters
        },
        props: {
            section: {
                type: Object
            }
        },
        data() {
            return {
                expanded: true
            }
        },
        computed: {
            showExpanded() {
                return Object.keys(this.section.filters).length !== 0
            },
            filterComponent () {
                return 'Monsters' // this is the only one with filters, expand this if more are added
            }
        },
        methods: {
            toggleExpanded() {
                this.expanded = !this.expanded
            },
            updateEnabled(event) {
                this.$emit('updateSection', Object.assign(this.section, {enabled: event.target.checked}))
            },
            updateFilters(filters) {
                this.$emit('updateSection', Object.assign(this.section, {filters: filters}))
            }
        }
    }
</script>