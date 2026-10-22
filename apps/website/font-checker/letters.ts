import type { Lang } from '../../../src/core';

/**
 * Letters of each language that fonts most often lack, from the languages this package covers.
 * A font may have every Latin letter of English and still not have these.
 */
export const RISKY_LETTERS: Partial<Record<Lang, string>> = {
  uk: 'ґєіїҐЄІЇ',
  bg: 'ьъщюя',
  el: 'άέήίόύώϊΐ',
  pl: 'łąęśźżńóĄĘŁŚŹŻ',
  cs: 'ěščřžýůďťňĚŠČŘŽ',
  sk: 'ľĺŕôäČŠŽŤĎŇ',
  hu: 'őűŐŰ',
  ro: 'șțăîâȘȚĂÎÂ',
  lv: 'āčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ',
  lt: 'ąčęėįšųūžĄČĘĖĮŠŲŪŽ',
  et: 'äöüõšžÄÖÜÕŠŽ',
  mt: 'ħġċżĦĠĊŻ',
  ga: 'áéíóúÁÉÍÓÚ',
  da: 'æøåÆØÅ',
  sv: 'åäöÅÄÖ',
  fi: 'äöÄÖ',
  sl: 'čšžČŠŽ',
  hr: 'čćđšžČĆĐŠŽ',
  de: 'äöüßÄÖÜ',
  fr: 'àâçéèêëîïôùûüÿœæ',
  es: 'áéíóúñü¿¡',
  pt: 'ãõáâçéêíóôú',
  it: 'àèéìòù',
  nl: 'ëïĳ',
  ch: 'äöüàèé',
  en: '',
};
