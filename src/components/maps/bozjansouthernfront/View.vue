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
        name: 'view-bozjansouthernfront',
        components: {
            Viewer
        },
        data() {
            return {
                mapName: 'bozjansouthernfront',
                gridSizeInPixels: 50,
                coordinatesOffset: 1,
                maximumZoom: 150,
                imageSource: require('@/assets/images/maps/bozjansouthernfront.jpg'),
                jsonData: require('@/assets/zoneJson/bozjansouthernfront.json'),
                filters: require('@/assets/filters/bozjansouthernfront.json')
            }
        }
    }
</script>
