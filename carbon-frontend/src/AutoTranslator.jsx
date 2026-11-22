
import { useEffect } from "react";
import i18n from "./i18n";

const API_URL = "https://api.mymemory.translated.net/get";
const CACHE_KEY = "carbonDownTranslationCache";
const SUPPORTED = ["en", "ta", "hi", "te", "ml", "kn"];

const originals = new WeakMap();
const pendingRequests = new Map();

let cache = {};

try {
  cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
} catch {
  cache = {};
}

function saveCache() {
  try {
    const entries = Object.entries(cache).slice(-1500);
    cache = Object.fromEntries(entries);

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Browser storage may be unavailable or full.
  }
}

function canTranslate(text) {
  const value = text.trim();

  if (value.length < 2) return false;
  if (!/[a-zA-Z]/.test(value)) return false;

  if (/^(CarbonDown|CO2|CO₂|kg|km|kWh)$/i.test(value)) {
    return false;
  }

  if (/^(https?:\/\/|www\.|[\w.+-]+@)/i.test(value)) {
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

    const response = await fetch(`${API_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`Translation error: ${response.status}`);
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

    let language = i18n.language.split("-")[0];
    let generation = 0;
    let scheduled = false;
    let processing = false;
    let rerun = false;
    let stopped = false;

    const knownNodes = new Set();
    const observedOptions = {
      subtree: true,
      childList: true,
      characterData: true
    };

    function getNodes() {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT
      );

      const nodes = [];
      let node;

      while ((node = walker.nextNode())) {
        if (!node.parentElement) continue;
        if (isExcluded(node.parentElement)) continue;

        const value = node.nodeValue || "";

        if (!originals.has(node)) {
          originals.set(node, {
            source: value,
            translated: null
          });
        }

        knownNodes.add(node);
        nodes.push(node);
      }

      return nodes;
    }

    function restoreEnglish() {
      observer.disconnect();

      knownNodes.forEach((node) => {
        if (!node.isConnected) {
          knownNodes.delete(node);
          return;
        }

        const record = originals.get(node);
        if (!record) return;

        if (
          record.translated !== null &&
          node.nodeValue === record.translated
        ) {
          node.nodeValue = record.source;
        }

        record.translated = null;
      });

      observer.observe(root, observedOptions);
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
        const nodes = getNodes();

        if (language === "en" || !SUPPORTED.includes(language)) {
          restoreEnglish();
          return;
        }

        const groups = new Map();

        nodes.forEach((node) => {
          const record = originals.get(node);
          if (!record) return;

          const current = node.nodeValue || "";

          if (
            record.translated !== null &&
            current !== record.translated
          ) {
            // React has rendered new source text.
            record.source = current;
            record.translated = null;
          }

          const source = record.source.trim();

          if (!canTranslate(source)) return;

          if (!groups.has(source)) {
            groups.set(source, []);
          }

          groups.get(source).push(node);
        });

        const entries = [...groups.entries()];
        let cursor = 0;

        async function worker() {
          while (cursor < entries.length) {
            if (stopped || currentGeneration !== generation) {
              return;
            }

            const [source, targetNodes] = entries[cursor++];

            try {
              const translated = await translateText(
                source,
                language
              );

              if (stopped || currentGeneration !== generation) {
                return;
              }

              observer.disconnect();

              targetNodes.forEach((node) => {
                if (!node.isConnected) return;

                const record = originals.get(node);
                if (!record) return;

                if (record.source.trim() !== source) return;

                const leading =
                  record.source.match(/^\s*/)?.[0] || "";

                const trailing =
                  record.source.match(/\s*$/)?.[0] || "";

                const result = leading + translated + trailing;

                if (node.nodeValue !== result) {
                  node.nodeValue = result;
                }

                record.translated = result;
              });

              observer.observe(root, observedOptions);
            } catch (error) {
              console.warn(
                "AutoTranslator:",
                error.message
              );
            }
          }
        }

        // Two simultaneous requests maximum.
        await Promise.all(
          Array.from(
            { length: Math.min(2, entries.length) },
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

    function changeLanguage(nextLanguage) {
      language = nextLanguage.split("-")[0];
      generation++;

      restoreEnglish();
      schedule();
    }

    observer.observe(root, observedOptions);

    i18n.on("languageChanged", changeLanguage);

    schedule();

    return () => {
      stopped = true;
      generation++;

      observer.disconnect();
      i18n.off("languageChanged", changeLanguage);
    };
  }, []);

  return children;
}
