// The shape of vue-i18n's `t`, declared here so `model/` and `zones/` can build a translated
// string while importing nothing from Nuxt. The test suite passes its own, built from en.json.
export type Translate = (key: string, named?: Record<string, unknown>) => string
