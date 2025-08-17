import postcss from 'https://esm.sh/postcss';
import removeDuplicateValues from 'https://esm.sh/postcss-remove-duplicate-values';

/**
 * @param {string} selector
 * @returns {RegExp | string}
 */
function resolveRegex(selector) {
  if (typeof selector !== 'string') return selector;
  if (!selector.startsWith('/')) return selector;

  const lastSlash = selector.lastIndexOf('/');
  if (lastSlash <= 0) return selector;

  const pattern = selector.slice(1, lastSlash);
  const flags = selector.slice(lastSlash + 1);

  try {
    return new RegExp(pattern, flags);
  } catch {
    return selector;
  }
}

async function runPostCSS(css, options = {}) {
  options.selector = resolveRegex(options.selector);
  const postcssSetup = postcss([removeDuplicateValues(options)]);
  return await postcssSetup.process(css);
}

window.runPostCSS = runPostCSS;
