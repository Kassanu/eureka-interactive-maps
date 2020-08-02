<template>
    <div id="viewer" class="relative">
        <filters :filters="cFilters" @updateFilters="updateFilters" @resetFilters="resetFilters"></filters>
        <EurekaCanvas
            v-if="!loading"
            :canvasImage="image"
            :gridSizeInPixels="gridSizeInPixels"
            :coordinatesOffset="coordinatesOffset"
            :positions="positions"
            :maximumZoom="maximumZoom"
            :positionsIdKey="'id'"
            @click="clickedCanvas"
            @clickedElement="clickedElement"
        />
        <item-information v-if="clickedItem !== false" :position="clickPosition" @closeItemInformation="closeItemInformation">
            <template v-slot:icon><div v-html="clickedItemIcon"></div></template>
            <template v-slot:header>
                {{clickedItemLabel}}
            </template>
            <template v-slot:content>
                <component :is="clickedItemComponent" :item="clickedItemSourceItem" :fates="jsonData.fates.items" :monsters="jsonData.monsters.items"></component>
            </template>
        </item-information>
    </div>
</template>

<script>
    import EurekaCanvas from 'eureka-canvas'
    import Filters from './Filters'
    import ItemInformation from './ItemInformation'
    import DefaultItemInformation from './DefaultItemInformation'
    import MonsterItemInformation from './MonsterItemInformation'
    import FateItemInformation from './FateItemInformation'

    export default {
        name: 'viewer',
        components: {
            Filters,
            ItemInformation,
            DefaultItemInformation,
            MonsterItemInformation,
            FateItemInformation,
            EurekaCanvas
        },
        props:{
            imageSource: {
                type: String,
                required: true
            },
            jsonData: {
                type: Object,
                required: true
            },
            pFilters: {
                type: Object,
                required: true
            },
            mapName: {
                type: String,
                required: true
            },
            gridSizeInPixels: {
                type: Number,
                default: 100
            },
            coordinatesOffset: {
                type: Number,
                default: 0
            },
            maximumZoom: {
                type: Number,
                default: 100
            }
        },
        data() {
            return {
                cFilters: {},
                image: null,
                clickedItem: false,
                clickPosition: { x: 0, y: 0 },
                icons: {},
                jsonDataShow: {},
                loading: true,
                addToSectionKey: null,
                setPositionToItem: null
            }
        },
        async created() {
            this.cFilters = JSON.parse(JSON.stringify(this.pFilters))
            this.image = await this.loadImage(this.imageSource)
            await this.loadIcons()
            this.loading = false
        },
        mounted() {
            document.getElementById('viewer').addEventListener('click', (evt) => {
                this.clickPosition = { x: evt.offsetX, y: evt.offsetY }
            }, false)
        },
        computed: {
            clickedItemSourceItem() {
                if (this.clickedItem === false) {
                    return false
                }
                return this.jsonData[this.clickedItem.key].items.find((item) => {
                    return item.id == this.clickedItem.id
                })
            },
            clickedItemIcon() {
                if (this.clickedItem === false) {
                    return ''
                }
                switch (this.clickedItem.key) {
                    case 'fates':
                        return `<img title="FATE" src="${this.icons.fate.path}" />`
                        break
                    case 'elementals':
                        return `<img title="Eurekan Elemental" src="${this.icons.blessing.path}" />`
                        break
                    case 'lockboxes':
                        return `<img title="Bunny Lockbox" src="${this.icons.lock.path}" />`
                        break
                    case 'aethernet':
                        return `<img title="Aetheryte" src="${this.icons.aetheryte.path}" />`
                        break
                    case 'quests':
                        return `<img title="Quest" src="${this.icons.quest.path}" />`
                        break
                    case 'monsters':
                        let icons = ''
                        icons += `<img src="${this.clickedItemSourceItem.element === '' ? this.icons['noelement'].path : this.icons[this.clickedItemSourceItem.element].path}" />`
                        if (this.clickedItemSourceItem.ashkin) {
                            icons += `<img title="Ashkin" src="${this.icons.ashkin.path}" />`
                        }
                        if (this.clickedItemSourceItem.mutation.canMutate) {
                            icons += `<img title="Mutates" src="${this.icons.mutation.path}" />`
                        }
                        if (this.clickedItemSourceItem.adaptation.canAdapt) {
                            icons += `<img title="Adapts" src="${this.icons.adaptation.path}" />`
                        }
                        return icons
                        break
                }
            },
            clickedItemLabel() {
                if (this.clickedItem === false) {
                    return ''
                }
                switch (this.clickedItem.key) {
                    case 'fates':
                    case 'monsters':
                    case 'quests':
                    case 'aethernet':
                        return this.clickedItemSourceItem.name
                        break;
                    case 'elementals':
                        return `Eurekan Elementals`
                        break;
                    case 'lockboxes':
                        return `Bunny Lockboxes`
                        break;
                }
            },
            clickedItemComponent() {
                if (this.clickedItem === false) {
                    return ''
                }
                switch (this.clickedItem.key) {
                    case 'monsters':
                        return 'MonsterItemInformation'
                        break
                    case 'fates':
                        return 'FateItemInformation'
                        break
                    default:
                        return 'DefaultItemInformation'
                        break
                }
            },
            positions() {
                const pos = []
                if (!this.loading) {
                    this.sortedKeys.forEach(key => {
                        const section = this.jsonData[key]
                        if (this.cFilters.sections[key].enabled) {
                            for (const item of section.items) {
                                if (!this.shouldFilterItem(key, item)) {
                                    let itemObj = {
                                        id: item.id,
                                        key: key,
                                        label: item.name,
                                        coordinates: item.position,
                                        icons: []
                                    }

                                    // i'll turn this into a more fancy thing later
                                    switch (key) {
                                        case 'monsters':
                                            if (item.element == "" && this.icons.hasOwnProperty('noelement')) {
                                                itemObj.icons.push({ image: this.icons.noelement.image })
                                            } else if (this.icons.hasOwnProperty(item.element)) {
                                                itemObj.icons.push({ image: this.icons[item.element].image })
                                            }
                                            break;
                                        case 'fates':
                                            itemObj.icons.push({ image: this.icons.fate.image })
                                            if (item.element == "" && this.icons.hasOwnProperty('noelement')) {
                                                itemObj.icons.push({ image: this.icons.noelement.image })
                                            } else if (this.icons.hasOwnProperty(item.element)) {
                                                itemObj.icons.push({ image: this.icons[item.element].image })
                                            }
                                            break;
                                        case 'quests':
                                            itemObj.icons.push({ image: this.icons.quest.image })
                                            break;
                                        case 'aethernet':
                                            itemObj.icons.push({ image: this.icons.aetheryte.image })
                                            break;
                                        case 'elementals':
                                            itemObj.icons.push({ image: this.icons.blessing.image })
                                            break;
                                        case 'lockboxes':
                                            itemObj.icons.push({ image: this.icons.lock.image })
                                            break;
                                    }

                                    pos.push(itemObj)
                                }
                            }
                        }
                    });
                }
                return pos
            },
            sortedKeys() {
                return Object.keys(this.jsonData).sort((a, b) => this.jsonData[a].order - this.jsonData[b].order)
            },
        },
        methods: {
            closeItemInformation() {
                this.clickedItem = false
            },
            clickedCanvas() {
                this.clickedItem = false
            },
            clickedElement(item) {
                this.clickedItem = item
            },
            updateFilters(filters) {
                this.cFilters = filters
            },
            resetFilters() {
                this.cFilters = JSON.parse(JSON.stringify(this.pFilters))
            },
            shouldFilterItem(key, item) {
                const checks = []
                if (item.hasOwnProperty('level') && !(item.level >= this.cFilters.level.from && item.level <= this.cFilters.level.to)) {
                    checks.push(true)
                }

                if (item.hasOwnProperty('element') && this.cFilters.element !== '' && item.element !== this.cFilters.element) {
                    checks.push(true)
                }

                if (key === 'monsters') {
                    let sectionFilters = this.cFilters.sections.monsters.filters
                    if (sectionFilters.ashkin && !item.ashkin) {
                        checks.push(true)
                    }

                    if (sectionFilters.sprite && !item.name.includes('Sprite')) {
                        checks.push(true)
                    }

                    if (sectionFilters.fate && !item.fate.forFate) {
                        checks.push(true)
                    }

                    if (sectionFilters.aggro !== '' && item.aggro !== sectionFilters.aggro) {
                        checks.push(true)
                    }

                    if (sectionFilters.mutates && !item.mutation.canMutate) {
                        checks.push(true)
                    }

                    if (sectionFilters.adapts && !item.adaptation.canAdapt) {
                        checks.push(true)
                    }

                    if (sectionFilters.maweather !== '' && sectionFilters.matime !== '') {
                        let adaptFound = item.adaptation.conditions.some(condition => {
                            return condition.weather === sectionFilters.maweather && condition.time === sectionFilters.matime
                        })
                        let mutateFound = item.mutation.conditions.some(condition => {
                            return condition.weather === sectionFilters.maweather && condition.time === sectionFilters.matime
                        })

                        checks.push(!(adaptFound || mutateFound))

                    } else if (sectionFilters.maweather !== '') {
                        let adaptFound = item.adaptation.conditions.some(condition => {
                            return condition.weather === sectionFilters.maweather
                        })
                        let mutateFound = item.mutation.conditions.some(condition => {
                            return condition.weather === sectionFilters.maweather
                        })
                        checks.push(!(adaptFound || mutateFound))
                    } else if (sectionFilters.matime !== '') {
                        let adaptFound = item.adaptation.conditions.some(condition => {
                            return condition.time === sectionFilters.matime
                        })
                        let mutateFound = item.mutation.conditions.some(condition => {
                            return condition.time === sectionFilters.matime
                        })

                        checks.push(!(adaptFound || mutateFound))
                    }

                    if (sectionFilters.mutateElement !== '' && item.mutation.element !== sectionFilters.mutateElement) {
                        checks.push(true)
                    }
                }

                return [...new Set(checks)].filter(el => el).length === 1
            },
            async loadIcons() {
                const icons = {
                    noelement: {
                        path: require('@/assets/images/icons/elements/noelement.png'),
                        image: null
                    },
                    fire: {
                        path: require('@/assets/images/icons/elements/fire2.png'),
                        image: null
                    },
                    wind: {
                        path: require('@/assets/images/icons/elements/wind2.png'),
                        image: null
                    },
                    water: {
                        path: require('@/assets/images/icons/elements/water2.png'),
                        image: null
                    },
                    lightning: {
                        path: require('@/assets/images/icons/elements/lightning2.png'),
                        image: null
                    },
                    ice: {
                        path: require('@/assets/images/icons/elements/ice2.png'),
                        image: null
                    },
                    earth: {
                        path: require('@/assets/images/icons/elements/earth2.png'),
                        image: null
                    },
                    quest: {
                        path: require('@/assets/images/icons/quest.png'),
                        image: null
                    },
                    adaptation: {
                        path: require('@/assets/images/icons/adaptation.png'),
                        image: null
                    },
                    mutation: {
                        path: require('@/assets/images/icons/mutation.png'),
                        image: null
                    },
                    aetheryte: {
                        path: require('@/assets/images/icons/aetheryte.png'),
                        image: null
                    },
                    fate: {
                        path: require('@/assets/images/icons/fate.png'),
                        image: null
                    },
                    blessing: {
                        path: require('@/assets/images/icons/blessing.png'),
                        image: null
                    },
                    lock: {
                        path: require('@/assets/images/icons/lock.png'),
                        image: null
                    },
                    ashkin: {
                        path: require('@/assets/images/icons/ashkin.png'),
                        image: null
                    }
                }

                await Object.keys(icons).reduce(async (promise, iconKey) => {
                    // This line will wait for the last async function to finish.
                    // The first iteration uses an already resolved Promise
                    // so, it will immediately continue.
                    await promise;
                    icons[iconKey].image = await this.loadImage(icons[iconKey].path)
                }, Promise.resolve());
                this.icons = icons
            },
            loadImage: url => new Promise(resolve => {
                let img = new Image()
                img.onload = () => resolve(img)
                img.src = url
            })
        }
    }
</script>