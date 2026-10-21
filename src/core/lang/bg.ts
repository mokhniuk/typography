import { NBSP } from '../types';
import type { LangPack } from './pack';

export const bg = {
  code: 'bg',
  name: 'Bulgarian (български)',
  sample:
    'Той каза "тръгваме към гората" - и си тръгна... Лабораторията работи 21-26 септември, 10:00-12:00, 5% отстъпка. Още ->',
  // „…“ at every level, ISG 4.2.3 and 10.1.7.
  quotes: [['„', '“']],
  // ISG 4.2.3 keeps стр. (page) with its number by a fixed space; the other abbreviations of 10.4.2 carry no such rule.
  abbreviations: { page: ['стр'] },
  // ISG 6.4: a fixed space between the figure and %; ISG 7.3.3: between the amount and the euro sign.
  percentSpace: true,
  // ISG 4.2.3 and 6.5: a comma for decimals, a fixed space between groups of three digits.
  numbers: { group: NBSP, decimal: ',' },
  dialogueDash: { mark: '—' },
  reviewed: false,
  sources: [
    'https://ibl.bas.bg/ezikovispravki/vaprosi/pri-tsitirane-i-pryaka-rech-10/2266',
    'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0011.01/DOC_1 (Междуинституционално ръководство за оформяне на текстове, Bulgarian ISG, PDF of 19 April 2022: 4.2.3 кавички and числа and неделими интервали, 6.4 разстояние между знаците, 6.5 изписване на числата, 7.3.3 парични единици, 10.1.7 кавички, 10.1.8 тире, 10.4.2 съкращения)',
  ],
  notes: [
    'Dialogue: direct speech is usually set on a new line with a long dash (дълго тире) and a space after it, and a spaced dash before the attribution (Institute for Bulgarian Language, BAS, Езикови справки, citing the Официален правописен речник 2012, т. 131). The page renders the en dash; the pack keeps the em dash of ISG 10.8 for both, so dialogue and the narrator match.',
    'Quotes: the ISG (4.2.3, "Всички нива „…“", and 10.1.7) gives one pair, „…“ (Alt 0132 and Alt 0147), for every level, so a quotation inside a quotation is set with the same pair; ‚…‘ is not used. The ISG also says that a quotation which is itself a sentence and contains an inner quotation takes no doubled marks at its start and end.',
    'Percent and euro: ISG 6.4 shows "00●%" with a fixed space; 7.3.3 puts a fixed space between the amount and ISO code or the euro sign.',
    'Numbers: ISG 4.2.3 and 6.5 prescribe a fixed space between groups of three digits (300 000), a comma as decimal mark; numbers that number things (years, pages) are written without a space (1961 г., стр. 2064). The grouping is the opt-in rule number.group.',
    'Abbreviations: only стр. followed by a number is bound (ISG 4.2.3 lists "стр.•ОВ C" among fixed-space cases). Other abbreviations in 10.4.2 (вж., т.е., и т.н., г-н, д-р) are given without a no-break rule, so none is invented.',
    'Not implemented, not verified: one-letter prepositions (в, с, к, у, о) are not kept off the end of a line, because the ISG states no such rule and the Institute for Bulgarian Language rules were not read; the sentence dash is the engine\'s default em dash, which matches the spaced em dash of ISG 10.1.8; the dialogue dash is set from the Institute page above.',
  ].join(' '),
} as const satisfies LangPack;
