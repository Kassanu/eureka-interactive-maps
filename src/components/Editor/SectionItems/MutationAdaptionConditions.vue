<template>
    <div>
        <div v-for="(condition, index) in conditions" :key="index" class="flex flex-wrap -mx-3">
            <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0" :class="bgClass">
                <select :value="condition.weather" @change="changeCondition($event, 'weather', index)"
                    class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full">
                    <option value='fairskies'>Fair Skies</option>
                    <option value='heatwave'>Heat Wave</option>
                    <option value='snow'>Snow</option>
                    <option value='blizzard'>Blizzard</option>
                    <option value='showers'>Showers</option>
                    <option value='thunderstorm'>Thunderstorm</option>
                    <option value='fog'>Fog</option>
                    <option value='umbralwind'>Umbral Wind</option>
                    <option value='gales'>Gales</option>
                    <option value='gloom'>Gloom</option>
                </select>
            </div>
            <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0" :class="bgClass">
                <select :value="condition.time" @change="changeCondition($event, 'time', index)"
                    class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full">
                    <option value='day'>Day</option>
                    <option value='night'>Night</option>
                </select>
            </div>
            <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0" :class="bgClass">
                <button @click="$emit('deleteCondition', type, index)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    <font-awesome-icon icon="times" class="cursor-pointer" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'MutationAdaptionConditions',
        props: {
            conditions: {
                type: Array,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            bgClass: {
                type: String,
                required: true
            }
        },
        methods: {
            changeCondition(evt, key, index) {
                let newConditions = Array.from(this.conditions)
                newConditions[index][key] = evt.target.value

                this.$emit('changeConditions', this.type, newConditions)
            }
        }
    }
</script>