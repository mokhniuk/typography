import { type Lang, PACK } from '../../src/core';

export const MODES = ['text', 'html', 'markdown'] as const;
export type Mode = (typeof MODES)[number];
export type Size = 'short' | 'long';

/**
 * A longer text per language, written in it, that gives most rules something to do: nested quotes,
 * a dialogue line (opened with a dash where the pack has `dialogueDash`, quoted elsewhere), dashes, ranges, numbers and units, symbols, names with initials, the pack's own
 * abbreviations, stray spaces and doubled marks. `run` is the last sentence, with `{code}` and
 * `{link}` filled in by mode (`examples.test.ts` checks every language is here and the rules act).
 */
export type Long = { title: string; body: readonly string[]; run: string; link: string };

export const LONG: Record<Lang, Long> = {
  en: {
    title: `"Good type" - a short guide`,
    body: [
      `Ada said: "The sign read 'Closed' again" - and laughed... We're used to it by now.   `,
      `"Shall we wait?" asked Dr. K. Novak.`,
      `The workshop runs 21-26 September, 10:00-12:00, in a hall for 125000 people , and the screens are 1920x1080. Tickets are cheap,with 15% off.`,
      `Outside it is -5 C, +-2 C at night.  Add 1/2 cup of sugar. Wow!!! Read on -> p. 12 => done.`,
      `See Fig. 3, No. 4 and § 7 for details. (c) 2026 Studio.`,
    ],
    run: `Run {code} and read {link}.`,
    link: `the "guide"`,
  },
  uk: {
    title: `"Добра типографіка" - короткий посібник`,
    body: [
      `Оля сказала: "На дверях знову 'Зачинено'" - і засміялася... Ми вже звикли, п'ємо м'ятний чай.   `,
      `- Зачекаємо? - спитав професор К. Новак.`,
      `Майстерня триває 21-26 вересня, 10:00-12:00, у залі на 125000 людей , а екрани мають 1920x1080. Квитки дешеві,зі знижкою 15%.`,
      `Надворі -5°C, уночі +-2 °C.  Додайте 1/2 склянки цукру. Ого!!! Читайте далі -> с. 12 => готово.`,
      `Адреса: вул. Хрещатик, 1, див. рис. 3 і т. д. (c) 2026 Студія.`,
    ],
    run: `Запустіть {code} і прочитайте {link}.`,
    link: `"посібник"`,
  },
  de: {
    title: `"Gute Typografie" - ein kurzer Leitfaden`,
    body: [
      `Anna sagte: "Am Schild stand wieder 'Geschlossen'" - und lachte... Wir sind's gewohnt.   `,
      `"Warten wir?", fragte Dr. K. Novak.`,
      `Der Workshop läuft 21-26 September, 10:00-12:00, in einer Halle für 125000 Menschen , die Bildschirme haben 1920x1080. Tickets kosten 49€,sie sind 15% günstiger.`,
      `Draußen sind es -5°C, nachts +-2 °C.  Nehmen Sie 1/2 Tasse Zucker. Toll!!! Weiter -> S. 12 => fertig.`,
      `Mehr dazu z. B. in Nr. 4 vom Verein Satz e.V. (c) 2026 Studio.`,
    ],
    run: `Starten Sie {code} und lesen Sie {link}.`,
    link: `den "Leitfaden"`,
  },
  pl: {
    title: `"Dobra typografia" - krótki przewodnik`,
    body: [
      `Ola powiedziała: "Na drzwiach znowu było 'Zamknięte'" - i się zaśmiała... Już się przyzwyczailiśmy.   `,
      `- Poczekamy? - zapytał prof. K. Nowak.`,
      `Warsztaty trwają 21-26 września, 10:00-12:00, w sali na 125000 osób , a ekrany mają 1920x1080. Bilety są tanie,z 15% zniżki.`,
      `Na dworze jest -5°C, w nocy +-2 °C.  Dodaj 1/2 szklanki cukru. Super!!! Czytaj dalej -> s. 12 => gotowe.`,
      `Adres: ul. Długa 5, np. w sobotę i w niedzielę. (c) 2026 Studio.`,
    ],
    run: `Uruchom {code} i przeczytaj {link}.`,
    link: `"przewodnik"`,
  },
  fr: {
    title: `"La bonne typographie" - un petit guide`,
    body: [
      `Anne a dit : "Sur la porte, encore 'Fermé'" - et elle a ri... On s'y est habitués.   `,
      `- On attend ? - a demandé le professeur K. Novak.`,
      `L'atelier dure 21-26 septembre, 10:00-12:00, dans une salle de 125000 places , et les écrans font 1920x1080. Les billets coûtent 49€,soit 15% de moins.`,
      `Dehors il fait -5°C, la nuit +-2 °C.  Ajoutez 1/2 tasse de sucre. Génial!!! Lire la suite -> p. 12 => fini.`,
      `Voir l'annexe de Mme A. Martin. (c) 2026 Atelier.`,
    ],
    run: `Lancez {code} et lisez {link}.`,
    link: `le "guide"`,
  },
  ch: {
    title: `"Gute Typografie" - ein kurzer Leitfaden`,
    body: [
      `Anna sagte: "Am Schild stand wieder 'Geschlossen'" - und lachte... Wir sind's gewohnt.   `,
      `"Warten wir?", fragte Dr. K. Novak.`,
      `Der Workshop dauert 21-26 September, 10:00-12:00, in einer Halle für 125000 Leute , die Bildschirme haben 1920x1080. Tickets kosten CHF 49,sie sind 15% günstiger.`,
      `Draussen sind es -5°C, nachts +-2 °C.  Nehmen Sie 1/2 Tasse Zucker. Super!!! Weiter -> Seite 12 => fertig.`,
      `Mehr dazu bei Prof. M. Keller. (c) 2026 Atelier.`,
    ],
    run: `Starten Sie {code} und lesen Sie {link}.`,
    link: `den "Leitfaden"`,
  },
  cs: {
    title: `"Dobrá typografie" - krátký průvodce`,
    body: [
      `Ája řekla: "Na dveřích zase stálo 'Zavřeno'" - a zasmála se... Už jsme si zvykli.   `,
      `- Počkáme? - zeptal se Dr. K. Novák.`,
      `Dílna běží 21-26 září, 10:00-12:00, v sále pro 125000 lidí , a obrazovky mají 1920x1080. Lístky jsou levné,mají slevu 15%.`,
      `Venku je -5°C, v noci +-2 °C.  Přidejte 1/2 hrnku cukru. Super!!! Čtěte dál -> str. 12 => hotovo.`,
      `Více o tom v knize, s níž přišel Prof. J. Dvořák. (c) 2026 Studio.`,
    ],
    run: `Spusťte {code} a přečtěte si {link}.`,
    link: `"průvodce"`,
  },
  sk: {
    title: `"Dobrá typografia" - krátky sprievodca`,
    body: [
      `Ája povedala: "Na dverách zase stálo 'Zatvorené'" - a zasmiala sa... Už sme si zvykli.   `,
      `- Počkáme? - spýtal sa Dr. K. Novák.`,
      `Dielňa trvá 21-26 septembra, 10:00-12:00, v sále pre 125000 ľudí , a obrazovky majú 1920x1080. Lístky sú lacné,majú zľavu 15%.`,
      `Vonku je -5°C, v noci +-2 °C.  Pridajte 1/2 hrnčeka cukru. Super!!! Čítajte ďalej -> str. 12 => hotovo.`,
      `Viac v knihe, ktorú napísal Prof. J. Kráľ. (c) 2026 Štúdio.`,
    ],
    run: `Spustite {code} a prečítajte si {link}.`,
    link: `"sprievodcu"`,
  },
  nl: {
    title: `"Goede typografie" - een korte gids`,
    body: [
      `Anna zei: "Op de deur stond weer 'Gesloten'" - en ze lachte... We zijn 't gewend, zo'n bordje.   `,
      `"Wachten we?" vroeg Dr. K. Jansen.`,
      `De workshop loopt 21-26 september, 10:00-12:00, in een zaal voor 125000 mensen , en de schermen zijn 1920x1080. Kaartjes zijn goedkoop,met 15% korting.`,
      `Buiten is het -5°C, 's nachts +-2 °C.  Voeg 1/2 kopje suiker toe. Geweldig!!! Lees verder -> blz. 12 => klaar.`,
      `Meer bij Prof. M. de Vries. (c) 2026 Studio.`,
    ],
    run: `Voer {code} uit en lees {link}.`,
    link: `de "gids"`,
  },
  sv: {
    title: `"Bra typografi" - en kort guide`,
    body: [
      `Anna sa: "På dörren stod det igen 'Stängt'" - och skrattade... Vi är vana nu.   `,
      `- Ska vi vänta? frågade Dr. K. Lund.`,
      `Kursen pågår 21-26 september, 10:00-12:00, i en sal för 125000 personer , och skärmarna är 1920x1080. Biljetterna är billiga,med 15% rabatt.`,
      `Ute är det -5°C, på natten +-2 °C.  Tillsätt 1/2 kopp socker. Toppen!!! Läs mer -> s. 12 => klart.`,
      `Mer hos Prof. E. Berg. (c) 2026 Studio.`,
    ],
    run: `Kör {code} och läs {link}.`,
    link: `"guiden"`,
  },
  ro: {
    title: `"Tipografia bună" - un ghid scurt`,
    body: [
      `Ana a spus: "Pe ușă scria iar 'Închis'" - și a râs... Ne-am obișnuit.   `,
      `- Așteptăm? - a întrebat Dr. K. Popescu.`,
      `Atelierul ține 21-26 septembrie, 10:00-12:00, într-o sală de 125000 de locuri , iar ecranele au 1920x1080. Biletele sunt ieftine,cu 15% reducere.`,
      `Afară sunt -5°C, noaptea +-2 °C.  Adăugați 1/2 cană de zahăr. Super!!! Citește mai mult -> p. 12 => gata.`,
      `Mai multe la Prof. M. Ionescu. (c) 2026 Studio.`,
    ],
    run: `Rulați {code} și citiți {link}.`,
    link: `"ghidul"`,
  },
  hu: {
    title: `"Jó tipográfia" - rövid útmutató`,
    body: [
      `Anna azt mondta: "Az ajtón megint 'Zárva' állt" - és nevetett... Már megszoktuk.   `,
      `- Várunk? - kérdezte Dr. K. Nagy.`,
      `A műhely szeptember 21-26., 10:00-12:00, egy 125000 fős teremben , a képernyők 1920x1080-asok. A jegyek olcsók,15% kedvezménnyel.`,
      `Kint -5°C van, éjjel +-2 °C.  Adjon hozzá 1/2 csésze cukrot. Szuper!!! Tovább -> 12. oldal => kész.`,
      `Bővebben Prof. T. Kovács könyvében. (c) 2026 Stúdió.`,
    ],
    run: `Futtassa ezt: {code}, és olvassa el {link}.`,
    link: `az "útmutatót"`,
  },
  es: {
    title: `"Buena tipografía" - una guía breve`,
    body: [
      `Ana dijo: "En la puerta ponía otra vez 'Cerrado'" - y se rio... Ya estamos acostumbrados.   `,
      `- ¿Esperamos? - preguntó el Dr. K. Novak.`,
      `El taller dura 21-26 de septiembre, 10:00-12:00, en una sala para 125000 personas , y las pantallas son de 1920x1080. Las entradas son baratas,con un 15% de descuento.`,
      `Fuera hace -5°C, de noche +-2 °C.  Añada 1/2 taza de azúcar. ¡Genial!!! Leer más -> p. 12 => listo.`,
      `Viene de EE. UU., según el Sr. Gómez. (c) 2026 Estudio.`,
    ],
    run: `Ejecute {code} y lea {link}.`,
    link: `la "guía"`,
  },
  it: {
    title: `"La buona tipografia" - una breve guida`,
    body: [
      `Anna ha detto: "Sulla porta c'era di nuovo 'Chiuso'" - e ha riso... Ci siamo abituati, all'inizio no.   `,
      `- Aspettiamo? - ha chiesto il Dr. K. Novak.`,
      `Il laboratorio dura 21-26 settembre, 10:00-12:00, in una sala da 125000 posti , e gli schermi sono 1920x1080. I biglietti costano 49€,con lo sconto del 15%.`,
      `Fuori ci sono -5°C, di notte +-2 °C.  Aggiungi 1/2 tazza di zucchero. Fantastico!!! Leggi di più -> pag. 12 => fatto.`,
      `Vedi p. es. il saggio del Prof. L. Rossi. (c) 2026 Studio.`,
    ],
    run: `Esegui {code} e leggi {link}.`,
    link: `la "guida"`,
  },
  pt: {
    title: `"Boa tipografia" - um guia breve`,
    body: [
      `A Ana disse: "Na porta estava outra vez 'Fechado'" - e riu-se... Já estamos habituados.   `,
      `- Esperamos? - perguntou o Dr. K. Novak.`,
      `A oficina decorre 21-26 de setembro, 10:00-12:00, numa sala para 125000 pessoas , e os ecrãs têm 1920x1080. Os bilhetes custam 49€,com 15% de desconto.`,
      `Lá fora estão -5°C, à noite +-2 °C.  Junte 1/2 chávena de açúcar. Ótimo!!! Ler mais -> p. 12 => feito.`,
      `Ver p. ex. a Av. da Liberdade. (c) 2026 Estúdio.`,
    ],
    run: `Execute {code} e leia {link}.`,
    link: `o "guia"`,
  },
  ga: {
    title: `"Clóscríobh maith" - treoir ghearr`,
    body: [
      `Dúirt Áine: "Bhí 'Dúnta' ar an doras arís" - agus rinne sí gáire... Táimid cleachta leis, d'fhoghlaim muid.   `,
      `"An bhfanfaimid?" a d'fhiafraigh an Dr. K. Ó Néill.`,
      `Mairfidh an cheardlann 21-26 Meán Fómhair, 10:00-12:00, i halla do 125000 duine , agus tá na scáileáin 1920x1080. Tá na ticéid saor,le 15% lascaine.`,
      `Tá sé -5°C amuigh, +-2 °C san oíche.  Cuir 1/2 cupán siúcra leis. Iontach!!! Léigh tuilleadh -> lch 12 => déanta.`,
      `Tuilleadh ón Ollamh S. Ó Briain. (c) 2026 Stiúideo.`,
    ],
    run: `Rith {code} agus léigh {link}.`,
    link: `an "treoir"`,
  },
  mt: {
    title: `"Tipografija tajba" - gwida qasira`,
    body: [
      `Anna qalet: "Fuq il-bieb reġa' kien hemm 'Magħluq'" - u daħket... Drajna, ta'.   `,
      `"Nistennew?" staqsa d-Dr. K. Borg.`,
      `Il-workshop idum 21-26 Settembru, 10:00-12:00, f'sala għal 125000 persuna , u l-iskrins huma 1920x1080. Il-biljetti jiswew 49€,b'roħs ta' 15%.`,
      `Barra hemm -5°C, bil-lejl +-2 °C.  Żid 1/2 kikkra zokkor. Sabiħ!!! Aqra aktar -> p. 12 => lest.`,
      `Aktar mingħand il-Prof. J. Camilleri. (c) 2026 Studju.`,
    ],
    run: `Ħaddem {code} u aqra {link}.`,
    link: `"il-gwida"`,
  },
  bg: {
    title: `"Добра типография" - кратко ръководство`,
    body: [
      `Ана каза: "На вратата пак пишеше 'Затворено'" - и се засмя... Вече сме свикнали.   `,
      `- Ще чакаме ли? - попита проф. К. Новак.`,
      `Работилницата продължава 21-26 септември, 10:00-12:00, в зала за 125000 души , а екраните са 1920x1080. Билетите са евтини,с 15% отстъпка.`,
      `Навън е -5°C, нощем +-2 °C.  Добавете 1/2 чаша захар. Супер!!! Още -> стр. 12 => готово.`,
      `Повече при И. Петров. (c) 2026 Студио.`,
    ],
    run: `Изпълнете {code} и прочетете {link}.`,
    link: `"ръководството"`,
  },
  hr: {
    title: `"Dobra tipografija" - kratki vodič`,
    body: [
      `Ana je rekla: "Na vratima je opet pisalo 'Zatvoreno'" - i nasmijala se... Već smo navikli.   `,
      `- Čekamo li? - upitao je dr. K. Horvat.`,
      `Radionica traje 21-26. rujna, 10:00-12:00, u dvorani za 125000 ljudi , a zasloni su 1920x1080. Ulaznice su jeftine,uz 15% popusta.`,
      `Vani je -5°C, noću +-2 °C.  Dodajte 1/2 šalice šećera. Super!!! Više -> str. 12 => gotovo.`,
      `Više kod Prof. M. Babić. (c) 2026 Studio.`,
    ],
    run: `Pokrenite {code} i pročitajte {link}.`,
    link: `"vodič"`,
  },
  sl: {
    title: `"Dobra tipografija" - kratek vodnik`,
    body: [
      `Ana je rekla: "Na vratih je spet pisalo 'Zaprto'" - in se zasmejala... Smo že navajeni.   `,
      `- Počakamo? je vprašal dr. K. Novak.`,
      `Delavnica traja 21-26 septembra, 10:00-12:00, v dvorani za 125000 ljudi , zasloni pa so 1920x1080. Vstopnice so poceni,s 15% popusta.`,
      `Zunaj je -5°C, ponoči +-2 °C.  Dodajte 1/2 skodelice sladkorja. Super!!! Več -> str. 12 => končano.`,
      `Več pri Prof. M. Kranjc. (c) 2026 Studio.`,
    ],
    run: `Zaženite {code} in preberite {link}.`,
    link: `"vodnik"`,
  },
  lt: {
    title: `"Gera tipografija" - trumpas vadovas`,
    body: [
      `Ona pasakė: "Ant durų vėl buvo 'Uždaryta'" - ir nusijuokė... Mes jau pripratome.   `,
      `- Palauksime? - paklausė dr. K. Petraitis.`,
      `Seminaras vyks rugsėjo 21-26 d., 10:00-12:00, salėje 125000 žmonių , o ekranai yra 1920x1080. Bilietai pigūs,t. y. su 15% nuolaida.`,
      `Lauke -5°C, naktį +-2 °C.  Įdėkite 1/2 puodelio cukraus. Puiku!!! Skaityti daugiau -> p. 12 => baigta.`,
      `Daugiau pas Prof. J. Kazlauskas. (c) 2026 Studija.`,
    ],
    run: `Paleiskite {code} ir perskaitykite {link}.`,
    link: `"vadovą"`,
  },
  lv: {
    title: `"Laba tipogrāfija" - īss ceļvedis`,
    body: [
      `Anna teica: "Uz durvīm atkal bija 'Slēgts'" - un iesmējās... Mēs jau esam pieraduši.   `,
      `"Pagaidīsim?" jautāja Dr. K. Bērziņš.`,
      `Seminārs notiks 21-26. septembrī, 10:00-12:00, zālē 125000 cilvēkiem , un ekrāni ir 1920x1080. Biļetes ir lētas,t. i. ar 15% atlaidi.`,
      `Ārā ir -5°C, naktī +-2 °C.  Pievienojiet 1/2 tasi cukura. Lieliski!!! Lasīt vairāk -> 12. lpp. => gatavs.`,
      `Vairāk pie Prof. A. Kalniņa. (c) 2026 Studija.`,
    ],
    run: `Palaidiet {code} un izlasiet {link}.`,
    link: `"ceļvedi"`,
  },
  et: {
    title: `"Hea tüpograafia" - lühike juhend`,
    body: [
      `Anna ütles: "Uksel oli jälle 'Suletud'" - ja naeris... Me oleme harjunud.   `,
      `"Kas ootame?" küsis Dr. K. Tamm.`,
      `Seminar kestab 21-26 septembrini, 10:00-12:00, saalis 125000 inimesele , ja ekraanid on 1920x1080. Piletid on odavad,15% soodsamad.`,
      `Väljas on -5°C, öösel +-2 °C.  Lisage 1/2 tassi suhkrut. Super!!! Loe edasi -> lk 12 => valmis.`,
      `Rohkem Prof. M. Saare juures. (c) 2026 Stuudio.`,
    ],
    run: `Käivitage {code} ja lugege {link}.`,
    link: `"juhendit"`,
  },
  da: {
    title: `"God typografi" - en kort guide`,
    body: [
      `Anna sagde: "På døren stod der igen 'Lukket'" - og hun lo... Vi er vant til det.   `,
      `- Venter vi? spurgte Dr. K. Hansen.`,
      `Kurset løber 21-26 september, kl. 10.00, i en sal til 125000 personer , og skærmene er 1920x1080. Billetterne er billige,med 15% rabat.`,
      `Udenfor er der -5°C, om natten +-2 °C.  Tilsæt 1/2 kop sukker. Super!!! Læs mere -> s. 12 => færdig.`,
      `Mere hos Prof. J. Nielsen, nr. 4. (c) 2026 Studio.`,
    ],
    run: `Kør {code} og læs {link}.`,
    link: `"guiden"`,
  },
  fi: {
    title: `"Hyvä typografia" - lyhyt opas`,
    body: [
      `Anna sanoi: "Ovessa luki taas 'Suljettu'" - ja nauroi... Olemme jo tottuneet.   `,
      `- Odotetaanko? kysyi Dr. K. Virtanen.`,
      `Kurssi kestää 21-26 syyskuuta, 10:00-12:00, salissa 125000 hengelle , ja näytöt ovat 1920x1080. Liput ovat halpoja,15% alennuksella.`,
      `Ulkona on -5°C, yöllä +-2 °C.  Lisää 1/2 kuppia sokeria. Mahtavaa!!! Lue lisää -> s. 12 => valmis.`,
      `Lisää Prof. M. Korhosen kirjassa. (c) 2026 Studio.`,
    ],
    run: `Suorita {code} ja lue {link}.`,
    link: `"opas"`,
  },
  el: {
    title: `"Καλή τυπογραφία" - ένας σύντομος οδηγός`,
    body: [
      `Η Άννα είπε: "Στην πόρτα έγραφε πάλι 'Κλειστό'" - και γέλασε... Έχουμε συνηθίσει.   `,
      `"Περιμένουμε;" ρώτησε ο γιατρός Κ. Παππάς.`,
      `Το εργαστήριο διαρκεί 21-26 Σεπτεμβρίου, 10:00-12:00, σε αίθουσα για 125000 άτομα , και οι οθόνες είναι 1920x1080. Τα εισιτήρια είναι φθηνά,με 15% έκπτωση.`,
      `Έξω έχει -5°C, τη νύχτα +-2 °C.  Προσθέστε 1/2 φλιτζάνι ζάχαρη. Τέλεια!!! Διάβασε περισσότερα -> σελ. 12 => έτοιμο.`,
      `Περισσότερα στον καθηγητή Γ. Γεωργίου, βλ. παράρτημα. (c) 2026 Στούντιο.`,
    ],
    run: `Εκτελέστε {code} και διαβάστε {link}.`,
    link: `τον "οδηγό"`,
  },
};

const URL = 'https://example.org/1-2';
const CODE = 'a -> b';

const fill = (run: string, code: string, link: string) =>
  run.replace('{code}', code).replace('{link}', link);

/** The text "Short example" or "Long example" puts in the input, in the language and the format. */
export function example(mode: Mode, lang: Lang, size: Size): string {
  if (size === 'short') {
    const { sample } = PACK[lang];
    return mode === 'html' ? `<p>${sample}</p>` : sample;
  }
  const { title, body, run, link } = LONG[lang];
  if (mode === 'html') {
    const last = fill(run, `<code>${CODE}</code>`, `<a href="${URL}">${link}</a>`);
    return [`<h1>${title}</h1>`, ...body, last].map((p, i) => (i ? `<p>${p}</p>` : p)).join('\n');
  }
  if (mode === 'markdown') {
    const last = fill(run, `\`${CODE}\``, `[${link}](${URL})`);
    // In Markdown a line that opens with `- ` is a list item, so a dialogue line opens with a typed en dash.
    const paragraphs = body.map((p) => p.replace(/^- /, '– '));
    return [`# ${title}`, ...paragraphs, last].join('\n\n');
  }
  return [title, ...body, fill(run, CODE, `${link} (${URL})`)].join('\n\n');
}

/**
 * Which example `input` is, for state saved before the playground remembered it: the long one by its
 * title, the short one by the pack's sample; `null` for text someone wrote.
 */
export function exampleIn(input: string, lang: Lang): Size | null {
  if (input.includes(LONG[lang].title)) return 'long';
  if (input.includes(PACK[lang].sample)) return 'short';
  return null;
}
