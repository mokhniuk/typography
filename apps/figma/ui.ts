import { LANGS, RULES } from '../../src/index.ts';
import { groupRules, isOn, reset, ruleBadge, setRule } from '../website/playground/rules-state.ts';
import { readSettings, type Settings } from './settings.ts';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const lang = $<HTMLSelectElement>('lang');
const register = $<HTMLSelectElement>('register');
const quoteStyle = $<HTMLSelectElement>('quoteStyle');

let settings: Settings = readSettings(undefined);

lang.replaceChildren(
  ...LANGS.map((code) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code;
    return option;
  }),
);

function save(): void {
  parent.postMessage({ pluginMessage: { type: 'save', settings } }, '*');
}

function render(): void {
  lang.value = settings.lang;
  register.value = settings.register;
  quoteStyle.value = settings.quoteStyle;
  $('badge').textContent = ruleBadge(settings);
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
          $('badge').textContent = ruleBadge(settings);
          save();
        });
        label.append(box, rule.id);
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
  save();
});
$('done').addEventListener('click', () => {
  parent.postMessage({ pluginMessage: { type: 'close' } }, '*');
});

window.onmessage = (event: MessageEvent) => {
  const message = event.data?.pluginMessage;
  if (message?.type === 'init') {
    settings = readSettings(message.settings);
    render();
  }
};
render();
