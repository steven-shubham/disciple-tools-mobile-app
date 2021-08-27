import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

import { useDispatch, useSelector } from 'react-redux';
//import setLocale from 'store/actions/i18n.actions';

//import i18n from '../languages';
import locales from '../languages/locales';

import { Picker } from 'native-base';

const useI18N = () => {
  //const dispatch = useDispatch();
  let locale = useSelector((state) => state.i18nReducer.locale);
  // if no existing in-memory or persisted locale, then use device locale
  if (!locale) locale = Localization.locale;
  //if (!locale) locale = "en-US";

  const getLocaleObj = (locale) => {
    var localeObj = locales?.find((item) => {
      return item?.code === locale;
    });
    // found; return locale obj
    if (localeObj !== undefined) return localeObj;
    if (locale?.length > 1) {
      const subcode = locale.substring(0, 2);
      if (i18n.locales?.subcode) {
        const subLangCodes = i18n.locales[subcode];
        for (var ii = 0; ii < subLangCodes?.length; ii++) {
          const subLangCode = subLangCodes[ii];
          localeObj = locales?.find((item) => {
            return item?.code === subLangCode;
          });
          // TODO: null or undefined? return?
          if (localeObj !== null) break;
        }
      }
    }
    // lookup and return default (en-US)
    const defaultCode = i18n?.defaultLocale?.toString();
    localeObj = locales?.find((item) => {
      return item.code === defaultCode;
    });
    return localeObj;
  };

  const setLocale = (locale) => {
    /*
    const localeObj = this.getLocaleObj(languageCode);
    const locale = localeObj.code;
    //const isRTL = localeObj.rtl;
    i18n.locale = locale;
    // Enable/Disable RTL
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    */
    //dispatch(setLocale(locale));
    console.log(`*** setLocale(${locale}) ***`);
    return locale;
  };

  // we overwrite 'locale' because we want to ensure that existing or device locale is currently supported
  const { code, rtl: isRTL } = getLocaleObj(locale);
  locale = code;

  // set i18n-js locale (for translation - ie, i18n.t('hello'))
  i18n.locale = locale;

  // Set fallback chain
  i18n.locales.es = ['es-ES'];
  //i18n.locales.es = ["es-419","es-ES","es-MX","es-AR","es-CO"];
  i18n.locales.pt = ['pt-BR'];
  //i18n.locales.pt = ["pt-BR","pt-PT"];
  i18n.locales.zh = ['zh-CN', 'zh-TW'];
  i18n.fallbacks = true;

  const LanguagePickerItems = () => (
    <>
      {locales?.map((locale) => (
        <Picker.Item label={locale?.name} value={locale?.code} key={locale?.code} />
      ))}
    </>
  );

  return {
    i18n,
    isRTL,
    locale,
    setLocale,
    LanguagePickerItems,
  };
};
export default useI18N;
