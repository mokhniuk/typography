import type { PackProse } from '../pack.ts';

export const el: PackProse = {
  sources: [
    'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0016.01/DOC_1 (Διοργανικό εγχειρίδιο σύνταξης κειμένων, PDF of 19 April 2022: 4.2.3 σύνταξη του κειμένου (εισαγωγικά, απόστροφοι), 6.4 διαστήματα και σημεία στίξης, 6.5 αριθμοί και σημεία στίξης, 10.1.3 άνω τελεία, 10.1.7 εισαγωγικά, 10.1.8 ενωτικό, παύλα, 10.6 συντομογραφίες, παράρτημα A3 συντομογραφίες)',
  ],
  notes: [
    'Quotes: «…» first, then “…”, then ‘…’ (ISG 10.1.7, 4.2.3 "τρία επίπεδα"; the ISG prefers the double angular marks in Greek text). The option quoteStyle: \'us\' gives “…” with ‘…’ inside.',
    'The Greek question mark ; and the ano teleia · stand directly after their word (ISG 6.4 table); no rule here adds or removes a space before them, which a test pins.',
    'Abbreviations: only those the ISG lists in annex A3 and uses before a number or a name (αριθ., βλ., δισ., εκατ., κ., σ.); σελ. is mentioned in the A3 comment on σ. as occurring in EU texts. Greek abbreviations such as π.χ. and κ.λπ. are written without inner spaces (10.6), so there is nothing to keep together. Greek letters are matched as Unicode letters.',
    'Not implemented, not verified: the double long dash of 10.1.8 is written attached to the text it encloses (—inciso—) and spaced from the text outside, and a single long dash for an abrupt change takes no space after it, but the engine sets a spaced dash on both sides; one-letter words (the ISG gives no list); the final nu rule (10.4); dates and the ordinal rules of 10.8; the Institute of Modern Greek Studies (Triantafyllidis Foundation) was not read, so no rule rests on it.',
  ].join(' '),
};
