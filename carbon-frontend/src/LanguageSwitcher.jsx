
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe2, Search, ChevronDown, Check, X } from "lucide-react";
import {
  LANGUAGES,
  getLanguage,
  normalizeLanguage
} from "./languages";

import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const selected = getLanguage(i18n.language);

  const filteredLanguages = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    if (!query) return LANGUAGES;

    return LANGUAGES.filter((language) =>
      [
        language.name,
        language.native,
        language.short,
        language.code
      ].some((value) =>
        String(value || "")
          .toLocaleLowerCase()
          .includes(query)
      )
    );
  }, [search]);

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

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    } else {
      setSearch("");
    }
  }, [open]);

  function changeLanguage(code) {
    const language = normalizeLanguage(code);

    i18n.changeLanguage(language);
    setOpen(false);
    setSearch("");
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
        <Globe2 size={18} strokeWidth={1.9} />

        <span>{selected.short}</span>

        <ChevronDown
          size={16}
          className={`language-chevron ${open ? "open" : ""}`}
        />
      </button>

      {open && (
        <div className="carbon-language-dropdown">
          <div className="language-dropdown-heading">
            <span>SELECT LANGUAGE</span>
            <span className="language-count">
              {LANGUAGES.length} languages
            </span>
          </div>

          <div className="language-search-box">
            <Search size={17} />

            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search languages..."
              aria-label="Search languages"
            />

            {search && (
              <button
                type="button"
                className="language-search-clear"
                onClick={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="language-results-label">
            {search
              ? `${filteredLanguages.length} results`
              : "AVAILABLE LANGUAGES"}
          </div>

          <div className="language-options-list">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((language) => {
                const active = selected.code === language.code;

                return (
                  <button
                    type="button"
                    key={language.code}
                    className={`language-option ${
                      active ? "selected" : ""
                    }`}
                    onClick={() => changeLanguage(language.code)}
                    aria-pressed={active}
                  >
                    <span className="language-option-name">
                      <span className="language-native">
                        {language.native || language.name || language.code}
                      </span>

                      {language.name &&
                        language.name !== language.native && (
                          <span className="language-english">
                            {language.name}
                          </span>
                        )}
                    </span>

                    {active ? (
                      <Check
                        size={17}
                        className="language-selected-check"
                      />
                    ) : (
                      <small>{language.short}</small>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="language-empty">
                <Search size={23} />
                <strong>No languages found</strong>
                <span>Try another language name.</span>
              </div>
            )}
          </div>

          <div className="language-dropdown-footer">
            <Globe2 size={14} />
            <span>Choose your preferred language</span>
          </div>
        </div>
      )}
    </div>
  );
}
