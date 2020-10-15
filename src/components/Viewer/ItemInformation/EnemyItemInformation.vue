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
        <div>
            <Spawns :spawns="item.spawns" :enemies="enemies" :skirmishes="skirmishes"></Spawns>
        </div>
    </div>
</template>

<script>
    import Coordinates from './Coordinates'
    import Drops from './Drops'
    import Spawns from './Spawns'

    export default {
        name: 'enemy-item-information',
        components: {
            Coordinates,
            Drops,
            Spawns
        },
        props: {
            item: {
                type: Object,
                required: true
            },
            enemies: {
                type: Array,
                required: true
            },
            skirmishes: {
                type: Array,
                required: true
            }
        }
    }
</script>