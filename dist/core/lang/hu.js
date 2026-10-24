import { NBSP } from '../types.js';
export const hu = {
    code: 'hu',
    name: 'Hungarian (magyar)',
    sample: 'Azt mondta "itt vagyunk" - és elment... A tábor szeptember 21-26., 10:00-12:00. Tovább ->',
    // „outer »inner« outer”, then ’third’. The » « pair is turned (open » close «), read by position.
    quotes: [
        ['„', '”'],
        ['»', '«'],
        ['’', '’'],
    ],
    turnedPairs: [['»', '«']],
    numbers: { group: NBSP, decimal: ',' },
    dialogueDash: { mark: '–' },
    sentenceDash: '–',
    reviewed: false,
};
export default hu;
