'use strict';

const PLUGIN_NAME = 'postcss-remove-duplicate-values';

/**
 * Options For The Plugin.
 * @typedef {Object} Options
 * @property {string | RegExp | ((selector: string) => boolean)} [selector]
 * @property {boolean} [preserveEmpty=false]
 */

/**
 * Rule Declarations Map Value
 * @typedef {Object} RuleDeclarationsMapValue
 * @property {string} [value]
 * @property {() => void} remove
 * @property {boolean} important
 */

/**
 * Rule Declarations Map
 * @typedef {Map<import('postcss').Declaration['prop'], RuleDeclarationsMapValue>} RuleDeclarationsMap
 */

/**
 * Determines if a CSS selector should be processed based on the provided selector filter.
 * This allows targeting specific selectors for duplicate value removal.
 *
 * @param {Options['selector']} selector - The selector filter (string, regex, or function)
 * @param {string} walkSelector - The CSS selector to check
 * @returns {boolean} - True if the selector should be processed
 */
const matchSelector = (selector, walkSelector) => {
  if (typeof selector === 'string') {
    if (walkSelector.indexOf(selector) !== -1) return true;
  } else if (selector instanceof RegExp) {
    if (selector.test(walkSelector)) return true;
  } else if (typeof selector === 'function') {
    if (selector(walkSelector)) return true;
  }
  return false;
};

/**
 * Identifies vendor-prefixed CSS properties that should be treated as fallbacks.
 * Vendor prefixes are preserved alongside standard properties to maintain browser compatibility.
 *
 * @param {string} property - The CSS property name to check
 * @returns {boolean} - True if the property is vendor-prefixed
 */
const isValidFallbackValue = property => {
  return (
    property.startsWith('-webkit-') ||
    property.startsWith('-moz-') ||
    property.startsWith('-ms-') ||
    property.startsWith('-o-')
  );
};

/**
 * Determines if a CSS rule is empty (contains no properties or only comments).
 * Empty rules can be optionally removed to clean up the stylesheet.
 *
 * @param {import('postcss').Rule} rule - The CSS rule to check
 * @returns {boolean} - True if the rule is empty
 */
const isEmpty = rule => {
  return (
    rule.nodes.length === 0 ||
    rule.nodes.filter(v => v.type !== 'comment').length === 0
  );
};

/**
 * PostCSS plugin that removes duplicate CSS property values within rules.
 *
 * @type {import('postcss').PluginCreator<Options>}
 * @param {Options} options - Plugin configuration options
 * @return {import('postcss').Plugin} - PostCSS plugin instance
 */
const plugin = (options = {}) => {
  const { selector, preserveEmpty = false } = options;

  return {
    postcssPlugin: PLUGIN_NAME,
    Once(root) {
      try {
        root.walkRules(rule => {
          try {
            // Apply selector filtering if specified - only process matching rules
            if (selector) {
              if (!matchSelector(selector, rule.selector)) {
                return;
              }
            }

            if (isEmpty(rule)) {
              // Remove empty rules unless explicitly preserved
              if (preserveEmpty !== true) {
                rule.remove();
              }
            } else {
              // Track regular properties and vendor-prefixed properties separately
              const ruleDeclarations = new Map();
              const fallbackRuleDeclarations = new Map();

              rule.walkDecls(declaration => {
                try {
                  // Validate declaration before processing
                  if (!declaration || !declaration.prop || !declaration.value) {
                    return; // Skip invalid declarations silently
                  }

                  const key = declaration.prop;
                  const value = declaration.value.trim();
                  const important = Boolean(declaration.important);
                  const isValidFallback = isValidFallbackValue(key);

                  let currentRemoved = false;

                  if (isValidFallback) {
                    // Handle vendor-prefixed properties as fallbacks
                    // These are preserved alongside standard properties for browser compatibility
                    const existingFallback = fallbackRuleDeclarations.get(key);
                    if (existingFallback) {
                      if (existingFallback.important) {
                        if (important) {
                          // Both are important - remove the old one (last wins)
                          existingFallback.declaration.remove();
                        } else {
                          // Current is not important - remove it
                          declaration.remove();
                          currentRemoved = true;
                        }
                      } else {
                        // Old one is not important - remove it
                        existingFallback.declaration.remove();
                      }
                    }
                  } else if (ruleDeclarations.has(key)) {
                    // Handle duplicate standard properties
                    const data = ruleDeclarations.get(key);
                    if (data.important) {
                      if (important) {
                        // Both are important - remove the old one (last wins)
                        data.declaration.remove();
                      } else {
                        // Current is not important - remove it (important wins)
                        declaration.remove();
                        currentRemoved = true;
                      }
                    } else {
                      // Remove the old declaration (last wins)
                      data.declaration.remove();
                    }
                  }

                  // Skip map updates if current declaration was removed
                  if (currentRemoved) return;

                  // Store the current declaration for future duplicate detection
                  if (isValidFallback) {
                    fallbackRuleDeclarations.set(key, {
                      important,
                      declaration,
                    });
                  } else {
                    ruleDeclarations.set(key, {
                      value,
                      important,
                      declaration,
                    });
                  }
                } catch (declarationError) {
                  // Continue processing other declarations silently
                  // In production, we don't want to spam logs
                }
              });

              // Clean up maps to prevent memory leaks
              ruleDeclarations.clear();
              fallbackRuleDeclarations.clear();
            }
          } catch (ruleError) {
            // Continue processing other rules silently
            // In production, we don't want to spam logs
          }
        });
      } catch (rootError) {
        // Only log critical errors that prevent the plugin from working
        console.error(`[${PLUGIN_NAME}] Critical error:`, rootError);
        throw rootError; // Re-throw critical errors
      }
    },
  };
};

plugin.postcss = true;
module.exports = plugin;
