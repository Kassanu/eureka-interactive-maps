// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // The editor works on one reactive draft of the loaded zone: a form binds to the field it
    // changes, and a list component is handed the array it edits. That is what replaced the
    // clone-and-emit chain the old editor pushed through three components, and it means every
    // one of these writes to something its parent handed it on purpose. The rule guards against
    // doing that by accident, which is not what happens here.
    files: ['components/Editor/**/*.vue'],
    rules: { 'vue/no-mutating-props': 'off' },
  }
)
