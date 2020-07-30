<template>
    <div id="editorContainer" class="flex flex-col">
        <div class="flex justify-end mt-1 mb-2 px-2">
            <input v-model="searchValue" placeholder="Search by Name or ID" class="px-2 py-1 mr-2 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full" type="text">
            <button
                @click="saveJson"
                class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                Save
            </button>
        </div>
        <div class="flex-grow overflow-y-scroll">
            <component
                :is="'Section'"
                v-for="(section, index) in jsonData"
                :key="index"
                :section="section"
                :jsonDataShow="jsonDataShow"
                :searchValue="searchValue"
                @addToSection="addItemToSection"
                @setItemPosition="setItemPosition"
                @updateItem="updateItem"
                @updateShowData="updateShowData"
                @updateItemShowData="updateItemShowData"
                @deleteItem="deleteItem"
            />
        </div>
    </div>
</template>

<script>
    import Section from './Section'

    export default {
        name: 'MapDataEditor',
        components: {
            Section
        },
        props: {
            jsonData: {
                type: Object,
                required: true
            },
            jsonDataShow: {
                type: Object,
                required: true
            },
            clickCoordinates: {
                type: Object,
                required: true,
                validator: (value) => {
                    return value.hasOwnProperty('x') && value.hasOwnProperty('y')
                }
            },
            mapName: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                searchValue: ''
            }
        },
        methods: {
            addItemToSection (evt) {
                this.$emit('addItemToSection', evt.key)
            },
            setItemPosition (evt) {
                this.$emit('setItemPosition', evt)
            },
            updateItem(sectionKey, newItem) {
                this.$emit('updateItem', sectionKey, newItem)
            },
            updateShowData(sectionKey, showKey, value) {
                this.$emit('updateShowData', sectionKey, showKey, value)
            },
            updateItemShowData(itemId, showKey, value) {
                this.$emit('updateShowData', itemId, showKey, value)
            },
            deleteItem(sectionKey, itemId) {
                this.$emit('deleteItem', sectionKey, itemId)
            },
            saveJson() {
                let a = document.createElement("a");
                let file = new Blob([JSON.stringify(this.jsonData)], {type: 'application/json'});
                a.href = URL.createObjectURL(file);
                a.download = `${this.mapName}.json`;
                a.click();
            }
        }
    }
</script>

<style>
</style>