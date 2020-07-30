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
        name: 'edit-pagos',
        components: {
            Editor
        },
        data() {
            return {
                mapName: 'pagos',
                gridSizeInPixels: 50,
                coordinatesOffset: 1,
                maximumZoom: 150,
                image: require('@/assets/images/maps/pagos.jpg'),
                jsonData: require('@/assets/zoneJson/pagos.json')
            }
        }
    }
</script>
