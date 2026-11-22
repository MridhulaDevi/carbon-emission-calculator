
import { useEffect } from "react";
import i18n from "./i18n";

import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  normalizeLanguage
} from "./languages";

const API_URL = "https://api.mymemory.translated.net/get";
const CACHE_KEY = "carbonDownTranslationCacheV2";

const MAX_CACHE_ENTRIES = 1500;
const MAX_CONCURRENT_REQUESTS = 2;

const originalNodes = new WeakMap();
const pendingRequests = new Map();

let cache = {};

try {
  cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
} catch {
  cache = {};
}

function saveCache() {
  try {
    cache = Object.fromEntries(
      Object.entries(cache).slice(-MAX_CACHE_ENTRIES)
    );

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(cache)
    );
  } catch {
    // Storage may be unavailable.
  }
}

function shouldTranslate(text) {
  const value = text.trim();

  if (value.length < 2) return false;
  if (!/[a-zA-Z]/.test(value)) return false;

  if (/^(CarbonDown|CO2|CO₂|kg|km|kWh)$/i.test(value)) {
    return false;
  }

  if (/^(https?:\/\/|www\.|[\w.+-]+@)/i.test(value)) {
    return false;
  }

  if (/^[\d\s.,:%₹$+\-()/]+$/.test(value)) {
    return false;
  }

  return new TextEncoder().encode(value).length <= 500;
}

function isExcluded(element) {
  return Boolean(
    element?.closest(
      [
        "script",
        "style",
        "noscript",
        "code",
        "pre",
        "textarea",
        "input",
        "select",
        "option",
        "svg",
        "[contenteditable]",
        "[data-no-translate]",
        ".notranslate"
      ].join(",")
    )
  );
}

function isExistingTranslation(text, language) {
  if (language === DEFAULT_LANGUAGE) return false;

  const resources = i18n.getResourceBundle(
    language,
    "translation"
  );

  if (!resources) return false;

  function containsValue(object) {
    if (!object || typeof object !== "object") {
      return false;
    }

    return Object.values(object).some((value) => {
      if (typeof value === "string") {
        return value.trim() === text.trim();
      }

      if (typeof value === "object") {
        return containsValue(value);
      }

      return false;
    });
  }

  return containsValue(resources);
}

async function translateText(text, language) {
  const key = JSON.stringify([language, text]);

  if (cache[key]) {
    return cache[key];
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = (async () => {
    const params = new URLSearchParams({
      q: text,
      langpair: `en|${language}`
    });

    const response = await fetch(
      `${API_URL}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (
      Number(data.responseStatus) !== 200 ||
      !data.responseData?.translatedText
    ) {
      throw new Error(
        data.responseDetails || "Translation unavailable"
      );
    }

    const translated = data.responseData.translatedText;

    cache[key] = translated;
    saveCache();

    return translated;
  })();

  pendingRequests.set(key, request);

  try {
    return await request;
  } finally {
    pendingRequests.delete(key);
  }
}

export default function AutoTranslator({ children }) {
  useEffect(() => {
    const root = document.getElementById("root");

    if (!root) return;

    let language = normalizeLanguage(i18n.language);
    let generation = 0;
    let stopped = false;
    let scheduled = false;
    let processing = false;
    let rerun = false;

    const trackedNodes = new Set();

    const observerOptions = {
      subtree: true,
      childList: true,
      characterData: true
    };

    function collectNodes() {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT
      );

      const nodes = [];
      let node;

      while ((node = walker.nextNode())) {
        if (!node.parentElement) continue;
        if (isExcluded(node.parentElement)) continue;

        const current = node.nodeValue || "";

        if (!originalNodes.has(node)) {
          originalNodes.set(node, {
            source: current,
            translated: null
          });
        }

        trackedNodes.add(node);
        nodes.push(node);
      }

      return nodes;
    }

    function restoreOriginals() {
      observer.disconnect();

      trackedNodes.forEach((node) => {
        if (!node.isConnected) {
          trackedNodes.delete(node);
          return;
        }

        const record = originalNodes.get(node);
        if (!record) return;

        if (
          record.translated !== null &&
          node.nodeValue === record.translated
        ) {
          node.nodeValue = record.source;
        }

        record.translated = null;
      });

      observer.observe(root, observerOptions);
    }

    async function processPage() {
      if (stopped) return;

      if (processing) {
        rerun = true;
        return;
      }

      processing = true;
      const currentGeneration = generation;

      try {
        const nodes = collectNodes();

        if (
          language === DEFAULT_LANGUAGE ||
          !SUPPORTED_LANGUAGES.includes(language)
        ) {
          restoreOriginals();
          return;
        }

        const groups = new Map();

        nodes.forEach((node) => {
          const record = originalNodes.get(node);
          if (!record) return;

          const current = node.nodeValue || "";

          if (
            record.translated !== null &&
            current !== record.translated
          ) {
            record.source = current;
            record.translated = null;
          }

          const source = record.source.trim();

          if (!shouldTranslate(source)) return;

          // Avoid retranslating strings supplied by i18next.
          if (isExistingTranslation(source, language)) {
            return;
          }

          if (!groups.has(source)) {
            groups.set(source, []);
          }

          groups.get(source).push(node);
        });

        const entries = [...groups.entries()];
        let cursor = 0;

        async function worker() {
          while (cursor < entries.length) {
            if (
              stopped ||
              currentGeneration !== generation
            ) {
              return;
            }

            const [source, targetNodes] = entries[cursor++];

            try {
              const translated = await translateText(
                source,
                language
              );

              if (
                stopped ||
                currentGeneration !== generation
              ) {
                return;
              }

              observer.disconnect();

              targetNodes.forEach((node) => {
                if (!node.isConnected) return;

                const record = originalNodes.get(node);
                if (!record) return;

                if (record.source.trim() !== source) {
                  return;
                }

                const leading =
                  record.source.match(/^\s*/)?.[0] || "";

                const trailing =
                  record.source.match(/\s*$/)?.[0] || "";

                const result =
                  leading + translated + trailing;

                if (node.nodeValue !== result) {
                  node.nodeValue = result;
                }

                record.translated = result;
              });

              observer.observe(root, observerOptions);
            } catch (error) {
              console.warn(
                "AutoTranslator:",
                error.message
              );
            }
          }
        }

        await Promise.all(
          Array.from(
            {
              length: Math.min(
                MAX_CONCURRENT_REQUESTS,
                entries.length
              )
            },
            () => worker()
          )
        );
      } finally {
        processing = false;

        if (rerun && !stopped) {
          rerun = false;
          schedule();
        }
      }
    }

    function schedule() {
      if (scheduled || stopped) return;

      scheduled = true;

      requestAnimationFrame(() => {
        scheduled = false;

        if (!stopped) {
          processPage();
        }
      });
    }

    const observer = new MutationObserver(() => {
      schedule();
    });

    function handleLanguageChange(nextLanguage) {
      language = normalizeLanguage(nextLanguage);
      generation++;

      restoreOriginals();
      schedule();
    }

    observer.observe(root, observerOptions);

    i18n.on(
      "languageChanged",
      handleLanguageChange
    );

    schedule();

    return () => {
      stopped = true;
      generation++;

      observer.disconnect();

      i18n.off(
        "languageChanged",
        handleLanguageChange
      );
    };
  }, []);

  return children;
}
