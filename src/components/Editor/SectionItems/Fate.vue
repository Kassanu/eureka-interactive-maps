<template>
    <SectionItem v-bind="$props" v-on="$listeners">
        <form class="w-full max-w-lg">
            <div class="flex flex-wrap -mx-3 mb-2">
                <div class="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                        ID
                    </label>
                    <input :value="item.id"
                        class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                        type="text" readonly>
                </div>
                <div class="w-full md:w-1/2 px-3">
                    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                        Name
                    </label>
                    <input :value="item.name" @change="updateName"
                        class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                        type="text">
                </div>
            </div>
            <div v-show="expanded">
                <div class="flex flex-wrap -mx-3 mb-2">
                    <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Level
                        </label>
                        <input :value="item.level" @change="updateLevel"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                            type="number">
                    </div>
                    <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Element
                        </label>
                        <div class="relative">
                            <select :value="item.element" @change="updateElement"
                                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full">
                                <option value='' disabled></option>
                                <option value='fire'>Fire</option>
                                <option value='earth'>Earth</option>
                                <option value='lightning'>Lightning</option>
                                <option value='water'>Water</option>
                                <option value='wind'>Wind</option>
                                <option value='ice'>Ice</option>
                            </select>
                        </div>
                    </div>
                    <Positions :positions="item.position" @updatePosition="updatePosition" @addPosition="addPosition" @setItemPosition="setItemPosition" :multiple="false" class="w-full md:w-1/2 px-3"></Positions>
                </div>
                <div class="flex flex-wrap -mx-3 mb-2">
                    <div class="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Weather
                        </label>
                        <select :value="item.weather" @change="updateWeather"
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
                </div>
                <div class="mb-2">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                        Boss
                    </label>
                    <div class="flex flex-wrap -mx-3">
                        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Name
                            </label>
                            <input :value="item.boss.name" @change="updateBoss($event, 'name')"
                                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                                type="text">
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </SectionItem>
</template>

<script>
    import SectionItem from './SectionItem'
    import SectionItemMixin from './sectionitem.mixin'
    import Positions from './Positions'

    export default {
        name: 'Fate',
        components: {
            SectionItem,
            Positions
        },
        mixins: [SectionItemMixin],
        props: {
            item: {
                type: Object,
                required: true
            },
            sectionKey: {
                type: String,
                required: true
            },
            jsonDataShow: {
                type: Object,
                required: true
            }
        }
    }
</script>