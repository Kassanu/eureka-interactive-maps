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
                    <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Position
                        </label>
                        <div class="inline-flex">
                            <input :value="formatedPosition" @change="updatePosition"
                                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded-l text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
                                :class="{'border-gray-400': !positionError, 'border-red-400': positionError}"
                                type="text" placeholder="(X, Y)">
                            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 rounded-r">
                                <font-awesome-icon @click="setItemPosition" icon="plus" class="cursor-pointer" />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap -mx-3 mb-2">
                    <div class="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Aggro
                        </label>
                        <div class="relative">
                            <select :value="item.aggro" @change="updateAggro"
                                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full">
                                <option value=''></option>
                                <option value='sight'>Sight</option>
                                <option value='sound'>Sound</option>
                                <option value='magic'>Magic</option>
                            </select>
                        </div>
                    </div>

                    <div class="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Ashkin
                        </label>
                        <input :checked="item.ashkin" @input="updateAshkin"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
                            :class="{'border-gray-400': !positionError, 'border-red-400': positionError}"
                            type="checkbox">
                    </div>
                </div>

                <div class="flex flex-wrap -mx-3">
                    <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0 bg-blue-100">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Mutation
                        </label>
                        <input :checked="item.mutation.canMutate" @input="updateMutation"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
                            :class="{'border-gray-400': !positionError, 'border-red-400': positionError}"
                            type="checkbox">
                    </div>
                    <div v-if="item.mutation.canMutate" class="w-full md:w-1/3 px-3 mb-6 md:mb-0 bg-blue-100">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Mutated Element
                        </label>
                        <select :value="item.mutation.element" @change="updateMutationElement"
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
                    <div v-if="item.mutation.canMutate" class="w-full md:w-1/3 px-3 mb-6 md:mb-0 bg-blue-100">
                        <button @click="addCondition('mutation')"
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            <font-awesome-icon icon="plus" class="cursor-pointer" />
                        </button>
                    </div>
                </div>

                <MutationAdaptionConditions v-if="item.mutation.canMutate" :conditions="item.mutation.conditions"
                    :type="'mutation'" :bgClass="'bg-blue-100'" @changeConditions="changeConditions"
                    @deleteCondition="deleteCondition" />

                <div class="flex flex-wrap -mx-3 mt-2">
                    <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0  bg-green-100">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Adaptation
                        </label>
                        <input :checked="item.adaptation.canAdapt" @input="updateAdaptation"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
                            :class="{'border-gray-400': !positionError, 'border-red-400': positionError}"
                            type="checkbox">
                    </div>
                    <div v-if="item.adaptation.canAdapt" class="w-full md:w-1/3 px-3 mb-6 md:mb-0 bg-green-100">
                        <button @click="addCondition('adaptation')"
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            <font-awesome-icon icon="plus" class="cursor-pointer" />
                        </button>
                    </div>
                    <div v-if="item.adaptation.canAdapt" class="w-full md:w-1/3 px-3 mb-6 md:mb-0 bg-green-100"></div>
                </div>

                <MutationAdaptionConditions v-if="item.adaptation.canAdapt" :conditions="item.adaptation.conditions"
                    :type="'adaptation'" :bgClass="'bg-green-100'" @changeConditions="changeConditions"
                    @deleteCondition="deleteCondition" />

                <div class="flex flex-wrap -mx-3 mt-2 mb-2">
                    <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Fate
                        </label>
                        <input :checked="item.fate.forFate" @input="updateFate"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
                            :class="{'border-gray-400': !positionError, 'border-red-400': positionError}"
                            type="checkbox">
                    </div>
                    <div v-show="item.fate.forFate" class="w-full md:w-1/2 px-3">
                        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Fate
                        </label>
                        <select :value="item.fate.fateId" @change="updateForFateId"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full">
                            <option value=''></option>
                            <option v-for="fate in fates" :key="fate.id" :value="fate.id">{{ fate.name }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </form>
    </SectionItem>
</template>

<script>
    import SectionItem from './SectionItem'
    import MutationAdaptionConditions from './MutationAdaptionConditions'
    import SectionItemMixin from './sectionitem.mixin'

    export default {
        name: 'Monster',
        components: { SectionItem, MutationAdaptionConditions },
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
            },
            fates: {
                type: Array,
                required: true
            }
        },
        methods: {
            setItemPosition() {
                this.$emit('setItemPosition', {
                    section: this.sectionKey,
                    id: this.item.id
                })
            }
        }
    }
</script>