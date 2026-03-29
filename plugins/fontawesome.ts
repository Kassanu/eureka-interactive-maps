import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCaretUp, faCaretDown, faCaretLeft, faCaretRight, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'

export default defineNuxtPlugin(nuxtApp => {
  library.add(faCaretUp, faCaretDown, faCaretLeft, faCaretRight, faPlus, faTimes)
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
