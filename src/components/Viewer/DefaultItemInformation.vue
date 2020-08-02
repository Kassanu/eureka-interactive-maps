<template>
    <div>
        <span class="font-bold">Coordinates:</span> ({{ item.position.x }}, {{ item.position.y }})
    </div>
</template>

<script>

    export default {
        name: 'default-item-information',
        props:{
            item: {
                type: Object,
                required: true
            }
        }
    }
</script>