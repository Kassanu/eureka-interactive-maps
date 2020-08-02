<template>
    <div class="p-2 rounded overflow-hidden shadow-md">
        <div class="mb-2">
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <input :checked="filters.ashkin" @change="updateFilters($event, 'ashkin')" id="ashkinCheckbox" class="mr-2 leading-tight" type="checkbox">
                    <label for="ashkinCheckbox" class="text-gray-700 text-sm font-bold">
                        Ashkin
                    </label>
                </div>
                <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <input :checked="filters.sprite" @change="updateFilters($event, 'sprite')" id="spriteCheckbox" class="mr-2 leading-tight" type="checkbox">
                    <label for="spriteCheckbox" class="text-gray-700 text-sm font-bold">
                        Sprite
                    </label>
                </div>
            </div>
        </div>
        <div class="mb-2">
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <input :checked="filters.fate" @change="updateFilters($event, 'fate')" id="fateCheckbox" class="mr-2 leading-tight" type="checkbox">
                    <label for="fateCheckbox" class="text-gray-700 text-sm font-bold">
                        FATE
                    </label>
                </div>
                <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                        Aggro
                    </label>
                    <div class="inline-block relative w-full">
                        <select :value="filters.aggro" @change="updateFilters($event, 'aggro')" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="">Any</option>
                            <option value='sight'>Sight</option>
                            <option value='truesight'>Truesight</option>
                            <option value='magic'>Magic</option>
                            <option value='sound'>Sound</option>
                            <option value='blood'>Blood</option>
                        </select>
                        <div class="pointer-events-none absolute flex items-center px-2 text-gray-700 inset-y-0 right-0">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mb-2">
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <input :checked="filters.mutates" @change="updateFilters($event, 'mutates')" id="mutationCheckbox" class="mr-2 leading-tight" type="checkbox">
                    <label for="mutationCheckbox" class="text-gray-700 text-sm font-bold">
                        Mutates
                    </label>
                </div>
                <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <input :checked="filters.adapts" @change="updateFilters($event, 'adapts')" id="adaptationCheckbox" class="mr-2 leading-tight" type="checkbox">
                    <label for="adaptationCheckbox" class="text-gray-700 text-sm font-bold">
                        Adapts
                    </label>
                </div>
            </div>
        </div>
        <div class="mb-2">
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label title="Mutation/Adaptation Weather" class="block text-gray-700 text-sm font-bold mb-2" for="username">
                        Weather
                    </label>
                    <div class="inline-block relative w-full">
                        <select :value="filters.maweather" @change="updateFilters($event, 'maweather')" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="">Any</option>
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
                        <div class="pointer-events-none absolute flex items-center px-2 text-gray-700 inset-y-0 right-0">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label title="Mutation/Adaptation Time" class="block text-gray-700 text-sm font-bold mb-2" for="username">
                        Time
                    </label>
                    <div class="inline-block relative w-full">
                        <select :value="filters.matime" @change="updateFilters($event, 'matime')" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="">Any</option>
                            <option value='day'>Day</option>
                            <option value='night'>Night</option>
                        </select>
                        <div class="pointer-events-none absolute flex items-center px-2 text-gray-700 inset-y-0 right-0">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mb-2">
            <div class="flex flex-wrap -mx-3">
                <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                        Mutation Element
                    </label>
                    <div class="inline-block relative w-full">
                        <select :value="filters.mutateElement" @change="updateFilters($event, 'mutateElement')" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="">Any</option>
                            <option value='fire'>Fire</option>
                            <option value='earth'>Earth</option>
                            <option value='lightning'>Lightning</option>
                            <option value='water'>Water</option>
                            <option value='wind'>Wind</option>
                            <option value='ice'>Ice</option>
                        </select>
                        <div class="pointer-events-none absolute flex items-center px-2 text-gray-700 inset-y-0 right-0">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'monsters',
        props: {
            filters: {
                type: Object
            }
        },
        data() {
            return {
                checkboxKeys: [
                    'ashkin',
                    'sprite',
                    'fate',
                    'mutates',
                    'adapts'
                ]
            }
        },
        methods: {
            updateFilters(evt, key) {
                this.$emit('updateFilters', Object.assign(this.filters, {[key]: this.checkboxKeys.includes(key) ? event.target.checked : event.target.value}))
            }
        }
    }
</script>