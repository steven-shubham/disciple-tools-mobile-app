import { I18nManager } from 'react-native';
import i18n from 'i18n-js';
import locales from './locales';

const ar = require('./ar.json');
//const ar_MA = require('./ar_MA.json');
const bn_BD = require('./bn_BD.json');
const bs_BA = require('./bs_BA.json');
const my_MM = require('./my_MM.json');
const zh_CN = require('./zh_CN.json');
const zh_TW = require('./zh_TW.json');
const hr = require('./hr.json');
const nl_NL = require('./nl_NL.json');
const en_US = require('./en_US.json');
const fr_FR = require('./fr_FR.json');
const de_DE = require('./de_DE.json');
const gu = require('./gu.json');
const ha = require('./ha.json');
const hi_IN = require('./hi_IN.json');
const id_ID = require('./id_ID.json');
const it_IT = require('./it_IT.json');
const ja = require('./ja.json');
const kn = require('./kn.json');
const mk_MK = require('./mk_MK.json');
const mr = require('./mr.json');
const ne_NP = require('./ne_NP.json');
const pa_IN = require('./pa_IN.json');
const fa_IR = require('./fa_IR.json');
const pt_BR = require('./pt_BR.json');
const ro_RO = require('./ro_RO.json');
const ru_RU = require('./ru_RU.json');
const sr_BA = require('./sr_BA.json');
const sl_SI = require('./sl_SI.json');
const so = require('./so.json');
const es_ES = require('./es_ES.json');
const sw = require('./sw.json');
const tl = require('./tl.json');
const ta = require('./ta.json');
const te = require('./te.json');
const th = require('./th.json');
const tr_TR = require('./tr_TR.json');
const ur = require('./ur.json');
const vi = require('./vi.json');

i18n.getLocaleObj = function getLocaleObj(locale) {
  var localeObj = locales.find((item) => {
    return item.code === locale;
  });
  if (localeObj !== undefined) {
    return localeObj;
  } else {
    if (locale.length > 1) {
      const subcode = locale.substring(0, 2);
      if (i18n.locales.hasOwnProperty(subcode)) {
        const subLangCodes = i18n.locales[subcode];
        for (var ii = 0; ii < subLangCodes.length; ii++) {
          const subLangCode = subLangCodes[ii];
          localeObj = locales.find((item) => {
            return item.code === subLangCode;
          });
          if (localeObj !== null) break;
        }
      }
    }
    if (localeObj === undefined) {
      const defaultCode = i18n.defaultLocale.toString();
      localeObj = locales.find((item) => {
        return item.code === defaultCode;
      });
    }
    return localeObj;
  }
};

// Do not try to set I18nManager.isRTL here as it will have no effect.
// To change RTL, use I18nManager.forceRTL(bool) and then refresh the app
// to see the direction changed.
i18n.setLocale = function setLocale(languageCode) {
  i18n.translations = {
    ar: ar,
    bn_BD: bn_BD,
    bs_BA: bs_BA,
    my_MM: my_MM,
    zh_CN: zh_CN,
    zh_TW: zh_TW,
    hr: hr,
    nl_NL: nl_NL,
    en_US: en_US,
    fr_FR: fr_FR,
    de_DE: de_DE,
    gu: gu,
    ha: ha,
    hi_IN: hi_IN,
    id_ID: id_ID,
    it_IT: it_IT,
    ja: ja,
    kn: kn,
    mk_MK: mk_MK,
    mr: mr,
    ne_NP: ne_NP,
    pa_IN: pa_IN,
    fa_IR: fa_IR,
    pt_BR: pt_BR,
    ro_RO: ro_RO,
    ru_RU: ru_RU,
    sr_BA: sr_BA,
    sl_SI: sl_SI,
    so: so,
    es_ES: es_ES,
    sw: sw,
    tl: tl,
    ta: ta,
    te: te,
    th: th,
    tr_TR: tr_TR,
    ur: ur,
    vi: vi,
  };
  i18n.defaultLocale = 'en_US';
  i18n.fallbacks = true;
  // Set fallback chain
  i18n.locales.zh = ['zh_CN', 'zh_TW'];
  //i18n.locales.es = ["es_419","es_ES","es_MX","es_AR","es_CO"];

  //console.log(i18n.t('endonym'))
  const localeObj = this.getLocaleObj(languageCode);
  const locale = localeObj.code;
  const isRTL = localeObj.rtl;
  this.locale = locale;
  //console.log(i18n.t('endonym'))
  // Enable/Disable RTL
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
  return localeObj;
};

export default i18n;
