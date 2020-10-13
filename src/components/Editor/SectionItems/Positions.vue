<template>
    <div>
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Position <span v-if="multiple" @click="$emit('addPosition')"><font-awesome-icon icon="plus" class="cursor-pointer" title="Add new position to this item" /></span>
        </label>
        <div v-for="(position, index) in cPositions" :key="index" class="flex flex-wrap -mx-3">
            <div class="w-full inline-flex md:w-1/3 px-3 mb-6 md:mb-0">
                <input :value="formatedPosition(position)" @change="updatePosition($event, index)"
                    class="px-2 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded-l text-sm border outline-none focus:outline-none focus:shadow-outline w-full"
                    :class="borderClass(index)" type="text"
                    placeholder="(X, Y)">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 rounded-r">
                        <font-awesome-icon @click="$emit('setItemPosition', index)" icon="plus" class="cursor-pointer" title="Update position" />
                    </button>
                    <button v-show="index > 0" @click="deletePosition(index)" class="bg-red-500 hover:bg-red-700 text-white font-bold px-2 ml-2 rounded">
                        <font-awesome-icon icon="times" class="cursor-pointer" />
                    </button>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'Positions',
        props: {
            positions: {
                type: [Array, Object],
                required: true
            },
            multiple: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                positionError: []
            }
        },
        computed: {
            cPositions() {
                return Array.isArray(this.positions) ? this.positions : [this.positions]
            }
        },
        methods: {
            formatedPosition(position) {
                return `(${position.x}, ${position.y})`
            },
            borderClass(index) {
                return {
                    'border-gray-400': this.positionError[index] ? !this.positionError[index] : true,
                    'border-red-400': this.positionError[index] ? !this.positionError[index] : false
                }
            },
            updatePosition: function (evt, index) {
                const coordRegex = /^\(?(\d+\.{0,1}\d{0,1}),\s{0,1}(\d+\.{0,1}\d{0,1})\)?/
                const matches = evt.target.value.match(coordRegex)
                if (matches) {
                    this.positionError[index] = false
                    let newPositions = this.cPositions
                    newPositions[index] = {
                        x: matches[1].includes('.') ? parseFloat(matches[1]) : parseInt(matches[1]),
                        y: matches[2].includes('.') ? parseFloat(matches[2]) : parseInt(matches[2]),
                    }
                    this.$emit('updatePosition', newPositions)
                } else {
                    this.positionError[index] = true
                }
            },
            deletePosition: function(index) {
                this.$emit('updatePosition', this.cPositions.slice(0,index).concat(this.cPositions.slice(index+1)))
            }
        }
    }
</script>