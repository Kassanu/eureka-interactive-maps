<template>
  <Page id="home">
    <div class="flex-grow flex">
      <div class="flex flex-col justify-center flex-grow">
        <h1 class="text-6xl text-white text-center mb-5">FFXIV Interactive Eureka Maps</h1>
        <div class="w-1/6 flex flex-col self-center justify-center">
          <router-link to="/anemos"
            class="bg-teal-500 hover:bg-teal-700 text-white text-lg text-center font-bold py-4 px-6 mb-2">Anemos
          </router-link>
          <router-link to="/pagos"
            class="bg-blue-500 hover:bg-blue-700 text-white text-lg text-center font-bold py-4 px-6 mb-2">Pagos
          </router-link>
          <router-link to="/pyros"
            class="bg-red-500 hover:bg-red-700 text-white text-lg text-center font-bold py-4 px-6 mb-2">Pyros
          </router-link>
          <router-link to="/hydatos"
            class="bg-pink-500 hover:bg-pink-700 text-white text-lg text-center font-bold py-4 px-6 mb-2">Hydatos
          </router-link>
          <router-link to="/Bozjansouthernfront" class="bg-purple-500 text-white text-lg text-center font-bold py-4 px-6 mb-2">Bozjan Southern Front</router-link>
        </div>
      </div>
    </div>
  </Page>
</template>

<script>
  import Page from './Page'

  export default {
    name: 'Home',
    components: {
      Page
    }
  }
</script>