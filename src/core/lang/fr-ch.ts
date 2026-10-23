import { NBSP } from '../types.ts';
import { fr } from './fr.ts';
import type { LangPack } from './pack.ts';

const SCHREIBWEISUNGEN =
  'https://www.bk.admin.ch/bk/de/home/dokumentation/sprachen/hilfsmittel-textredaktion/schreibweisungen.html';

export const frCH = {
  code: 'fr-CH',
  name: 'French (Switzerland)',
  sample:
    'Il a dit "nous sommes là" - et il est parti... Le labo fonctionne du 21-26 septembre, 10:00-12:00. Lire la suite ->',
  // «outer ‹inner› outer», with no no-break space inside the marks, unlike the fr pack.
  quotes: [
    ['«', '»'],
    ['‹', '›'],
  ],
  percentSpace: fr.percentSpace,
  currencySpace: fr.currencySpace,
  elisions: fr.elisions,
  numbers: { group: NBSP, decimal: '.' },
  reviewed: false,
  sources: [SCHREIBWEISUNGEN, ...fr.sources],
  notes:
    'Swiss French quotes: `«outer ‹inner› outer»`, without the no-break space inside that the fr pack sets, as the former ch pack set them from the Swiss Federal Chancellery Schreibweisungen (the German edition; no French Swiss guide was read). CLDR has the same marks for fr-CH. No space is set before `; ! ?` and `:`: the pack field that keeps that space (spaceBeforeHigh) is set by the fr pack only (this pack copies the fr fields it takes one by one, and not that one), and whether Swiss French sets one is unverified. Dialogue is quoted here (no dialogueDash), unlike the fr pack: the OQLF source on dialogue dashes is cited with the fr sources, but no dialogue dash is set, and either choice is unverified for Switzerland. The no-break space before % and € is French’s (the fr pack), not checked against a Swiss guide. Digits are grouped with a no-break space (number.group) and the decimal mark is a point, as the Schreibweisungen set for federal texts (Rz. 512, 514, 543 for francs); those passages were read in the German edition, from its index and the PDF text, not on the page itself, and the pack stays reviewed: false. Everyday Swiss usage often writes the apostrophe (1’000’000); it is not used here.',
} as const satisfies LangPack;

export default frCH;
