<template>
    <div class="w-full border border-gray-200 rounded overflow-hidden">
        <div class="sectionHeader p-4 flex justify-between content-center">
            <div>
                <input :checked="showOnMap" @input="updateShowOnMap" type="checkbox" title="Show/Hide this section from the map" />
            </div>
            <div>
                <span class="font-bold mr-1">{{ section.name }} ({{ section.items.length }})</span>
                <span @click="addToSection"><font-awesome-icon icon="plus" class="cursor-pointer" /></span>
            </div>
            <div>
                <span v-show="expanded" @click="toggleExpanded"><font-awesome-icon icon="caret-up" class="cursor-pointer" /></span>
                <span v-show="!expanded" @click="toggleExpanded"><font-awesome-icon icon="caret-down" class="cursor-pointer" /></span>
            </div>
        </div>
        <div v-show="expanded && section.items.length" class="sectionBody p-4 border border-gray-200 bg-gray-100">
            <component :is="itemComponent" v-for="item in section.items" :key="item.id" :item="item" :section-key="$vnode.key" :jsonDataShow="jsonDataShow" @updateItem="updateItem" @setItemPosition="setItemPosition" @updateItemShowData="updateItemShowData" @deleteItem="deleteItem" />
        </div>
    </div>
</template>

<script>
    import Monster from './SectionItems/Monster'
    import Quest from './SectionItems/Quest'
    import Aetheryte from './SectionItems/Aetheryte'
    import Fate from './SectionItems/Fate'
    import Elemental from './SectionItems/Elemental'
    import Lockbox from './SectionItems/Lockbox'

    export default {
        name: 'Section',
        components: {
            Monster,
            Quest,
            Aetheryte,
            Fate,
            Elemental,
            Lockbox
        },
        props: {
            section: {
                type: Object,
                required: true
            },
            jsonDataShow: {
                type: Object,
                required: true
            }
        },
        data() {
            return {

            }
        },
        computed: {
            itemComponent() {
                let componentName = ''
                switch (this.$vnode.key) {
                    case 'monsters':
                        componentName = 'Monster'
                        break;
                    case 'quests':
                        componentName = 'Quest'
                        break;
                    case 'aethernet':
                        componentName = 'Aetheryte'
                        break;
                    case 'fates':
                        componentName = 'Fate'
                        break;
                    case 'elementals':
                        componentName = 'Elemental'
                        break;
                    case 'lockboxes':
                        componentName = 'Lockbox'
                        break;
                }
                return componentName
            },
            showOnMap() {
                if (this.jsonDataShow.hasOwnProperty(this.$vnode.key) && this.jsonDataShow[this.$vnode.key].hasOwnProperty('showOnMap')) {
                    return this.jsonDataShow[this.$vnode.key].showOnMap
                }

                return true
            },
            expanded() {
                if (this.jsonDataShow.hasOwnProperty(this.$vnode.key) && this.jsonDataShow[this.$vnode.key].hasOwnProperty('expanded')) {
                    return this.jsonDataShow[this.$vnode.key].expanded
                }

                return true
            }
        },
        methods: {
            addToSection() {
                this.$emit('addToSection', {
                    key: this.$vnode.key
                })
            },
            setItemPosition(evt) {
                this.$emit('setItemPosition', evt)
            },
            updateItem(sectionKey, newItem) {
                this.$emit('updateItem', sectionKey, newItem)
            },
            updateShowOnMap(evt) {
                this.$emit('updateShowData', this.$vnode.key, 'showOnMap', evt.target.checked)
            },
            toggleExpanded() {
                this.$emit('updateShowData', this.$vnode.key, 'expanded', !this.expanded)
            },
            updateItemShowData(itemId, showKey, value) {
                this.$emit('updateItemShowData', itemId, showKey, value)
            },
            deleteItem(sectionKey, itemId) {
                this.$emit('deleteItem', sectionKey, itemId)
            }
        }
    }
</script>

<style>
</style>