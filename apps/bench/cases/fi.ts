import type { LangBench } from '../langs';

// ”…” with ’…’ inside (Toimielinten yhteiset tekstinlaadinnan ohjeet 10.4.5, Kotus article on inner quotations).
export const fi: LangBench = {
  code: 'fi',
  lead: 'Hän sanoi',
  pairs: [['”', '”']],
  nest: [['”', '”', '’', '’']],
  quote: { input: 'Hän sanoi "talo" ja meni', word: 'talo' },
  dash: 'Kivi - muisti - ja aika',
  range: 'sivut 21-26 ja 10:00-12:00',
  sample:
    'Hän sanoi "olemme täällä" - ja lähti... Kurssi kestää 21-26 syyskuuta, 5% enemmän, s. 12. Lue lisää ->',
};
