import { onMounted, onUnmounted, ref, type Ref } from 'vue'

// The breakpoint the viewer treats as narrow, matching Tailwind's `sm`.
export const NARROW = 640

// The window's width, tracked while the component is mounted. It starts at the breakpoint so a
// server render and the first client render agree, and the real width arrives on mount.
export function useWindowWidth(): Ref<number> {
  const width = ref(NARROW)
  const onResize = () => { width.value = window.innerWidth }

  onMounted(() => {
    onResize()
    window.addEventListener('resize', onResize)
  })
  onUnmounted(() => window.removeEventListener('resize', onResize))

  return width
}
