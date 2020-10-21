<template>
    <div class="mb-2">
        <div class="border-b border-gray-200 flex justify-start">
            <div>
                <input :checked="section.enabled" @change="updateEnabled" :id="viewInputId" type="checkbox"
                    title="Show/Hide this section from the map" class="mr-2" />
            </div>
            <div>
                <label class="font-bold mr-1" :for="viewInputId">{{ section.name }}</label>
            </div>
            <div v-if="showExpanded" class="ml-auto">
                <span v-show="expanded" @click="toggleExpanded">
                    <font-awesome-icon icon="caret-up" class="cursor-pointer" /></span>
                <span v-show="!expanded" @click="toggleExpanded">
                    <font-awesome-icon icon="caret-down" class="cursor-pointer" /></span>
            </div>
        </div>
        <component v-if="showExpanded && expanded" :is="filterComponent" :filters="section.filters" :jsonData="jsonData"
            @updateFilters="updateFilters"></component>
    </div>
</template>

<script>
    import Monsters from './SectionItems/Monsters'
    import Enemies from './SectionItems/Enemies'
    import CriticalEngagements from './SectionItems/CriticalEngagements'
    import Skirmishes from './SectionItems/Skirmishes'

    export default {
        name: 'filter-section',
        components: {
            Monsters,
            Enemies,
            CriticalEngagements,
            Skirmishes
        },
        props: {
            section: {
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
                expanded: true
            }
        },
        computed: {
            showExpanded() {
                return Object.keys(this.section.filters).length !== 0
            },
            filterComponent() {
                let component = null
                switch (this.$vnode.key) {
                    case 'monsters':
                        component = 'Monsters'
                        break
                    case 'enemies':
                        component = 'Enemies'
                        break
                    case 'engagements':
                        component = 'CriticalEngagements'
                        break
                    case 'skirmishes':
                        component = 'Skirmishes'
                        break
                    default:
                        component = null
                }

                return component
            },
            viewInputId() {
                return `showhidecheckbox-${this.$vnode.key}`
            }
        },
        methods: {
            toggleExpanded() {
                this.expanded = !this.expanded
            },
            updateEnabled(event) {
                this.$emit('updateSection', Object.assign(this.section, { enabled: event.target.checked }))
            },
            updateFilters(filters) {
                this.$emit('updateSection', Object.assign(this.section, { filters: filters }))
            }
        }
    }
</script>