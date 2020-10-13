<template>
    <div>
        <Coordinates :positions="item.position"></Coordinates>
    </div>
</template>

<script>
    import Coordinates from './ItemInformation/Coordinates'

    export default {
        name: 'default-item-information',
        components: {
            Coordinates
        },
        props:{
            item: {
                type: Object,
                required: true
            }
        },
        computed: {
            positions() {
                return Array.isArray(this.item.position) ? this.item.position : [this.item.position]
            }
        }
    }
</script>