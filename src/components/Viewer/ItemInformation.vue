<template>
    <div ref="itemInformationContainer" @click.stop="" class="itemInformation bg-white rounded overflow-hidden shadow-md absolute p-2" :style="styles">
        <div class="flex items-center border-b border-gray-200">
            <div class="itemInformationIcons mr-2"><slot name="icon"></slot></div>
            <div class="mr-auto font-bold"><slot name="header"></slot></div>
            <font-awesome-icon @click="$emit('closeItemInformation')" icon="times" class="cursor-pointer" />
        </div>
        <div class="p-2">
            <slot name="content"></slot>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'item-information',
        props:{
            position: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                dimensions: {
                    width: 0,
                    height: 0
                }
            }
        },
        mounted () {
            this.dimensions = {
                width: this.$refs.itemInformationContainer.clientWidth,
                height: this.$refs.itemInformationContainer.clientHeight
            }
        },
        computed: {
            top() {
                if ((this.position.y + this.dimensions.height) > document.body.clientHeight) {
                    return this.position.y - this.dimensions.height
                }

                return this.position.y
            },
            left() {
                if ((this.position.x + this.dimensions.width) > document.body.clientWidth) {
                    return this.position.x - this.dimensions.width
                }

                return this.position.x
            },
            styles() {
                return `top:${this.top}px;left:${this.left}px;`
            }
        },
        methods: {
            
        }
    }
</script>