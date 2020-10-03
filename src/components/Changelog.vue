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
          }
        ]
      }
    }
  }
</script>