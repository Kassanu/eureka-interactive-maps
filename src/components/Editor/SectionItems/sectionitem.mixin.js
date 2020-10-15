export default {
    computed: {
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
        updatePosition: function (position) {
            let newItem = Object.assign({}, this.item)
            newItem.position = position
            this.$emit('updateItem', this.sectionKey, newItem)
        },
        addPosition: function () {
            let newItem = Object.assign({}, this.item)
            if (!Array.isArray(newItem.position)) {
                newItem.position = [newItem.position]
            }
            newItem.position.push({
                x: 0,
                y: 0
            })

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        setItemPosition(index) {
            this.$emit('setItemPosition', {
                section: this.sectionKey,
                id: this.item.id,
                index: index
            })
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
        updateElemental: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.elemental = evt.target.checked

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateFauna: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.fauna = evt.target.checked

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateMachine: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.machine = evt.target.checked

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
        },
        updateParticipants: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.participants = parseInt(evt.target.value)
            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateIcon: function (icon) {
            let newItem = Object.assign({}, this.item)
            newItem.icon = icon
            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateDrops: function (drops) {
            let newItem = Object.assign({}, this.item)
            newItem.drops = drops
            this.$emit('updateItem', this.sectionKey, newItem)
        },
        addDrop: function () {
            let newItem = Object.assign({}, this.item)

            newItem.drops.push({
                name: "",
                amount: 0,
                percent: 0
            })

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateSpawns: function (spawns) {
            let newItem = Object.assign({}, this.item)
            newItem.spawns = spawns
            this.$emit('updateItem', this.sectionKey, newItem)
        },
        addSpawn: function () {
            let newItem = Object.assign({}, this.item)

            newItem.spawns.push({
                type: "enemy",
                value: ""
            })

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateAttack: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.attack = evt.target.value

            this.$emit('updateItem', this.sectionKey, newItem)
        },
        updateWeakness: function (evt) {
            let newItem = Object.assign({}, this.item)
            newItem.weakness = evt.target.value

            this.$emit('updateItem', this.sectionKey, newItem)
        },
    }
}
