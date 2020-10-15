<template>
    <SectionItem v-bind="$props" v-on="$listeners">
        <form>
            <div class="flex flex-wrap -mx-3 mb-2">
                <div class="w-full md:w-1/2 px-3">
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
                    <div class="w-full md:w-1/2 px-3">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Level
                        </label>
                        <input :value="item.level" @change="updateLevel"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                            type="number">
                    </div>
                    <div class="w-full md:w-1/2 px-3">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Ashkin
                        </label>
                        <input :checked="item.ashkin" @change="updateAshkin"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                            type="checkbox">
                    </div>
                    <div class="w-full md:w-1/2 px-3">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Elemental
                        </label>
                        <input :checked="item.elemental" @change="updateElemental"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                            type="checkbox">
                    </div>
                    <div class="w-full md:w-1/2 px-3">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Fauna
                        </label>
                        <input :checked="item.fauna" @change="updateFauna"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                            type="checkbox">
                    </div>
                    <div class="w-full md:w-1/2 px-3">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Machine
                        </label>
                        <input :checked="item.machina" @change="updateMachine"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full"
                            type="checkbox">
                    </div>
                    <Positions :positions="item.position" @updatePosition="updatePosition" @addPosition="addPosition" @setItemPosition="setItemPosition" :multiple="true" class="w-full md:w-1/2 px-3"></Positions>
                    <div class="flex w-full md:w-1/2 px-3 mb-3">
                        <div class="w-1/3 px-3">
                            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Aggro
                            </label>
                            <select :value="item.aggro" @change="updateAggro"
                                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline mr-2">
                                <option value=''>None</option>
                                <option value='sight'>Sight</option>
                                <option value='sound'>Sound</option>
                                <option value='magic'>Magic</option>
                            </select>
                        </div>
                        <div class="w-1/3 px-3">
                            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Attack
                            </label>
                            <select :value="item.attack" @change="updateAttack"
                                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline mr-2">
                                <option value=''>Both</option>
                                <option value='physical'>Physical</option>
                                <option value='magical'>Magical</option>
                            </select>
                        </div>
                        <div class="w-1/3 px-3">
                            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Weakness
                            </label>
                            <select :value="item.weakness" @change="updateWeakness"
                                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline mr-2">
                                <option value=''>None</option>
                                <option value='physical'>Physical</option>
                                <option value='magical'>Magical</option>
                            </select>
                        </div>
                    </div>
                    <Drops :drops="item.drops" @updateDrops="updateDrops" @addDrop="addDrop" class="w-full md:w-1/2 px-3"></Drops>
                </div>
            </div>
        </form>
    </SectionItem>
</template>

<script>
    import SectionItem from './SectionItem'
    import Positions from './Positions'
    import Drops from './Drops'
    import SectionItemMixin from './sectionitem.mixin'

    export default {
        name: 'Enemies',
        components: {
            SectionItem,
            Positions,
            Drops
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
