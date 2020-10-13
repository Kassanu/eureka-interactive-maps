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
                            Position
                        </label>
                        <input :value="formatedPosition" @change="updatePosition"
                            class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
                            :class="{'border-gray-400': !positionError, 'border-red-400': positionError}" type="text"
                            placeholder="(X, Y)">
                    </div>
                </div>
            </div>
        </form>
    </SectionItem>
</template>

<script>
    import SectionItem from './SectionItem'
    import SectionItemMixin from './sectionitem.mixin'

    export default {
        name: 'Generic',
        components: {SectionItem},
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
