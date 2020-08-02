<template>
    <div>
        <div>
            <span class="font-bold">Level:</span> {{ item.level }}
        </div>
        <div>
            <span class="font-bold">Element:</span> {{ element }}
        </div>
        <div>
            <span class="font-bold">Coordinates:</span> ({{ item.position.x }}, {{ item.position.y }})
        </div>
        <div v-if="item.fate.forFate">
            <span class="font-bold">Spawns Fate:</span> {{ fate }}
        </div>
        <div v-if="item.mutation.canMutate">
            <span class="font-bold">Mutated Element:</span> {{ mutatedElement }}<br>
            <span class="font-bold">Mutation Condtions:</span>
            <div class="pl-3" v-html="mutateConditions"></div>
        </div>
        <div v-if="item.adaptation.canAdapt">
            <span class="font-bold">Adaptation Condtions:</span>
            <div class="pl-3" v-html="adaptConditions"></div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'monster-item-information',
        props: {
            item: {
                type: Object,
                required: true
            },
            fates: {
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
            adaptConditions() {
                const conditions = {}
                this.item.adaptation.conditions.forEach(condition => {
                    if (!conditions.hasOwnProperty(condition.weather)) {
                        conditions[condition.weather] = []
                    }

                    conditions[condition.weather].push(condition.time.charAt(0).toUpperCase() + condition.time.slice(1))
                })
                let conditionString = ''
                Object.keys(conditions).forEach((key) => {
                    conditionString += `<div><span class="font-bold">${this.weather[key]}:</span> ${conditions[key].sort().join('/')}</div>`
                })

                return conditionString
            },
            mutateConditions() {
                const conditions = {}
                this.item.mutation.conditions.forEach(condition => {
                    if (!conditions.hasOwnProperty(condition.weather)) {
                        conditions[condition.weather] = []
                    }

                    conditions[condition.weather].push(condition.time.charAt(0).toUpperCase() + condition.time.slice(1))
                })
                let conditionString = ''
                Object.keys(conditions).forEach((key) => {
                    conditionString += `<div><span class="font-bold">${this.weather[key]}:</span> ${conditions[key].sort().join('/')}</div>`
                })

                return conditionString
            },
            element() {
                return this.item.element.charAt(0).toUpperCase() + this.item.element.slice(1)
            },
            mutatedElement() {
                return this.item.mutation.element.charAt(0).toUpperCase() + this.item.mutation.element.slice(1)
            },
            fate() {
                if (this.item.fate.fateId == '') {
                    return ''
                }

                const fate = this.fates.find(fate => {
                    return fate.id == this.item.fate.fateId
                })

                return `${fate.name} (${fate.position.x}, ${fate.position.y})`
            }
        }
    }
</script>