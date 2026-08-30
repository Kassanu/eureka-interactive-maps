import {
  computed,
  inject,
  reactive,
  ref,
  shallowRef,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue'
import type { Position } from '~/model/primitives'
import {
  ZONE_SCHEMA_VERSION,
  createItem,
  encodeZone,
  indexZone,
  parseSections,
  zoneFileText,
  zoneFor,
  type LoadIssue,
  type LoadedSection,
  type LoadedZone,
  type SaveIssue,
  type ZoneItem,
  type ZoneSlug,
} from '~/zones'

// The editor's state. Items are parsed once and edited in place, so a form binds to the field it
// changes; the indexes and markers are recomputed from them.

// What the map is waiting for a click to tell it.
export type Pending =
  | { kind: 'add'; sectionKey: string; label: string }
  | { kind: 'position'; item: ZoneItem; point: Position; label: string }

export interface UseZoneEditor {
  zone: ComputedRef<LoadedZone | null>
  image: Ref<string | null>
  error: Ref<string | null>
  loadIssues: Ref<LoadIssue[]>
  saveIssues: Ref<SaveIssue[]>
  pending: Ref<Pending | null>
  search: Ref<string>
  // Two axes, both read the positive way: whether a thing is drawn on the map, and whether its
  // row in the panel is unfolded. The sets behind them are the negatives, because everything
  // starts visible and unfolded and an empty set is what says so.
  isVisible: (key: string) => boolean
  setVisible: (key: string, on: boolean) => void
  isExpanded: (key: string) => boolean
  toggleExpanded: (key: string) => void
  matches: (item: ZoneItem) => boolean
  addTo: (section: LoadedSection) => void
  placePosition: (item: ZoneItem, point: Position) => void
  cancel: () => void
  clickMap: (position: Position) => void
  removeItem: (sectionKey: string, item: ZoneItem) => void
  save: () => void
}

// One store owned by Editor.vue, reached here rather than passed down.
export const editorKey = Symbol('zoneEditor') as InjectionKey<UseZoneEditor>

export function useEditor(): UseZoneEditor {
  const editor = inject(editorKey)
  if (!editor) throw new Error('useEditor called outside an Editor')
  return editor
}

export function useZoneEditor(slug: ZoneSlug): UseZoneEditor {
  const definition = zoneFor(slug)

  // The parsed items, held apart from the indexes so an edit does not disturb them.
  const items = shallowRef(new Map<string, ZoneItem[]>())
  const image = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loadIssues = shallowRef<LoadIssue[]>([])
  const saveIssues = shallowRef<SaveIssue[]>([])
  const pending = shallowRef<Pending | null>(null)
  const search = ref('')

  // Keyed by section key or item id, which never collide: one is a slug, the other a uuid.
  const hidden = reactive(new Set<string>())
  const expanded = reactive(new Set<string>())

  const isVisible = (key: string) => !hidden.has(key)
  const isExpanded = (key: string) => expanded.has(key)

  function setVisible(key: string, on: boolean) {
    if (on) hidden.delete(key)
    else hidden.add(key)
  }

  // Opening a section opens the item forms inside it: the section is the only thing a reader has
  // to open, and the forms are what they came for.
  function toggleExpanded(key: string) {
    if (expanded.delete(key)) return
    expanded.add(key)
    for (const item of items.value.get(key) ?? []) expanded.add(item.id)
  }

  Promise.all([definition.file(), definition.map.image()])
    .then(([file, source]) => {
      const parsed = parseSections(definition, file.default)
      items.value = new Map(
        [...parsed.sections].map(([key, list]) => [key, reactive(list) as ZoneItem[]])
      )
      loadIssues.value = parsed.issues
      image.value = source.default
    })
    .catch((cause: unknown) => {
      error.value = `Could not load ${slug}`
      console.error(`Error loading data for ${slug}.`, cause)
    })

  const zone = computed<LoadedZone | null>(() => {
    if (items.value.size === 0) return null
    return indexZone(definition, items.value, loadIssues.value)
  })

  function listFor(sectionKey: string): ZoneItem[] {
    return items.value.get(sectionKey) ?? []
  }

  function matches(item: ZoneItem): boolean {
    const term = search.value.trim().toLowerCase()
    if (!term) return true
    return item.id.toLowerCase().includes(term) || (item.name ?? '').toLowerCase().includes(term)
  }

  function addTo(section: LoadedSection) {
    pending.value = { kind: 'add', sectionKey: section.key, label: section.definition.name }
  }

  // The point, not its index: a row deleted while the map waits shifts every index after it.
  function placePosition(item: ZoneItem, point: Position) {
    pending.value = { kind: 'position', item, point, label: item.name ?? item.id }
  }

  function cancel() {
    pending.value = null
  }

  function clickMap(position: Position) {
    const waiting = pending.value
    if (!waiting) return

    if (waiting.kind === 'add') {
      const section = definition.sections[waiting.sectionKey]
      if (section) listFor(waiting.sectionKey).push(createItem(section, position))
    } else {
      const at = waiting.item.positions.indexOf(waiting.point)
      if (at !== -1) waiting.item.positions.splice(at, 1, position)
    }

    pending.value = null
  }

  function removeItem(sectionKey: string, item: ZoneItem) {
    const list = listFor(sectionKey)
    const index = list.findIndex(candidate => candidate.id === item.id)
    if (index !== -1) list.splice(index, 1)
    if (pending.value?.kind === 'position' && pending.value.item.id === item.id) cancel()
  }

  function save() {
    if (!zone.value) return
    const { file, issues } = encodeZone(zone.value, ZONE_SCHEMA_VERSION)
    saveIssues.value = issues
    if (!file) return

    const link = document.createElement('a')
    const blob = new Blob([zoneFileText(file)], { type: 'application/json' })
    link.href = URL.createObjectURL(blob)
    link.download = `${slug}.json`
    link.click()
    // The blob is read after this handler returns, so the URL has to outlive it.
    setTimeout(() => URL.revokeObjectURL(link.href))
  }

  return {
    zone,
    image,
    error,
    loadIssues,
    saveIssues,
    pending,
    search,
    isVisible,
    setVisible,
    isExpanded,
    toggleExpanded,
    matches,
    addTo,
    placePosition,
    cancel,
    clickMap,
    removeItem,
    save,
  }
}
