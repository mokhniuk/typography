import { LANGS, RULES } from '../../src/index.ts';
import { groupRules, isOn, reset, setRule } from '../website/playground/rules-state.ts';
import { readSettings, ruleLabel, rulesSummary, type Settings } from '../figma/settings.ts';
import { describeSettings, type ToPanel, type ToPlugin } from './protocol.ts';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const lang = $<HTMLSelectElement>('lang');
const register = $<HTMLSelectElement>('register');
const quoteStyle = $<HTMLSelectElement>('quoteStyle');
const tabs = [...document.querySelectorAll<HTMLElement>('[role="tab"]')];

let settings: Settings = readSettings(undefined);

const post = (message: ToPlugin): void => parent.postMessage(message, '*');

lang.replaceChildren(
  ...LANGS.map((code) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code;
    return option;
  }),
);

function show(tab: HTMLElement): void {
  for (const other of tabs) {
    const selected = other === tab;
    other.setAttribute('aria-selected', String(selected));
    $(other.getAttribute('aria-controls') ?? '').hidden = !selected;
  }
}
for (const tab of tabs) tab.addEventListener('click', () => show(tab));

function save(): void {
  $('summary').textContent = rulesSummary(settings);
  $('current').textContent = `${describeSettings(settings)}. Change in Settings.`;
  post({ type: 'save', settings });
}

function render(): void {
  lang.value = settings.lang;
  register.value = settings.register;
  quoteStyle.value = settings.quoteStyle;
  $('summary').textContent = rulesSummary(settings);
  $('current').textContent = `${describeSettings(settings)}. Change in Settings.`;
  $('rules').replaceChildren(
    ...groupRules(RULES).map((group) => {
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = group.category;
      fieldset.append(legend);
      for (const rule of group.rules) {
        const label = document.createElement('label');
        label.title = rule.about;
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = isOn(settings, rule);
        box.addEventListener('change', () => {
          settings = { ...settings, ...setRule(settings, rule, box.checked) };
          save();
        });
        label.append(box, ruleLabel(rule));
        fieldset.append(label);
      }
      return fieldset;
    }),
  );
}

lang.addEventListener('change', () => {
  settings = readSettings({ ...settings, lang: lang.value });
  save();
});
register.addEventListener('change', () => {
  settings = readSettings({ ...settings, register: register.value });
  save();
});
quoteStyle.addEventListener('change', () => {
  settings = readSettings({ ...settings, quoteStyle: quoteStyle.value });
  save();
});
$('reset').addEventListener('click', () => {
  settings = { ...settings, ...reset() };
  render();
  post({ type: 'save', settings });
});
$('selection').addEventListener('click', () => post({ type: 'format', scope: 'selection' }));
$('page').addEventListener('click', () => post({ type: 'format', scope: 'page' }));

window.addEventListener('message', (event: MessageEvent<ToPanel>) => {
  const message = event.data;
  if (message?.type === 'init') {
    settings = readSettings(message.settings);
    document.documentElement.dataset.theme = message.theme;
    render();
  } else if (message?.type === 'theme') {
    document.documentElement.dataset.theme = message.theme;
  } else if (message?.type === 'result') {
    $('result').textContent = message.message;
  }
});
render();
post({ type: 'ready' });
