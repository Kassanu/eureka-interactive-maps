<template>
    <div class="mb-2">
        <div class="border-b border-gray-200 mb-1 flex justify-start">
            <div>
                <label class="font-bold mr-1">
                    <slot name="header"></slot>
                </label>
            </div>
            <div class="ml-auto">
                <span @click="toggleExpanded"><font-awesome-icon :icon="caretIcon" class="cursor-pointer" /></span>
            </div>
        </div>
        <div v-show="expanded">
            <slot name="content"></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ExpandableSection',
        props: {
            startExpanded: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                expanded: true
            }
        },
        created() {
            this.expanded = this.startExpanded
        },
        computed: {
            caretIcon() {
                return this.expanded ? 'caret-up' : 'caret-down'
            }
        },
        methods: {
            toggleExpanded() {
                this.expanded = !this.expanded
            }
        }
    }
</script>