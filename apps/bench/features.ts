/**
 * Runs every tool over one battery of English inputs and prints each output, so a
 * feature table can be filled in from what the tools do, not from what they claim.
 * `bun apps/bench/features.ts`. A no-break space is printed as `~`.
 */
import { TOOLS } from './tools';
const probes: [string, string, 'text' | 'html'][] = [
  ['double quotes', 'He said "stone" now', 'text'],
  ['nested quotes', 'He said "she said \'go\' to me" now', 'text'],
  ['apostrophe', "It's the '90s, rock 'n' roll, don't", 'text'],
  ['single-quote pair', "the 'stone' wall", 'text'],
  ['ellipsis', 'Wait... what', 'text'],
  ['spaced hyphen -> dash', 'a word - and more', 'text'],
  ['double hyphen', 'a word -- and more', 'text'],
  ['number range', 'pages 21-26 and 10:00-12:00', 'text'],
  ['month range', 'Sept 3-7 2026', 'text'],
  ['minus', 'result 5 - 3 = 2 and -4 C', 'text'],
  ['multiply', '3x4 and 1920x1080', 'text'],
  ['copyright/tm', '(c) 2026 Acme (R) (tm)', 'text'],
  ['arrows', 'a -> b <- c => d', 'text'],
  ['plus-minus', '+-5 and 1/2', 'text'],
  ['degree', '20 C and 5 degrees', 'text'],
  ['percent', '50 % off', 'text'],
  ['nbsp short words', 'a cat in the hat on a mat', 'text'],
  ['nbsp number+unit', 'it is 5 km or 10 kg or 3 GB', 'text'],
  ['nbsp abbreviation', 'Dr. Smith and Mr. Jones, e.g. this', 'text'],
  ['nbsp initials', 'J. R. R. Tolkien', 'text'],
  ['nbsp before dash', 'stone - and more', 'text'],
  ['thousands', '1000000 and 1,234,567.89', 'text'],
  ['double spaces', 'two  spaces   here', 'text'],
  ['trailing spaces', 'trail   \nnext', 'text'],
  ['space before punct', 'word , and word .', 'text'],
  ['ordinal', '1st 2nd 3rd 4th', 'text'],
  ['ampersand', 'A & B', 'text'],
  ['URL/email kept', 'see https://a.com/x-y--z "q" and me@a-b.com', 'text'],
  ['code span kept', 'use `a -> b "x"` here', 'text'],
  ['ISO date / identifiers', '2026-10-20 and 555-1234 and foo-bar', 'text'],
  ['html text', '<p>"go" - <a href="/x-y">now</a></p>', 'html'],
  ['html pre kept', '<pre>"a" -> b</pre>', 'html'],
];
for (const [name, input, fmt] of probes) {
  console.log(`\n## ${name}\n   in : ${JSON.stringify(input)}`);
  for (const t of TOOLS) {
    if (t.name === 'typography-engine literary' || t.name === 'typograf +nbsp') continue;
    let out: string | null;
    try { out = t.run(input, 'en', fmt); } catch (e) { out = 'ERR ' + e; }
    console.log(`   ${t.name.padEnd(19)}: ${out === null ? '(n/a)' : JSON.stringify(out.replaceAll(' ', '~'))}`);
  }
}
