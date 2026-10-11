import { useLocaleChoice } from '~/composables/useLocaleChoice'
import { entryRedirect } from '~/i18n/routes'

// Arrival only: a link to `/` followed inside the site goes where it says.
export default defineNuxtRouteMiddleware(to => {
  if (import.meta.server || !useNuxtApp().isHydrating) return
  const target = entryRedirect(to.path, useLocaleChoice().value)
  if (target) return navigateTo(target, { replace: true })
})
