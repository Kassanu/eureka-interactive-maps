<template>
    <div>
        <div>
            <span class="font-bold">Level:</span> {{ item.level }}
        </div>
        <div>
            <span class="font-bold">Element:</span> {{ element }}
        </div>
        <div>
            <Coordinates :positions="item.position"></Coordinates>
        </div>
        <div v-if="item.boss">
            <span class="font-bold">Boss:</span> {{ item.boss.name }}
        </div>
        <div v-if="item.weather">
            <span class="font-bold">Weather:</span> {{ weather[item.weather] }}
        </div>
        <div>
            <span class="font-bold">Spawns Fate:</span> {{ monster }}
        </div>
    </div>
</template>

<script>
    import Coordinates from './ItemInformation/Coordinates'

    export default {
        name: 'fate-item-information',
        components: {
            Coordinates
        },
        props: {
            item: {
                type: Object,
                required: true
            },
            monsters: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                weather: {
                    fairskies: 'Fair Skies',
                    heatwave: 'Heat Wave',
                    snow: 'Snow',
                    blizzard: 'Blizzard',
                    showers: 'Showers',
                    thunderstorm: 'Thunderstorm',
                    fog: 'Fog',
                    umbralwind: 'Umbral Wind',
                    gales: 'Gales',
                    gloom: 'Gloom'
                }
            }
        },
        computed: {
            element() {
                return this.item.element.charAt(0).toUpperCase() + this.item.element.slice(1)
            },
            monster() {
                const monster = this.monsters.find(monster => {
                    return this.item.id == monster.fate.fateId
                })
                if (monster) {
                    return `${monster.name} (${monster.position.x}, ${monster.position.y})`
                }

                return ''
            }
        }
    }
</script>