<template>
    <div id="edit">
        <Editor
            :imageSource="imageSource"
            :jsonData="jsonData"
            :mapName="mapName"
            :gridSizeInPixels="50"
            :coordinatesOffset="1"
            :maximumZoom="150"
        ></Editor>
    </div>
</template>

<script>
    import Editor from '@/components/Editor/Editor'

    export default {
        name: 'edit-anemos',
        components: {
            Editor
        },
        data() {
            return {
                mapName: 'anemos',
                gridSizeInPixels: 50,
                coordinatesOffset: 1,
                maximumZoom: 150,
                imageSource: require('@/assets/images/maps/anemos.jpg'),
                jsonData: require('@/assets/zoneJson/anemos.json')
            }
        }
    }
</script>
