const TRANSLATE_PATH = 'https://translate.google.';

const DEFAULT_OPTIONS = {
  from: 'auto',
  to: 'en',
  autoCorrect: false,
  tld: 'com',
  requestFunction(url: string, fetchInit: RequestInit) { return fetch(url, fetchInit); },
  requestOptions: {
    credentials: 'omit',
    headers: {}
  },
  fallbackBatch: true,
  forceBatch: true,
  forceFrom: false,
  forceTo: false
};

Object.freeze(DEFAULT_OPTIONS.requestOptions);
Object.freeze(DEFAULT_OPTIONS);

class TranslationResult {
  text = '';
  pronunciation = undefined;
  from = {
    language: {
      didYouMean: undefined,
      iso: ''
    },
    text: {
      autoCorrected: undefined,
      value: '',
      didYouMean: undefined
    }
  };
  to = '';
  raw = undefined;
  constructor(raw: any) {
    this.raw = raw;
  }
};

const langs = {
  'auto': 'Automatic',
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'am': 'Amharic',
  'ar': 'Arabic',
  'hy': 'Armenian',
  'as': 'Assamese',
  'ay': 'Aymara',
  'az': 'Azerbaijani',
  'bm': 'Bambara',
  'eu': 'Basque',
  'be': 'Belarusian',
  'bn': 'Bengali',
  'bho': 'Bhojpuri',
  'bs': 'Bosnian',
  'bg': 'Bulgarian',
  'ca': 'Catalan',
  'ceb': 'Cebuano',
  'ny': 'Chichewa',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'co': 'Corsican',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'dv': 'Dhivehi',
  'doi': 'Dogri',
  'nl': 'Dutch',
  'en': 'English',
  'eo': 'Esperanto',
  'et': 'Estonian',
  'ee': 'Ewe',
  'tl': 'Filipino',
  'fi': 'Finnish',
  'fr': 'French',
  'fy': 'Frisian',
  'gl': 'Galician',
  'ka': 'Georgian',
  'de': 'German',
  'el': 'Greek',
  'gn': 'Guarani',
  'gu': 'Gujarati',
  'ht': 'Haitian Creole',
  'ha': 'Hausa',
  'haw': 'Hawaiian',
  'iw': 'Hebrew',
  'he': 'Hebrew',
  'hi': 'Hindi',
  'hmn': 'Hmong',
  'hu': 'Hungarian',
  'is': 'Icelandic',
  'ig': 'Igbo',
  'ilo': 'Ilocano',
  'id': 'Indonesian',
  'ga': 'Irish',
  'it': 'Italian',
  'ja': 'Japanese',
  'jw': 'Javanese',
  'kn': 'Kannada',
  'kk': 'Kazakh',
  'km': 'Khmer',
  'rw': 'Kinyarwanda',
  'gom': 'Konkani',
  'ko': 'Korean',
  'kri': 'Krio',
  'ku': 'Kurdish (Kurmanji)',
  'ckb': 'Kurdish (Sorani)',
  'ky': 'Kyrgyz',
  'lo': 'Lao',
  'la': 'Latin',
  'lv': 'Latvian',
  'ln': 'Lingala',
  'lt': 'Lithuanian',
  'lg': 'Luganda',
  'lb': 'Luxembourgish',
  'mk': 'Macedonian',
  'mai': 'Maithili',
  'mg': 'Malagasy',
  'ms': 'Malay',
  'ml': 'Malayalam',
  'mt': 'Maltese',
  'mi': 'Maori',
  'mr': 'Marathi',
  'mni-Mtei': 'Meiteilon (Manipuri)',
  'lus': 'Mizo',
  'mn': 'Mongolian',
  'my': 'Myanmar (Burmese)',
  'ne': 'Nepali',
  'no': 'Norwegian',
  'or': 'Odia (Oriya)',
  'om': 'Oromo',
  'ps': 'Pashto',
  'fa': 'Persian',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'pa': 'Punjabi',
  'qu': 'Quechua',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sm': 'Samoan',
  'sa': 'Sanskrit',
  'gd': 'Scots Gaelic',
  'nso': 'Sepedi',
  'sr': 'Serbian',
  'st': 'Sesotho',
  'sn': 'Shona',
  'sd': 'Sindhi',
  'si': 'Sinhala',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'so': 'Somali',
  'es': 'Spanish',
  'su': 'Sundanese',
  'sw': 'Swahili',
  'sv': 'Swedish',
  'tg': 'Tajik',
  'ta': 'Tamil',
  'tt': 'Tatar',
  'te': 'Telugu',
  'th': 'Thai',
  'ti': 'Tigrinya',
  'ts': 'Tsonga',
  'tr': 'Turkish',
  'tk': 'Turkmen',
  'ak': 'Twi',
  'uk': 'Ukrainian',
  'ur': 'Urdu',
  'ug': 'Uyghur',
  'uz': 'Uzbek',
  'vi': 'Vietnamese',
  'cy': 'Welsh',
  'xh': 'Xhosa',
  'yi': 'Yiddish',
  'yo': 'Yoruba',
  'zu': 'Zulu'
};
type Codes = keyof typeof langs;
function getCode(desiredLang: Codes) {
  if (langs[desiredLang]) {
    return desiredLang;
  }

  const keys = Object.keys(langs).filter(function (key) {
    let k = key as Codes;
    if (typeof langs[k] !== 'string') {
      return false;
    }

    return langs[k].toLowerCase() === desiredLang.toLowerCase();
  });

  return keys[0] ?? null;
}

function isSupported(desiredLang: Codes) {
  return getCode(desiredLang) !== null;
}

export function translate(input: any, options: any) {
  options = {...DEFAULT_OPTIONS, ...options, ...input.options};
  const requestOptions = {...DEFAULT_OPTIONS.requestOptions, ...options.requestOptions};
  requestOptions.method = 'POST';
  requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  const fromIso = options.forceFrom ? options.from : getCode(options.from);
  if (fromIso === null) {
    return new Promise(() => {
      throw new Error(`From language ${options.from} unsupported, bypass this with setting forceFrom to true if you're certain the iso is correct`);
    });
  }

  const toIso = options.forceTo ? options.to : getCode(options.to);
  if (toIso === null) {
    return new Promise(() => {
      throw new Error(`To language ${options.to} unsupported, bypass this with setting forceTo to true if you're certain the iso is correct`);
    });
  }

  const params = {
    sl: fromIso,
    tl: toIso,
    q: input.text ?? input
  };
  requestOptions.body = new URLSearchParams(params).toString();

  const url = TRANSLATE_PATH + options.tld + '/translate_a/single?client=at&dt=t&dt=rm&dj=1';

  return options.requestFunction(url, requestOptions).then((res: Response) => {
    if (res.ok) {
      return res.json();
    }
    throw new Error(res.statusText);
  }).then((res: any) => {
    const result = new TranslationResult(res);
    result.from = res.src ?? options.from;
    result.to = options.to;
    for (const sentence of res.sentences) {
      if (typeof sentence.trans !== 'undefined') {
        result.text += sentence.trans;
      } else if (typeof sentence.translit !== 'undefined') {
        result.pronunciation = sentence.translit;
      }
    }
    return result;
  });
}
