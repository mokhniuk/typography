import { NBSP } from '../types.js';
export const ga = {
    code: 'ga',
    name: 'Irish (Gaeilge)',
    sample: 'Dúirt sé "tá mé anseo" - agus d\'imigh sé... Mairfidh an obair 21-26 Meán Fómhair, 10:00-12:00. Léigh tuilleadh ->',
    // ‘level 1 “level 2 ‘level 3’ level 2” level 1’: the Publications Office table lists Irish with the
    // English order, single marks first. Wikipedia lists Irish with double marks first; see notes.
    quotes: [
        ['‘', '’'],
        ['“', '”'],
        ['‘', '’'],
    ],
    // ISG 6.4 table (read in the Maltese edition, common to all languages): a fixed space before %.
    percentSpace: true,
    currencySpace: false,
    // ISG 6.5 (Maltese edition): in Maltese, English and Irish publications a point separates the
    // decimals; a space (not a comma) marks the thousands.
    numbers: { group: NBSP, decimal: '.' },
    reviewed: false,
};
export default ga;
