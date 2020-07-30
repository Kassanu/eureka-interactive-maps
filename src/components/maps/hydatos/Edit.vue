<template>
    <div id="edit">
        <Editor
            :image="image"
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
        name: 'edit-hydatos',
        components: {
            Editor
        },
        data() {
            return {
                mapName: 'hydatos',
                gridSizeInPixels: 50,
                coordinatesOffset: 1,
                maximumZoom: 150,
                image: require('@/assets/images/maps/hydatos.jpg'),
                jsonData: require('@/assets/zoneJson/hydatos.json')
            }
        }
    }
</script>
