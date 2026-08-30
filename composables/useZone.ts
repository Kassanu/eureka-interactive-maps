import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { loadZone, zoneFor, type LoadedZone, type ZoneSlug } from '~/zones'

export interface UseZone {
  zone: ShallowRef<LoadedZone | null>
  image: Ref<string | null>
  error: Ref<string | null>
}

export function useZone(slug: ZoneSlug): UseZone {
  const zone = shallowRef<LoadedZone | null>(null)
  const image = ref<string | null>(null)
  const error = ref<string | null>(null)

  const definition = zoneFor(slug)

  Promise.all([definition.file(), definition.map.image()])
    .then(([file, source]) => {
      const loaded = loadZone(definition, file.default)

      // An issue naming no section is the file itself, which leaves nothing to draw.
      const unreadable = loaded.issues.find(issue => issue.section === undefined)
      if (unreadable) {
        error.value = `${slug}.json: ${unreadable.message}`
        return
      }

      // The shipped data is tested against these schemas, so an issue here is a defect in the
      // model, not a file a reader can fix. The map still draws everything that parsed.
      for (const issue of loaded.issues) {
        const at = issue.index === undefined ? '' : `[${issue.index}]`
        console.error(`${slug}.${issue.section}${at}: ${issue.message}`)
      }

      zone.value = loaded
      image.value = source.default
    })
    .catch((cause: unknown) => {
      error.value = `Could not load ${slug}`
      console.error(`Error loading data for ${slug}.`, cause)
    })

  return { zone, image, error }
}
