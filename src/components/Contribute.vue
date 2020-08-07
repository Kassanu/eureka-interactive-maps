<template>
  <div id="contribute" class="flex flex-col">
    <div class="flex-grow flex justify-center">
      <div class="flex flex-col w-1/6 justify-center">
        <div class="mb-2">
          <h1 class="text-2xl text-white">I want to help code!</h1>
          This application is fully open source! If you would like to contribute please make a pull request at one of
          the
          github projects!
          <br><br>
          <a rel="nofollow" class="hover:text-white" href="https://github.com/Kassanu/eureka-interactive-maps">Eureka
            Interctive Maps</a> -
          <a rel="nofollow" class="hover:text-white" href="https://github.com/Kassanu/eureka-canvas">Eureka Canvas</a>
        </div>
        <div>
          <h1 class="text-2xl text-white">I want to update map data!</h1>
          If you don't know how to code but would still like to help each map has an admin panel which allows you to
          edit all of the data. Vist one of the links below to enter the editors and make all of your changes and hit
          the "Save" button. A .json file will be downloaded to your computer, you can send that file to me through
          email, discord or by making a pull request.
          <br><br>
          <router-link class="hover:text-white" to="/anemos/editor">Anemos Editor</router-link><br>
          <router-link class="hover:text-white" to="/pagos/editor">Pagos Editor</router-link><br>
          <router-link class="hover:text-white" to="/pyros/editor">Pyros Editor</router-link><br>
          <router-link class="hover:text-white" to="/hydatos/editor">Hydatos Editor</router-link>
        </div>
      </div>
    </div>
    <footer id="footer" class="flex flex-col text-sm">
      <div class="flex justify-center">
        <router-link class="hover:text-white" to="/">Home</router-link>&nbsp;-&nbsp;<router-link
          class="hover:text-white" to="/contribute">Contribute</router-link>
      </div>
      <div class="flex justify-center">FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd. FINAL FANTASY XIV © 2010 - 2020
        SQUARE ENIX CO., LTD. All Rights Reserved.</div>
    </footer>
  </div>
</template>

<script>
  export default {
    name: 'Contribute'
  }
</script>