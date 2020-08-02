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
        name: 'view-pagos',
        components: {
            Viewer
        },
        data() {
            return {
                mapName: 'pagos',
                gridSizeInPixels: 50,
                coordinatesOffset: 1,
                maximumZoom: 150,
                imageSource: require('@/assets/images/maps/pagos.jpg'),
                jsonData: require('@/assets/zoneJson/pagos.json'),
                filters: require('@/assets/filters/eureka.json')
            }
        }
    }
</script>
