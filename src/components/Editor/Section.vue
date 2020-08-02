<template>
    <div class="w-full rounded">
        <div class="sectionHeader bg-white p-4 border-b border-gray-200 flex justify-between content-center sticky top-0 z-50">
            <div>
                <input :checked="showOnMap" @input="updateShowOnMap" type="checkbox"
                    title="Show/Hide this section from the map" />
            </div>
            <div>
                <span class="font-bold mr-1">{{ section.name }} ({{ filteredItems.length }})</span>
                <span @click="addToSection">
                    <font-awesome-icon icon="plus" class="cursor-pointer" /></span>
            </div>
            <div>
                <span v-show="expanded" @click="toggleExpanded">
                    <font-awesome-icon icon="caret-up" class="cursor-pointer" /></span>
                <span v-show="!expanded" @click="toggleExpanded">
                    <font-awesome-icon icon="caret-down" class="cursor-pointer" /></span>
            </div>
        </div>
        <div v-show="expanded && filteredItems.length" class="sectionBody p-4 bg-gray-100">
            <component :is="itemComponent" v-for="item in filteredItems" :key="item.id" :item="item"
                :section-key="$vnode.key" :jsonDataShow="jsonDataShow" @updateItem="updateItem"
                @setItemPosition="setItemPosition" @updateItemShowData="updateItemShowData" @deleteItem="deleteItem" @updateAllItemShowData="updateAllItemShowData" />
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
            },
            searchValue: {
                type: String,
                required: true
            }
        },
        data() {
            return {

            }
        },
        computed: {
            filteredItems() {
                let items = []

                if (this.searchValue !== '') {
                    item = this.section.items.filter((item) => {
                        return item.id.toLowerCase().includes(this.searchValue.toLowerCase()) || item.name.toLowerCase().includes(this.searchValue.toLowerCase())
                    })
                } else {
                    items = this.section.items
                }

                const baseItems = JSON.parse(JSON.stringify(this.section.baseItem))
                items = JSON.parse(JSON.stringify(items))
                items = items.map(item => {
                    return Object.assign({}, baseItems, item)
                })

                return items
            },
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
            updateAllItemShowData(sectionKey, showKey, value) {
                this.$emit('updateAllItemShowData', sectionKey, showKey, value)
            },
            deleteItem(sectionKey, itemId) {
                this.$emit('deleteItem', sectionKey, itemId)
            }
        }
    }
</script>

<style>
</style>