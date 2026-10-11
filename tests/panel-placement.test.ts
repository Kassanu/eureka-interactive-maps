import { describe, expect, it } from 'vitest'
import { placePanel } from '~/composables/usePanelPlacement'

const viewer = { width: 1000, height: 800 }
const panel = { width: 300, height: 200 }

describe('a panel that fits beside the click', () => {
  it('opens with its corner at the click', () => {
    expect(placePanel({ x: 100, y: 100 }, panel, viewer)).toEqual({ x: 100, y: 100 })
  })

  it('stays at the click when its far edge lands exactly on the viewer edge', () => {
    expect(placePanel({ x: 700, y: 600 }, panel, viewer)).toEqual({ x: 700, y: 600 })
  })
})

describe('a panel that would cross the far edge', () => {
  it('flips to the left of a click near the right edge', () => {
    expect(placePanel({ x: 900, y: 100 }, panel, viewer)).toEqual({ x: 600, y: 100 })
  })

  it('flips above a click near the bottom edge', () => {
    expect(placePanel({ x: 100, y: 700 }, panel, viewer)).toEqual({ x: 100, y: 500 })
  })

  it('flips one pixel past the exact fit', () => {
    expect(placePanel({ x: 701, y: 601 }, panel, viewer)).toEqual({ x: 401, y: 401 })
  })
})

describe('a panel too big for either side of the click', () => {
  const tall = { width: 300, height: 600 }

  it('is held against the top rather than flipping off it', () => {
    expect(placePanel({ x: 100, y: 400 }, tall, viewer)).toEqual({ x: 100, y: 0 })
  })

  it('is held against the left rather than flipping off it', () => {
    const wide = { width: 600, height: 200 }
    expect(placePanel({ x: 500, y: 100 }, wide, viewer)).toEqual({ x: 0, y: 100 })
  })

  it('sits in the corner when it is bigger than the viewer', () => {
    const huge = { width: 1200, height: 900 }
    expect(placePanel({ x: 500, y: 400 }, huge, viewer)).toEqual({ x: 0, y: 0 })
  })

  it('never takes a negative position', () => {
    for (const x of [0, 250, 500, 750, 1000]) {
      for (const y of [0, 200, 400, 600, 800]) {
        const placed = placePanel({ x, y }, tall, viewer)
        expect(placed.x).toBeGreaterThanOrEqual(0)
        expect(placed.y).toBeGreaterThanOrEqual(0)
        expect(placed.y + tall.height).toBeLessThanOrEqual(viewer.height)
      }
    }
  })
})
