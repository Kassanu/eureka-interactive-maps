<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: 'app'
    }
</script>

<style>
    body,
    html {
        height: 100vh;
        width: 100vw;
        padding: 0;
        margin: 0;
        color: #2c3e50;
    }

    #app {
        width: 100%;
        height: 100%;
    }
</style>