import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useZoneEditor, type UseZoneEditor } from '~/composables/useZoneEditor'
import type { LoadedSection, ZoneItem } from '~/zones'

// The editor's store, driven the way its components drive it. Everything here is a plain function
// over refs, so none of it needs a mounted component or a DOM.

async function editorFor(slug: 'anemos' | 'north_horn' = 'anemos'): Promise<UseZoneEditor> {
  const editor = useZoneEditor(slug)
  for (let tick = 0; tick < 50 && !editor.zone.value && !editor.error.value; tick++) {
    await new Promise(resolve => setTimeout(resolve, 2))
  }
  expect(editor.error.value).toBeNull()
  expect(editor.zone.value, 'zone loaded').not.toBeNull()
  return editor
}

function sectionNamed(editor: UseZoneEditor, key: string): LoadedSection {
  const section = editor.zone.value!.sections.find(candidate => candidate.key === key)
  expect(section, key).toBeDefined()
  return section!
}

describe('what the panel opens with', () => {
  it('opens nothing, so the reader sees the section list', async () => {
    const editor = await editorFor('north_horn')
    const zone = editor.zone.value!

    for (const section of zone.sections) {
      expect(editor.isExpanded(section.key), section.key).toBe(false)
    }
  })

  it('opens a section with its item forms already open', async () => {
    const editor = await editorFor('north_horn')
    const zone = editor.zone.value!
    const opened = zone.sections.find(section => section.items.length > 1)!
    const other = zone.sections.find(section => section.key !== opened.key)!

    editor.toggleExpanded(opened.key)

    expect(editor.isExpanded(opened.key)).toBe(true)
    for (const item of opened.items) {
      expect(editor.isExpanded(item.id), item.id).toBe(true)
    }
    expect(editor.isExpanded(other.key)).toBe(false)
    expect(other.items.filter(item => editor.isExpanded(item.id))).toEqual([])
  })

  it('lets one item inside an open section be folded away', async () => {
    const editor = await editorFor('north_horn')
    const section = editor.zone.value!.sections.find(s => s.items.length > 1)!
    editor.toggleExpanded(section.key)

    const first = section.items[0]!
    const second = section.items[1]!
    editor.toggleExpanded(first.id)

    expect(editor.isExpanded(first.id)).toBe(false)
    expect(editor.isExpanded(second.id)).toBe(true)
    expect(editor.isExpanded(section.key)).toBe(true)
  })
})

describe('the point a move is waiting on', () => {
  // PositionList marks the row being moved by comparing the pending point to the row's own object,
  // so the store has to hold that object rather than a copy of it.
  it('is the item\'s own position object, not a copy', async () => {
    const editor = await editorFor()
    const item = sectionNamed(editor, 'enemies').items[0]!
    const point = item.positions[0]!

    editor.placePosition(item, point)
    const waiting = editor.pending.value

    expect(waiting?.kind).toBe('position')
    expect(waiting?.kind === 'position' && waiting.point).toBe(point)
    expect(waiting?.kind === 'position' && waiting.item).toBe(item)
  })

  it('moves the row it was waiting on when the map is clicked', async () => {
    const editor = await editorFor()
    const item = sectionNamed(editor, 'enemies').items[0]!
    const before = item.positions.length

    editor.placePosition(item, item.positions[0]!)
    editor.clickMap({ x: 7, y: 8 })
    await nextTick()

    expect(item.positions).toHaveLength(before)
    expect(item.positions[0]).toEqual({ x: 7, y: 8 })
    expect(editor.pending.value).toBeNull()
  })
})

describe('placing a new item', () => {
  it('waits for the map and then puts the item where it was clicked', async () => {
    const editor = await editorFor()
    const before = sectionNamed(editor, 'enemies').items.length

    editor.addTo(sectionNamed(editor, 'enemies'))
    expect(editor.pending.value?.kind).toBe('add')

    editor.clickMap({ x: 12, y: 34 })
    await nextTick()

    const items = sectionNamed(editor, 'enemies').items
    expect(items.length).toBe(before + 1)
    expect(items[items.length - 1]!.positions).toEqual([{ x: 12, y: 34 }])
    expect(editor.pending.value).toBeNull()
  })

  it('does nothing on a map click nobody asked for', async () => {
    const editor = await editorFor()
    const before = editor.zone.value!.byId.size
    editor.clickMap({ x: 1, y: 1 })
    await nextTick()
    expect(editor.zone.value!.byId.size).toBe(before)
  })
})

describe('moving a position', () => {
  it('sets the row it was started from', async () => {
    const editor = await editorFor()
    const item = sectionNamed(editor, 'enemies').items[0]!
    item.positions.push({ x: 2, y: 2 }, { x: 3, y: 3 })
    const target = item.positions[1]!

    editor.placePosition(item, target)
    editor.clickMap({ x: 9, y: 9 })

    expect(item.positions[1]).toEqual({ x: 9, y: 9 })
    expect(item.positions.length).toBe(3)
  })

  // The pending click used to hold a row number. Deleting an earlier row shifted every row after
  // it, so the click landed on a coordinate the reader never pointed at.
  it('is unaffected by a row deleted while the map is waiting', async () => {
    const editor = await editorFor()
    const item = sectionNamed(editor, 'enemies').items[0]!
    item.positions.splice(0, item.positions.length, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 })
    const target = item.positions[2]!

    editor.placePosition(item, target)
    item.positions.splice(0, 1)
    editor.clickMap({ x: 9, y: 9 })

    expect(item.positions).toEqual([{ x: 2, y: 2 }, { x: 9, y: 9 }])
  })

  it('drops the pending click when its own row goes away', async () => {
    const editor = await editorFor()
    const item = sectionNamed(editor, 'enemies').items[0]!
    item.positions.splice(0, item.positions.length, { x: 1, y: 1 }, { x: 2, y: 2 })
    const target = item.positions[1]!

    editor.placePosition(item, target)
    item.positions.splice(1, 1)
    editor.clickMap({ x: 9, y: 9 })

    expect(item.positions).toEqual([{ x: 1, y: 1 }])
  })
})

describe('removing an item', () => {
  it('removes the one it names rather than the first', async () => {
    const editor = await editorFor()
    const section = sectionNamed(editor, 'enemies')
    const [first, second] = section.items as ZoneItem[]

    editor.removeItem('enemies', second!)
    await nextTick()

    const remaining = sectionNamed(editor, 'enemies').items
    expect(remaining.some(item => item.id === second!.id)).toBe(false)
    expect(remaining.some(item => item.id === first!.id)).toBe(true)
  })

  it('cancels a pending click on the item it deletes', async () => {
    const editor = await editorFor()
    const item = sectionNamed(editor, 'enemies').items[0]!
    editor.placePosition(item, item.positions[0]!)
    editor.removeItem('enemies', item)
    expect(editor.pending.value).toBeNull()
  })
})

describe('search', () => {
  it('matches on name and on id, and everything when empty', async () => {
    const editor = await editorFor()
    const item = sectionNamed(editor, 'enemies').items.find(candidate => candidate.name)!

    editor.search.value = ''
    expect(editor.matches(item)).toBe(true)

    editor.search.value = item.name!.slice(0, 4).toUpperCase()
    expect(editor.matches(item)).toBe(true)

    editor.search.value = item.id
    expect(editor.matches(item)).toBe(true)

    editor.search.value = 'no item is called this'
    expect(editor.matches(item)).toBe(false)
  })
})

describe('what the map draws', () => {
  it('follows an edit without the file being read again', async () => {
    const editor = await editorFor()
    const item = sectionNamed(editor, 'enemies').items[0]!
    const before = editor.zone.value!.iconsById.get(item.id)

    if ('element' in item) {
      item.element = item.element === 'fire' ? 'ice' : 'fire'
      await nextTick()
      expect(editor.zone.value!.iconsById.get(item.id)).not.toEqual(before)
    }
  })
})
