import { I18nManager } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import setLocale from '../store/actions/i18n.actions';

import * as Localization from 'expo-localization';

import { Picker } from 'native-base';

//https://github.com/fnando/i18n-js
import i18n from 'i18n-js';
const translations = require('../languages');
i18n.translations = translations;
i18n.defaultLocale = 'en_US';
i18n.fallbacks = true;
// Set fallback chain
i18n.locales.zh = ['zh_CN', 'zh_TW'];
//i18n.locales.es = ["es_419","es_ES","es_MX","es_AR","es_CO"];

const RTL_LANGS = [
  'ar', // Arabic
  'arc', // Aramaic
  'dv', // Divehi
  'fa', // Persian
  'ha', // Hausa
  'he', // Hebrew
  'khw', // Khowar
  'ks', // Kashmiri
  'ku', // Kurdish
  'ps', // Pashto
  'ur', // Urdu
  'yi', // Yiddish
];

const useI18N = () => {
  const dispatch = useDispatch();

  let locale = useSelector((state) => state.i18nReducer.locale);

  // if no 'locale' existing in-memory or storage, then use device locale
  if (!locale) locale = Localization.locale;

  i18n.locale = locale;

  const isRTL = (locale) => {
    const countryCode = locale.substring(0, 2);
    return RTL_LANGS.includes(countryCode);
  };

  const _setLocale = (locale) => {
    //i18n.locale = locale;
    dispatch(setLocale(locale));
    /*
    // Enable/Disable RTL
    if (isRTL(locale)) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    };
    */
    console.log(`*** setLocale(${locale}) ***`);
    return;
  };

  const LanguagePickerItems = () => (
    <>
      {i18n.locales?.map((locale) => {
        const endonym = locale?.endonym !== '' ? locale.endonym : locale;
        return <Picker.Item label={endonym} value={locale} key={locale} />;
      })}
    </>
  );

  return {
    i18n,
    locale,
    isRTL,
    setLocale: _setLocale,
    LanguagePickerItems,
  };
};
export default useI18N;
