
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LANGUAGES,
  getLanguage,
  normalizeLanguage
} from "./languages";

import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = getLanguage(i18n.language);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function changeLanguage(code) {
    const language = normalizeLanguage(code);

    i18n.changeLanguage(language);
    setOpen(false);
  }

  return (
    <div
      className="carbon-language"
      ref={containerRef}
      data-no-translate
    >
      <button
        type="button"
        className="carbon-language-button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Choose language"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="language-globe">🌐</span>

        <span>{selected.short}</span>

        <span className="language-arrow">
          {open ? "⌃" : "⌄"}
        </span>
      </button>

      {open && (
        <div className="carbon-language-dropdown">
          <div className="language-dropdown-heading">
            SELECT LANGUAGE
          </div>

          {LANGUAGES.map((language) => {
            const active = selected.code === language.code;

            return (
              <button
                type="button"
                key={language.code}
                className={
                  `language-option ${active ? "selected" : ""}`
                }
                onClick={() => changeLanguage(language.code)}
                aria-pressed={active}
              >
                <span className="language-radio">
                  {active ? "◉" : "○"}
                </span>

                <span>{language.native}</span>

                <small>{language.short}</small>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
