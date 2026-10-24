import type { PackProse } from '../pack.ts';

export const da: PackProse = {
  sources: [
    'https://ro.dsn.dk/?paragraf=59&type=rulesearch',
    'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0022.01/DOC_1 (Vejledning i Udformning af EU-Publikationer, PDF of 19 April 2022: 4.2.3 anførselstegn og tal, 6.4 mellemrum i forbindelse med tegnsætning, 6.5 tegnsætning i tal, 10.1 diverse regler, 10.2 tal og datoer, bilag A3 forkortelser)',
  ],
  notes: [
    'Dialogue: a replikstreg, the same form as the tankestreg (the long dash, see above), may open a line of dialogue (Retskrivningsordbogen 5.1, § 59); quotes or no marks are equally allowed, and the attribution follows a comma.',
    'Quotes: ISG 4.2.3 says Danish uses the same marks at every level, »…«, and 10.1 gives the nested form »…»…«…«. The mark pairs are read by position (turnedPairs), as in German. The other Danish convention, „…“ (and ‚…‘ inside), which Dansk Sprognævn also accepts, is not implemented and was not read at its source.',
    'The sentence dash is the long dash with spaces (ISG 6.4 table and 10.1: "som tankestreg bruges den lange"), which is the engine default; the en dash is the minus and the range sign.',
    'Abbreviations: only those the ISG itself writes before a figure or an amount (10.2: s. 50, stk. 3, kl. 17.30; 4.2.3: nr., s.; 10.1: mio. EUR; annex A3: mio., mia.). Danish abbreviations such as f.eks., bl.a., dvs., osv. are written without inner spaces (10.3, A3), so there is nothing to keep together.',
    'Not implemented, not verified: one-letter words (the ISG gives no list), the dash rules of Retskrivningsordbogen (Dansk Sprognævn was not read), % before a currency (the ISG writes EUR after a figure, 10.2, with an ordinary space).',
  ].join(' '),
};
