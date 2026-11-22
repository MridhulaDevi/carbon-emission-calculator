
export const LANGUAGES = [
  // Existing languages
  { code: "en", name: "English", native: "English", short: "EN" },
  { code: "ta", name: "Tamil", native: "தமிழ்", short: "TA" },
  { code: "hi", name: "Hindi", native: "हिन्दी", short: "HI" },
  { code: "te", name: "Telugu", native: "తెలుగు", short: "TE" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", short: "ML" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", short: "KN" },

  // Foreign languages
  { code: "fr", name: "French", native: "Français", short: "FR" },
  { code: "es", name: "Spanish", native: "Español", short: "ES" },
  { code: "de", name: "German", native: "Deutsch", short: "DE" },
  { code: "it", name: "Italian", native: "Italiano", short: "IT" },
  { code: "pt", name: "Portuguese", native: "Português", short: "PT" },
  { code: "ja", name: "Japanese", native: "日本語", short: "JA" },
  { code: "ko", name: "Korean", native: "한국어", short: "KO" },
  { code: "zh-CN", name: "Chinese", native: "简体中文", short: "ZH" },
  { code: "ar", name: "Arabic", native: "العربية", short: "AR" },
  { code: "ru", name: "Russian", native: "Русский", short: "RU" }
];

export const DEFAULT_LANGUAGE = "en";

export const SUPPORTED_LANGUAGES = LANGUAGES.map(
  (language) => language.code
);

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

export function getLanguage(code) {
  const normalized = normalizeLanguage(code);

  return LANGUAGES.find(
    (language) => language.code === normalized
  );
}
