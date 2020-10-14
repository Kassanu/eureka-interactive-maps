<template>
    <div>
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Icon
        </label>
        <div class="relative">
            <select :value="icon" @change="updateIcon"
                class="px-2 py-1 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:shadow-outline w-full">
                <option value='' disabled></option>
                <option v-for="icon in icons" :key="icon.value" :value='icon.value'>{{ icon.name }}</option>
            </select>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'Icon',
        props: {
            icon: {
                type: String,
                required: true
            },
            icons: {
                type: Array,
                required: true
            }
        },
        methods: {
            updateIcon(evt) {
                this.$emit('updateIcon', evt.target.value)
            }
        }
    }
</script>