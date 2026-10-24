import { NBSP } from '../types.js';
import { fr } from './fr.js';
export const frCH = {
    code: 'fr-CH',
    name: 'French (Switzerland)',
    sample: 'Il a dit "nous sommes là" - et il est parti... Le labo fonctionne du 21-26 septembre, 10:00-12:00. Lire la suite ->',
    // «outer ‹inner› outer», with no no-break space inside the marks, unlike the fr pack.
    quotes: [
        ['«', '»'],
        ['‹', '›'],
    ],
    // Instructions ch. 5: an espace insécable between a number and its unit (3 %, 50 francs, 300 CHF).
    percentSpace: true,
    currencySpace: true,
    elisions: fr.elisions,
    // Instructions ch. 4: groups of three with an espace insécable, no apostrophe; a decimal comma.
    // A point is read as a decimal mark too (a franc amount, Schreibweisungen Rz. 514, 543), never a separator.
    numbers: { group: NBSP, decimal: ',.' },
    reviewed: false,
};
export default frCH;
