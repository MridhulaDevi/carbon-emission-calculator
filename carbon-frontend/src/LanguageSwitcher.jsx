
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

const languages = [
  { code: "en", name: "English", short: "EN" },
  { code: "ta", name: "தமிழ்", short: "TA" },
  { code: "hi", name: "हिन्दी", short: "HI" },
  { code: "te", name: "తెలుగు", short: "TE" },
  { code: "ml", name: "മലയാളം", short: "ML" },
  { code: "kn", name: "ಕನ್ನಡ", short: "KN" }
];

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected =
    languages.find((lang) => lang.code === i18n.language) ||
    languages[0];

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="carbon-language" ref={containerRef}>
      <button
        type="button"
        className="carbon-language-button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={t("language")}
      >
        <span className="language-globe">🌐</span>
        <span>{selected.short}</span>
        <span className="language-arrow">⌄</span>
      </button>

      {open && (
        <div className="carbon-language-dropdown">
          <div className="language-dropdown-heading">
            {t("language")}
          </div>

          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              className={`language-option ${
                selected.code === language.code ? "selected" : ""
              }`}
              onClick={() => changeLanguage(language.code)}
            >
              <span className="language-radio">
                {selected.code === language.code ? "●" : "○"}
              </span>

              <span>{language.name}</span>

              <small>{language.short}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
