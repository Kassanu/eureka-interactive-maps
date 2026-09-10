// The shape of vue-i18n's `t`, declared here so `model/` and `zones/` can build a translated
// string while importing nothing from Nuxt. The test suite passes its own, built from en.json.
export type Translate = (key: string, named?: Record<string, unknown>) => string

// A label declared where no translator is in reach, resolved where it is drawn. Filter options
// and defaults are computed without one, so resolving a label that early would put the locale in
// charge of what a filter matches. One that ignores its argument is text the data supplied.
export type Text = (t: Translate) => string
