<template>
    <div id="editor" class="relative">
        <div v-show="showAddNewItemBanner" @click="cancelAddNewItem" class="addNewItemBanner absolute top-0 left-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Click on the map to add a new item for {{ addNewItemSelectedName }}. Click this message to cancel.
        </div>
        <MapDataEditor
            :jsonData="jsonData"
            :jsonDataShow="jsonDataShow"
            :clickCoordinates="clickCoordinates"
            :mapName="mapName"
            @addItemToSection="addItemToSection"
            @setItemPosition="setItemPosition"
            @updateItem="updateItem"
            @updateShowData="updateShowData"
            @updateAllItemShowData="updateAllItemShowData"
            @deleteItem="deleteItem"
        />
        <EurekaCanvas
            v-if="!loading"
            :canvasImage="image"
            :gridSizeInPixels="gridSizeInPixels"
            :coordinatesOffset="coordinatesOffset"
            :positions="positions"
            :maximumZoom="maximumZoom"
            @click="canvasClick"
            @clickedElement="clickedElement"
        />
    </div>
</template>

<script>
    import Vue from 'vue'
    import { v4 as uuidv4 } from 'uuid'
    import EurekaCanvas from 'eureka-canvas'
    import MapDataEditor from './MapDataEditor'

    export default {
        name: 'editor',
        components: {
            MapDataEditor,
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
                image: null,
                clickCoordinates: { x: 0, y: 0 },
                icons: {},
                jsonDataShow: {},
                loading: true,
                addToSectionKey: null,
                setPositionToItem: null
            }
        },
        async created() {
            this.image = await this.loadImage(this.imageSource)
            await this.loadIcons()
            this.loading = false
        },
        computed: {
            positions() {
                const pos = []
                if (!this.loading) {
                    this.sortedKeys.forEach(key => {
                        const section = this.jsonData[key]
                        if (!(this.jsonDataShow.hasOwnProperty(key) && this.jsonDataShow[key].hasOwnProperty('showOnMap') && this.jsonDataShow[key].showOnMap === false)) {
                            for (const item of section.items) {
                                if (!(this.jsonDataShow.hasOwnProperty(item.id) && this.jsonDataShow[item.id].hasOwnProperty('showOnMap') && this.jsonDataShow[item.id].showOnMap === false)) {
                                    let multiple = false
                                    let coordinates = item.position
                                    if (Array.isArray(item.position)) {
                                        multiple = item.position.length > 1
                                        coordinates = item.position[0]
                                    }

                                    let itemObj = {
                                        id: item.id,
                                        key: key,
                                        label: item.name,
                                        coordinates: coordinates,
                                        icons: []
                                    }

                                    // i'll turn this into a more fancy thing later
                                    switch (key) {
                                        case 'monsters':
                                            if (!this.icons.hasOwnProperty(item.element)) {
                                                itemObj.icons.push({ image: this.icons.noelement })
                                            } else {
                                                itemObj.icons.push({ image: this.icons[item.element] })
                                            }
                                            break;
                                        case 'fates':
                                            itemObj.icons.push({ image: this.icons.fate })
                                            if (!this.icons.hasOwnProperty(item.element)) {
                                                itemObj.icons.push({ image: this.icons.noelement })
                                            } else {
                                                itemObj.icons.push({ image: this.icons[item.element] })
                                            }
                                            break;
                                        case 'quests':
                                            itemObj.icons.push({ image: this.icons.quest })
                                            break;
                                        case 'aethernet':
                                            itemObj.icons.push({ image: this.icons.aetheryte })
                                            break;
                                        case 'elementals':
                                            itemObj.icons.push({ image: this.icons.blessing })
                                            break;
                                        case 'lockboxes':
                                            itemObj.icons.push({ image: this.icons.lock })
                                            break;
                                        case 'enemies':
                                            itemObj.icons.push({ image: this.icons.rank[item.level] ? this.icons.rank[item.level] : this.icons.noelement })
                                            break;
                                        case 'skirmishes':
                                            if (item.hasOwnProperty('icon') && this.icons.skirmishes[item.icon]) {
                                                itemObj.icons.push({ image: this.icons.skirmishes[item.icon] })
                                            } else {
                                                itemObj.icons.push({ image: this.icons.fate })
                                            }
                                            break;
                                        case 'engagements':
                                            if (item.hasOwnProperty('icon') && this.icons.engagements[item.icon]) {
                                                itemObj.icons.push({ image: this.icons.engagements[item.icon] })
                                            } else {
                                                itemObj.icons.push({ image: this.icons.fate })
                                            }
                                            break;
                                        default:
                                            itemObj.icons.push({ image: this.icons.noelement })
                                            break;
                                    }

                                    pos.push(itemObj)

                                    if (multiple) {
                                        item.position.slice(1).forEach(position => {
                                            let multiItem = Object.assign({}, itemObj)
                                            multiItem.coordinates = position
                                            pos.push(multiItem)
                                        });
                                    }
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
            addNewItemSelectedName() {
                if (this.addToSectionKey !== null) {
                    return this.jsonData[this.addToSectionKey].name
                } else if (this.setPositionToItem !== null) {
                    return `${this.jsonData[this.setPositionToItem.section].name} - ${this.setPositionToItem['id']}`
                }
                return ''
            },
            showAddNewItemBanner() {
                return this.addToSectionKey !== null || this.setPositionToItem !== null
            }
        },
        methods: {
            canvasClick(evt) {
                this.clickCoordinates = evt.coordinates
                if (this.addToSectionKey !== null) {
                    const newItem = Object.assign({}, this.jsonData[this.addToSectionKey].baseItem)
                    newItem.position = this.clickCoordinates
                    newItem.id = uuidv4()
                    this.jsonData[this.addToSectionKey].items.push(newItem)
                    this.addToSectionKey = null
                }

                if (this.setPositionToItem !== null) {
                    const index = this.jsonData[this.setPositionToItem.section].items.findIndex((item) => {
                        return item.id == this.setPositionToItem.id
                    })
                    if (Array.isArray(this.jsonData[this.setPositionToItem.section].items[index].position)) {
                        Vue.set(this.jsonData[this.setPositionToItem.section].items[index].position, this.setPositionToItem.index, this.clickCoordinates)
                    } else {
                        this.jsonData[this.setPositionToItem.section].items[index].position = [this.clickCoordinates]
                    }
                    this.setPositionToItem = null
                }
            },
            addItemToSection(sectionKey) {
                this.addToSectionKey = sectionKey
                this.setPositionToItem = null
            },
            setItemPosition(setPositionToItem) {
                this.setPositionToItem = setPositionToItem
                this.addToSectionKey = null
            },
            cancelAddNewItem() {
                this.addToSectionKey = null
                this.setPositionToItem = null
            },
            updateItem(sectionKey, newItem) {
                const index = this.jsonData[sectionKey].items.findIndex(item => {
                    return item.id === newItem.id
                })
                if (index !== -1) {
                    this.jsonData[sectionKey].items.splice(index, 1, newItem);
                }
            },
            updateShowData(sectionKey, showKey, value) {
                let newShowData = Object.assign({}, this.jsonDataShow)
                let newShowKeyData = {}
                if (newShowData.hasOwnProperty(sectionKey)) {
                    newShowKeyData = Object.assign(newShowData[sectionKey], { [showKey]: value })
                } else {
                    newShowKeyData = { [showKey]: value }
                }
                newShowData[sectionKey] = newShowKeyData
                this.jsonDataShow = newShowData
            },
            updateAllItemShowData(sectionKey, showKey, value) {
                let newShowData = Object.assign({}, this.jsonDataShow)
                this.jsonData[sectionKey].items.forEach(item => {
                    let newShowKeyData = {}
                    if (newShowData.hasOwnProperty(item.id)) {
                        newShowKeyData = Object.assign(newShowData[item.id], { [showKey]: value })
                    } else {
                        newShowKeyData = { [showKey]: value }
                    }
                    newShowData[item.id] = newShowKeyData
                })
                this.jsonDataShow = newShowData
            },
            deleteItem(sectionKey, itemId) {
                const index = this.jsonData[sectionKey].items.findIndex(item => {
                    return item.id === itemId
                })
                if (index !== -1) {
                    this.jsonData[sectionKey].items.splice(index, 1);
                }
            },
            clickedElement(item) {
                if (this.jsonDataShow.hasOwnProperty(item.key) && !this.jsonDataShow[item.key].expanded) {
                    // the category is closed open it back up
                    this.jsonDataShow[item.key].expanded = true
                }

                Vue.nextTick(() => {
                    let itemContainer = document.getElementById(item.id)
                    if (itemContainer) {
                        document.getElementById('mapDataList').scrollTop = itemContainer.offsetTop
                    }
                })
            },
            async loadIcons() {
                this.icons.noelement = await this.loadImage(require('@/assets/images/icons/elements/noelement.png'))
                this.icons.fire = await this.loadImage(require('@/assets/images/icons/elements/fire2.png'))
                this.icons.wind = await this.loadImage(require('@/assets/images/icons/elements/wind2.png'))
                this.icons.water = await this.loadImage(require('@/assets/images/icons/elements/water2.png'))
                this.icons.lightning = await this.loadImage(require('@/assets/images/icons/elements/lightning2.png'))
                this.icons.ice = await this.loadImage(require('@/assets/images/icons/elements/ice2.png'))
                this.icons.earth = await this.loadImage(require('@/assets/images/icons/elements/earth2.png'))
                this.icons.quest = await this.loadImage(require('@/assets/images/icons/quest.png'))
                this.icons.adaptation = await this.loadImage(require('@/assets/images/icons/adaptation.png'))
                this.icons.mutation = await this.loadImage(require('@/assets/images/icons/mutation.png'))
                this.icons.aetheryte = await this.loadImage(require('@/assets/images/icons/aetheryte.png'))
                this.icons.fate = await this.loadImage(require('@/assets/images/icons/fate.png'))
                this.icons.blessing = await this.loadImage(require('@/assets/images/icons/blessing.png'))
                this.icons.lock = await this.loadImage(require('@/assets/images/icons/lock.png'))
                this.icons.rank = []
                this.icons.rank[0] = await this.loadImage(require('@/assets/images/icons/ranks/0.png'))
                this.icons.rank[1] = await this.loadImage(require('@/assets/images/icons/ranks/1.png'))
                this.icons.rank[2] = await this.loadImage(require('@/assets/images/icons/ranks/2.png'))
                this.icons.rank[3] = await this.loadImage(require('@/assets/images/icons/ranks/3.png'))
                this.icons.rank[4] = await this.loadImage(require('@/assets/images/icons/ranks/4.png'))
                this.icons.rank[5] = await this.loadImage(require('@/assets/images/icons/ranks/5.png'))
                this.icons.engagements = {}
                this.icons.engagements.boss = await this.loadImage(require('@/assets/images/icons/engagements/boss.png'))
                this.icons.engagements.duel = await this.loadImage(require('@/assets/images/icons/engagements/duel.png'))
                this.icons.skirmishes = {}
                this.icons.skirmishes.boss = await this.loadImage(require('@/assets/images/icons/skirmishes/boss.png'))
                this.icons.skirmishes.defend = await this.loadImage(require('@/assets/images/icons/skirmishes/defend.png'))
                this.icons.skirmishes.gather = await this.loadImage(require('@/assets/images/icons/skirmishes/gather.png'))
                this.icons.skirmishes.slay = await this.loadImage(require('@/assets/images/icons/skirmishes/slay.png'))
            },
            loadImage: url => new Promise(resolve => {
                let img = new Image()
                img.onload = () => resolve(img)
                img.src = url
            })
        }
    }
</script>