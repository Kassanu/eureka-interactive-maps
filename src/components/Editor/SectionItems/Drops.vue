<template>
    <div>
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Drops <span @click="$emit('addDrop')"><font-awesome-icon icon="plus" class="cursor-pointer" title="Add new drop" /></span>
        </label>
        <div v-for="(drop, index) in drops" :key="index" class="flex flex-wrap -mx-3">
            <div class="w-full inline-flex md:w-1/3 px-3 mb-6 md:mb-0">
                <input :value="drop.name" @change="updateName($event, index)"
                    class="px-2 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded-l text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
                    type="text">
                <input :value="drop.amount" @change="updateAmount($event, index)"
                    class="px-2 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded-l text-sm border outline-none focus:outline-none focus:shadow-outline"
                    type="number">
                    <button @click="deleteDrop(index)" class="bg-red-500 hover:bg-red-700 text-white font-bold px-2 ml-2 rounded">
                        <font-awesome-icon icon="times" class="cursor-pointer" />
                    </button>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'Drops',
        props: {
            drops: {
                type: Array,
                required: true
            }
        },
        methods: {
            updateName: function (evt, index) {
                this.updateDrops(index, 'name', evt.target.value)
            },
            updateAmount: function (evt, index) {
                this.updateDrops(index, 'amount', parseInt(evt.target.value))
            },
            updateDrops: function (index, key, value) {
                let newDrops = [...this.drops]
                console.log(JSON.stringify(newDrops))
                console.log(key)
                console.log(value)
                newDrops[index][key] = value
                this.$emit('updateDrops', newDrops)
            },
            deleteDrop: function (index) {
                this.$emit('updateDrops', this.drops.slice(0,index).concat(this.drops.slice(index+1)))
            }
        }
    }
</script>