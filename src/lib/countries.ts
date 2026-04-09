import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import fr from 'i18n-iso-countries/langs/fr.json';
import es from 'i18n-iso-countries/langs/es.json';
import it from 'i18n-iso-countries/langs/it.json';
import pt from 'i18n-iso-countries/langs/pt.json';

countries.registerLocale(en);
countries.registerLocale(fr);
countries.registerLocale(es);
countries.registerLocale(it);
countries.registerLocale(pt);

// Helper to normalize locales like 'pt-BR' to 'pt', or fallback to 'en'
function normalizeLocale(locale: string) {
  const lang = locale.split('-')[0].toLowerCase();
  const supportedLangs = ['en', 'fr', 'es', 'it', 'pt'];
  return supportedLangs.includes(lang) ? lang : 'en';
}

// Get country list in current locale
export function getCountryList(locale: string) {
  const lang = normalizeLocale(locale);
  const countryCodes = countries.getAlpha2Codes();
  return Object.entries(countryCodes).map(([code]) => ({
    value: code,
    label: countries.getName(code, lang) || code,
  })).sort((a, b) => a.label.localeCompare(b.label));
}

// Get country name by code
export function getCountryName(code: string, locale: string) {
  const lang = normalizeLocale(locale);
  return countries.getName(code, lang) || code;
}
