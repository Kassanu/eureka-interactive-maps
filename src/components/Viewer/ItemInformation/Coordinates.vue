<template>
    <div class="flex">
        <div class="font-bold mr-2">Coordinates:</div> 
        <div>
            <div v-for="(position, index) in cPositions" :key="index">
                ({{ position.x }}, {{ position.y }})
            </div>
            
        </div>
    </div>
</template>

<script>

    export default {
        name: 'default-item-information',
        props:{
            positions: {
                type: [Array, Object],
                required: true
            }
        },
        computed: {
            cPositions() {
                return Array.isArray(this.positions) ? this.positions : [this.positions]
            }
        }
    }
</script>