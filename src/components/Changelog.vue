<template>
  <Page id="contribute">
    <div class="flex-grow flex justify-center">
      <div>
        <div>Current Version: v{{ currentVersion }}</div>
        <Timeline :timeline-items="timelineItems" :message-when-no-items="'-'" order="desc"/>
      </div>
    </div>
  </Page>
</template>

<script>
  import Page from './Page'
  import Timeline from 'timeline-vuejs'

  export default {
    name: 'Changelog',
    components: {
      Page,
      Timeline
    },
    data() {
      return {
        currentVersion: process.env.VUE_APP_VERSION,
        timelineItems: [
          {
            from: new Date(2020, 9, 1),
            title: 'Launch',
            description: 'Site Launched!',
            showDayAndMonth: true
          },
          {
            from: new Date(2020, 9, 2),
            title: 'v0.2.0',
            description: '<ul class="list-disc list-inside"><li>Fixes Bozjan Southern Front hover effect on homepage.</li><li>Fixes filter container causing page scroll on small screens.</li></ul>',
            showDayAndMonth: true
          },
          {
            from: new Date(2020, 9, 3),
            title: 'v0.3.0',
            description: 'Adds mobile support to the site!',
            showDayAndMonth: true
          },
          {
            from: new Date(2020, 9, 4),
            title: 'v0.4.0',
            description: 'Updates the map editor to save pretty printed JSON instead of the compressed string.',
            showDayAndMonth: true
          },
          {
            from: new Date(2020, 9, 21),
            title: 'v0.5.0',
            description: '<ul class="list-disc list-inside"><li>Adds a lot of information added to the Bozjan Southern Front map</li><li>Updates to Eureka Canvas v0.8.0</li></ul>',
            showDayAndMonth: true
          },
          {
            from: new Date(2021, 9, 25),
            title: 'v0.5.1',
            description: '<ul class="list-disc list-inside"><li>Adds monster level information to map labels.</li></ul>',
            showDayAndMonth: true
          }
        ]
      }
    }
  }
</script>