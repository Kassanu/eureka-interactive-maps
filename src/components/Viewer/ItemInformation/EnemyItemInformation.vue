<template>
    <div>
        <div>
            <span class="font-bold">Rank:</span> {{ item.level }}
        </div>
        <div>
            <Coordinates :positions="item.position"></Coordinates>
        </div>
        <div>
            <span class="font-bold">Aggro:</span> {{ aggro }}
        </div>
        <div>
            <span class="font-bold">Attack:</span> {{ attack }}
        </div>
        <div>
            <span class="font-bold">Weakness:</span> {{ weakness }}
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
        },
        computed: {
            aggro() {
                let agg = 'None'
                switch (this.item.aggro) {
                    case 'sight':
                        agg = 'Sight'
                        break
                    case 'sound':
                        agg = 'Sound'
                        break
                    case 'magic':
                        agg = 'Magic'
                        break
                }
                return agg
            },
            attack() {
                let att = 'Both'
                switch (this.item.attack) {
                    case 'phyiscal':
                        att = 'Physical'
                        break
                    case 'magical':
                        att = 'Magic'
                        break
                }
                return att
            },
            weakness() {
                let weak = 'None'
                switch (this.item.weakness) {
                    case 'phyiscal':
                        weak = 'Physical'
                        break
                    case 'magical':
                        weak = 'Magic'
                        break
                }
                return weak
            }
        }
    }
</script>