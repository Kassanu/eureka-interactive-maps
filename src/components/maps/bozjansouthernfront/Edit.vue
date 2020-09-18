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
        name: 'edit-bozjansouthernfront',
        components: {
            Editor
        },
        data() {
            return {
                mapName: 'bozjansouthernfront',
                gridSizeInPixels: 50,
                coordinatesOffset: 1,
                maximumZoom: 150,
                imageSource: require('@/assets/images/maps/bozjansouthernfront.jpg'),
                jsonData: require('@/assets/zoneJson/bozjansouthernfront.json')
            }
        }
    }
</script>
