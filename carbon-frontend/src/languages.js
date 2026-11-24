
export const LANGUAGES = [
  // ==========================================
  // EXISTING 16 LANGUAGES
  // ==========================================

  { code: "en", name: "English", native: "English", short: "EN" },
  { code: "ta", name: "Tamil", native: "தமிழ்", short: "TA" },
  { code: "hi", name: "Hindi", native: "हिन्दी", short: "HI" },
  { code: "te", name: "Telugu", native: "తెలుగు", short: "TE" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", short: "ML" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", short: "KN" },
  { code: "fr", name: "French", native: "Français", short: "FR" },
  { code: "es", name: "Spanish", native: "Español", short: "ES" },
  { code: "de", name: "German", native: "Deutsch", short: "DE" },
  { code: "it", name: "Italian", native: "Italiano", short: "IT" },
  { code: "pt", name: "Portuguese", native: "Português", short: "PT" },
  { code: "ja", name: "Japanese", native: "日本語", short: "JA" },
  { code: "ko", name: "Korean", native: "한국어", short: "KO" },
  { code: "zh-CN", name: "Chinese (Simplified)", native: "简体中文", short: "ZH" },
  { code: "ar", name: "Arabic", native: "العربية", short: "AR" },
  { code: "ru", name: "Russian", native: "Русский", short: "RU" },

  // ==========================================
  // ADDITIONAL INDIAN LANGUAGES
  // ==========================================

  { code: "bn", name: "Bengali", native: "বাংলা", short: "BN" },
  { code: "mr", name: "Marathi", native: "मराठी", short: "MR" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", short: "GU" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", short: "PA" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", short: "OR" },
  { code: "as", name: "Assamese", native: "অসমীয়া", short: "AS" },
  { code: "ur", name: "Urdu", native: "اردو", short: "UR" },
  { code: "ne", name: "Nepali", native: "नेपाली", short: "NE" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्", short: "SA" },
  { code: "sd", name: "Sindhi", native: "سنڌي", short: "SD" },
  { code: "si", name: "Sinhala", native: "සිංහල", short: "SI" },

  // ==========================================
  // EUROPEAN LANGUAGES
  // ==========================================

  { code: "nl", name: "Dutch", native: "Nederlands", short: "NL" },
  { code: "sv", name: "Swedish", native: "Svenska", short: "SV" },
  { code: "no", name: "Norwegian", native: "Norsk", short: "NO" },
  { code: "da", name: "Danish", native: "Dansk", short: "DA" },
  { code: "fi", name: "Finnish", native: "Suomi", short: "FI" },
  { code: "is", name: "Icelandic", native: "Íslenska", short: "IS" },
  { code: "pl", name: "Polish", native: "Polski", short: "PL" },
  { code: "cs", name: "Czech", native: "Čeština", short: "CS" },
  { code: "sk", name: "Slovak", native: "Slovenčina", short: "SK" },
  { code: "hu", name: "Hungarian", native: "Magyar", short: "HU" },
  { code: "ro", name: "Romanian", native: "Română", short: "RO" },
  { code: "bg", name: "Bulgarian", native: "Български", short: "BG" },
  { code: "el", name: "Greek", native: "Ελληνικά", short: "EL" },
  { code: "tr", name: "Turkish", native: "Türkçe", short: "TR" },
  { code: "uk", name: "Ukrainian", native: "Українська", short: "UK" },
  { code: "be", name: "Belarusian", native: "Беларуская", short: "BE" },
  { code: "sr", name: "Serbian", native: "Српски", short: "SR" },
  { code: "hr", name: "Croatian", native: "Hrvatski", short: "HR" },
  { code: "bs", name: "Bosnian", native: "Bosanski", short: "BS" },
  { code: "sl", name: "Slovenian", native: "Slovenščina", short: "SL" },
  { code: "sq", name: "Albanian", native: "Shqip", short: "SQ" },
  { code: "mk", name: "Macedonian", native: "Македонски", short: "MK" },
  { code: "et", name: "Estonian", native: "Eesti", short: "ET" },
  { code: "lv", name: "Latvian", native: "Latviešu", short: "LV" },
  { code: "lt", name: "Lithuanian", native: "Lietuvių", short: "LT" },
  { code: "ga", name: "Irish", native: "Gaeilge", short: "GA" },
  { code: "cy", name: "Welsh", native: "Cymraeg", short: "CY" },
  { code: "mt", name: "Maltese", native: "Malti", short: "MT" },
  { code: "eu", name: "Basque", native: "Euskara", short: "EU" },
  { code: "ca", name: "Catalan", native: "Català", short: "CA" },
  { code: "gl", name: "Galician", native: "Galego", short: "GL" },
  { code: "jv", name: "Javanese", native: "Basa Jawa", short: "JV" },
  { code: "su", name: "Sundanese", native: "Basa Sunda", short: "SU" },

  // ==========================================
  // ASIAN LANGUAGES
  // ==========================================

  { code: "zh-TW", name: "Chinese (Traditional)", native: "繁體中文", short: "ZT" },
  { code: "th", name: "Thai", native: "ไทย", short: "TH" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", short: "VI" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", short: "ID" },
  { code: "ms", name: "Malay", native: "Bahasa Melayu", short: "MS" },
  { code: "tl", name: "Filipino", native: "Filipino", short: "TL" },
  { code: "my", name: "Burmese", native: "မြန်မာဘာသာ", short: "MY" },
  { code: "km", name: "Khmer", native: "ភាសាខ្មែរ", short: "KM" },
  { code: "lo", name: "Lao", native: "ລາວ", short: "LO" },
  { code: "mn", name: "Mongolian", native: "Монгол", short: "MN" },
  { code: "kk", name: "Kazakh", native: "Қазақша", short: "KK" },
  { code: "uz", name: "Uzbek", native: "Oʻzbekcha", short: "UZ" },
  { code: "ky", name: "Kyrgyz", native: "Кыргызча", short: "KY" },
  { code: "tg", name: "Tajik", native: "Тоҷикӣ", short: "TG" },
  { code: "az", name: "Azerbaijani", native: "Azərbaycanca", short: "AZ" },
  { code: "ka", name: "Georgian", native: "ქართული", short: "KA" },
  { code: "hy", name: "Armenian", native: "Հայերեն", short: "HY" },
  { code: "fa", name: "Persian", native: "فارسی", short: "FA" },
  { code: "he", name: "Hebrew", native: "עברית", short: "HE" },
  { code: "ps", name: "Pashto", native: "پښتو", short: "PS" },
  { code: "ku", name: "Kurdish", native: "Kurdî", short: "KU" },

  // ==========================================
  // AFRICAN LANGUAGES
  // ==========================================

  { code: "sw", name: "Swahili", native: "Kiswahili", short: "SW" },
  { code: "af", name: "Afrikaans", native: "Afrikaans", short: "AF" },
  { code: "am", name: "Amharic", native: "አማርኛ", short: "AM" },
  { code: "ha", name: "Hausa", native: "Hausa", short: "HA" },
  { code: "yo", name: "Yoruba", native: "Yorùbá", short: "YO" },
  { code: "ig", name: "Igbo", native: "Igbo", short: "IG" },
  { code: "zu", name: "Zulu", native: "isiZulu", short: "ZU" },
  { code: "xh", name: "Xhosa", native: "isiXhosa", short: "XH" },
  { code: "so", name: "Somali", native: "Soomaali", short: "SO" },
  { code: "mg", name: "Malagasy", native: "Malagasy", short: "MG" },
  { code: "ny", name: "Chichewa", native: "Chichewa", short: "NY" },
  { code: "st", name: "Sesotho", native: "Sesotho", short: "ST" },

  // ==========================================
  // OTHER WORLD LANGUAGES
  // ==========================================

  { code: "ht", name: "Haitian Creole", native: "Kreyòl Ayisyen", short: "HT" },
  { code: "eo", name: "Esperanto", native: "Esperanto", short: "EO" },
  { code: "la", name: "Latin", native: "Latina", short: "LA" },
  { code: "mi", name: "Maori", native: "Te Reo Māori", short: "MI" },
  { code: "sm", name: "Samoan", native: "Gagana Samoa", short: "SM" },
  { code: "haw", name: "Hawaiian", native: "ʻŌlelo Hawaiʻi", short: "HAW" },
  { code: "lb", name: "Luxembourgish", native: "Lëtzebuergesch", short: "LB" }
];

// ==========================================
// DEFAULT LANGUAGE
// ==========================================

export const DEFAULT_LANGUAGE = "en";

// ==========================================
// SUPPORTED LANGUAGE CODES
// ==========================================

export const SUPPORTED_LANGUAGES = LANGUAGES.map(
  (language) => language.code
);

// ==========================================
// NORMALIZE LANGUAGE
// ==========================================

export function normalizeLanguage(code) {
  const value = String(code || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();

  const match = LANGUAGES.find(
    (language) => language.code.toLowerCase() === value
  );

  if (match) return match.code;

  const base = value.split("-")[0];

  const fallback = LANGUAGES.find(
    (language) => language.code.toLowerCase() === base
  );

  return fallback ? fallback.code : DEFAULT_LANGUAGE;
}

// ==========================================
// GET LANGUAGE OBJECT
// ==========================================

export function getLanguage(code) {
  const normalized = normalizeLanguage(code);

  return LANGUAGES.find(
    (language) => language.code === normalized
  );
}
