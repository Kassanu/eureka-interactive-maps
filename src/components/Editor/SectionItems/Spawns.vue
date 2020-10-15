<template>
    <div>
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Spawn Conditions <span @click="$emit('addSpawn')"><font-awesome-icon icon="plus" class="cursor-pointer" title="Add new spawn to this item" /></span>
        </label>
        <div v-for="(spawn, index) in spawns" :key="index" class="flex flex-wrap -mx-3">
            <div class="w-full inline-flex md:w-1/3 px-3 mb-6 md:mb-0">
                <select :value="spawn.type" @change="updateType($event, index)"
                    class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline mr-2">
                    <option value='enemy'>Enemy</option>
                    <option value='skirmish'>Skirmish</option>
                    <option value='time'>Time</option>
                </select>
                <input :value="spawn.value" @change="updateValue($event, index)"
                    class="px-2 placeholder-gray-400 text-gray-700 border-gray-400 relative bg-white bg-white rounded-l text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
                    type="text"
                    :placeholder="valuePlaceholder(index)"
                    :title="valueTitle(index)">
                    <button @click="deleteSpawn(index)" class="bg-red-500 hover:bg-red-700 text-white font-bold px-2 ml-2 rounded">
                        <font-awesome-icon icon="times" class="cursor-pointer" />
                    </button>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'Spawns',
        props: {
            spawns: {
                type: Array,
                required: true
            }
        },
        methods: {
            valuePlaceholder(index) {
                let placeholder = ''
                switch(this.spawns[index].type) {
                    case 'enemy':
                    placeholder = 'Enter Enemy ID'
                        break
                    case 'skirmish':
                    placeholder = 'Enter Skirmish ID'
                        break
                    case 'time':
                    placeholder = 'Enter time in SECONDS'
                        break
                }

                return placeholder
            },
            valueTitle(index) {
                let title = ''
                switch(this.spawns[index].type) {
                    case 'enemy':
                        title = 'Enter Enemy ID'
                        break
                    case 'skirmish':
                        title = 'Enter Skirmish ID'
                        break
                    case 'time':
                        title = 'Enter time in SECONDS'
                        break
                }

                return title
            },
            updateType: function (evt, index) {
                let newSpawns = [...this.spawns]
                newSpawns[index].type = evt.target.value
                newSpawns[index].value = ''
                this.$emit('updateSpawns', newSpawns)
            },
            updateValue: function (evt, index) {
                this.updateSpawns(index, 'value', evt.target.value)
            },
            updateSpawns: function (index, key, value) {
                let newSpawns = [...this.spawns]
                newSpawns[index][key] = value
                this.$emit('updateSpawns', newSpawns)
            },
            deleteSpawn: function (index) {
                this.$emit('updateSpawns', this.spawns.slice(0,index).concat(this.spawns.slice(index+1)))
            }
        }
    }
</script>