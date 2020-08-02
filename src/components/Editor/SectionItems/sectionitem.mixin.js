export default {
    data() {
        return {
            positionError: false
        }
    },
    computed: {
        formatedPosition() {
            return `(${this.item.position.x}, ${this.item.position.y})`
        },
        expanded() {
            if (this.jsonDataShow.hasOwnProperty(this.item.id) && this.jsonDataShow[this.item.id].hasOwnProperty('expanded')) {
                return this.jsonDataShow[this.item.id].expanded
            }

            return true
        }
    },
    methods: {
        updateName: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.name = evt.target.value
            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateLevel: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.level = parseInt(evt.target.value)
            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateElement: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.element = evt.target.value

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateWeather: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.weather = evt.target.value

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updatePosition: function (evt) {
            const coordRegex = /^\(?(\d+\.{0,1}\d{0,1}),\s{0,1}(\d+\.{0,1}\d{0,1})\)?/
            const matches = evt.target.value.match(coordRegex)
            if (matches) {
                this.positionError = false
                let newItem = Object.assign({}, this.item)
                newItem.position = {
                    x: matches[1].includes('.') ? parseFloat(matches[1]) : parseInt(matches[1]),
                    y: matches[2].includes('.') ? parseFloat(matches[2]) : parseInt(matches[2]),
                }
                this.$emit('updateItem', this.sectionKey, newItem)
            } else {
                this.positionError = true
            }
        },
        updateAggro: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.aggro = evt.target.value === "" ? null : evt.target.value

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateAdaptation: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.adaptation.canAdapt = evt.target.checked

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateMutation: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.mutation.canMutate = evt.target.checked

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateFate: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.fate.forFate = evt.target.checked

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateAshkin: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.ashkin = evt.target.checked

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateForFateId: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.fate.fateId = evt.target.value

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateMutationElement: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.mutation.element = evt.target.value

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        addCondition: function (type) {
            let newItem = Object.assign({}, this.item)
            newItem[type].conditions.push({
                weather: null,
                time: null
            })

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        deleteCondition: function (type, index) {
            let newItem = Object.assign({}, this.item)
            newItem[type].conditions.splice(index, 1)

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        changeConditions: function (type, newConditions) {
            let newItem = Object.assign({}, this.item)
            newItem[type].conditions = newConditions

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateBoss: function (event, key) {
            let newItem = Object.assign({}, this.item)
            newItem.boss[key] = event.target.value

            this.$emit('updateItem', this.sectionKey, newItem)
        }
    }
}
