import { translateFrom, type Translate } from '~/i18n/translate'

export function useTranslate(): Translate {
  const { t, locale } = useI18n()
  return translateFrom(t, locale)
}
