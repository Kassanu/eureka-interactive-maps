<template>
    <Viewer
        :imageSource="imageSource"
        :jsonData="jsonData"
        :pFilters="filters"
        :mapName="mapName"
        :gridSizeInPixels="50"
        :coordinatesOffset="1"
        :maximumZoom="150"
    ></Viewer>
</template>

<script>
    import Viewer from '@/components/Viewer/Viewer'

    export default {
        name: 'view-pyros',
        components: {
            Viewer
        },
        data() {
            return {
                mapName: 'pyros',
                gridSizeInPixels: 50,
                coordinatesOffset: 1,
                maximumZoom: 150,
                imageSource: require('@/assets/images/maps/pyros.jpg'),
                jsonData: require('@/assets/zoneJson/pyros.json'),
                filters: require('@/assets/filters/eureka.json')
            }
        }
    }
</script>
