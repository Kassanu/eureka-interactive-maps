<template>
    <div>
        <div>
            <span class="font-bold">Rank:</span> {{ item.level }}
        </div>
        <div>
            <Coordinates :positions="item.position"></Coordinates>
        </div>
        <div>
            <Drops :drops="item.drops"></Drops>
        </div>
    </div>
</template>

<script>
    import Coordinates from './Coordinates'
    import Drops from './Drops'

    export default {
        name: 'enemy-item-information',
        components: {
            Coordinates,
            Drops
        },
        props: {
            item: {
                type: Object,
                required: true
            }
        }
    }
</script>