<template>
    <div>
        <EurekaCanvas :canvasImageSource="image" :gridSizeInPixels="50" :coordinatesOffset="1" :positions="positions" />
    </div>
</template>

<script>
    import EurekaCanvas from 'eureka-canvas'

    export default {
        name: 'app',
        components: {
            EurekaCanvas
        },
        data() {
            return {
                image: require('../../../assets/pyros.jpg'),
                positions: []
            }
        },
        created() {
            this.setUpPositions()
        },
        methods: {
            setUpPositions() {
                let positions = this.loadPositions()
                positions.forEach(position => {
                    position.icons.forEach(async (icon) => {
                        icon.image = await this.loadImage(icon.path)
                    })
                })

                this.positions = positions
            },
            loadPositions() {
                return [
                    {
                        label: 'Test',
                        icons: [
                            {
                                path: require('../../../assets/images/icons/elements/fire2.png'),
                                image: null
                            }
                        ],
                        coordinates: {
                            x: 35,
                            y: 6
                        }
                    }
                ]
            },
            loadImage: url => new Promise(resolve => {
                let img = new Image()
                img.onload = () => resolve(img)
                img.src = url
            })
        }
    }
</script>

<style></style>