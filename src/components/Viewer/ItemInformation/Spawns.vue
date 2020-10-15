<template>
    <div class="flex">
        <div class="font-bold mr-2 flex-shrink-0">Spawn Conditions:</div> 
        <div>
            <div v-for="(spawn, index) in spawns" :key="`${spawn.type}-${index}`" v-html="format(spawn)"></div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'spawns',
        props:{
            spawns: {
                type: Array,
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
        methods: {
            format(spawn) {
                let value = ''

                switch (spawn.type) {
                    case 'time':
                        value = this.formatTime(spawn)
                        break
                    case 'enemy':
                        value = this.formatEnemy(spawn)
                        break
                    case 'skirmish':
                        value = this.formatSkirmish(spawn)
                        break
                }

                return value
            },
            formatTime(spawn) {
                return new Date(spawn.value * 1000).toISOString().substr(11, 8)
            },
            formatEnemy(spawn) {
                let enemy = this.enemies.find(enemy => enemy.id == spawn.value)

                if (!enemy) {
                    return `Enemy ID '${spawn.value}' not found`
                }
                let enemyPosition = '(0, 0)'

                if (Array.isArray(enemy.position)) {
                    enemyPosition = `(${enemy.position[0].x}, ${enemy.position[0].y})`
                } else {
                    enemyPosition = `(${enemy.position.x}, ${enemy.position.y})`
                }

                return `Kill: ${enemy.name} ${enemyPosition}`
            },
            formatSkirmish(spawn) {
                let skirmish = this.skirmishes.find(skirmish => skirmish.id == spawn.value)

                if (!skirmish) {
                    return `Skirmish ID '${spawn.value}' not found`
                }

                let skirmishPosition = '(0, 0)'

                if (Array.isArray(skirmish.position)) {
                    skirmishPosition = `(${skirmish.position[0].x}, ${skirmish.position[0].y})`
                } else {
                    skirmishPosition = `(${skirmish.position.x}, ${skirmish.position.y})`
                }

                return `Complete: ${skirmish.name} ${skirmishPosition}`
            }
        }
    }
</script>