<template>
    <Editor
        :imageSource="imageSource"
        :jsonData="jsonData"
        :mapName="mapName"
        :gridSizeInPixels="50"
        :coordinatesOffset="1"
        :maximumZoom="150"
    ></Editor>
</template>

<script>
    import Editor from '@/components/Editor/Editor'

    export default {
        name: 'edit-pyros',
        components: {
            Editor
        },
        data() {
            return {
                mapName: 'pyros',
                gridSizeInPixels: 50,
                coordinatesOffset: 1,
                maximumZoom: 150,
                imageSource: require('@/assets/images/maps/pyros.jpg'),
                jsonData: require('@/assets/zoneJson/pyros.json')
            }
        }
    }
</script>
