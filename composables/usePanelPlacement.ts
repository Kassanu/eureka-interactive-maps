import { computed, type ComputedRef, type Ref } from 'vue'
import { NARROW, useWindowWidth } from '~/composables/useWindowWidth'

export interface Point { x: number; y: number }
export interface Size { width: number; height: number }

// A flip happens only past the far edge, and the clamp after it keeps the panel wholly inside.
export function placePanel(click: Point, panel: Size, bounds: Size): Point {
  return {
    x: placeAlong(click.x, panel.width, bounds.width),
    y: placeAlong(click.y, panel.height, bounds.height),
  }
}

function placeAlong(at: number, length: number, room: number): number {
  const start = at + length > room ? at - length : at
  return Math.max(0, Math.min(start, room - length))
}

// The bounds are the panel's offset parent, the viewer, so the footer below it is never room.
export function usePanelPlacement(
  panel: Ref<HTMLElement | null>,
  click: () => Point
): ComputedRef<string> {
  const windowWidth = useWindowWidth()

  return computed(() => {
    if (windowWidth.value < NARROW) return 'top:5%;left:5%;'
    const element = panel.value
    const viewer = element?.offsetParent
    if (!element || !(viewer instanceof HTMLElement)) return `top:${click().y}px;left:${click().x}px;`
    const { x, y } = placePanel(
      click(),
      { width: element.offsetWidth, height: element.offsetHeight },
      { width: viewer.clientWidth, height: viewer.clientHeight }
    )
    return `top:${y}px;left:${x}px;`
  })
}
