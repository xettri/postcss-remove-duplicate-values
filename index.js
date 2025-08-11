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
 * function to check is walkSelector is valid selector as per config passed
 * @param {Options['selector']} selector
 * @param {string} walkSelector
 * @returns {boolean}
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
 * function to check is value is valid fallback value
 * @param {string} value
 * @returns {boolean}
 */
const isValidFallbackValue = value => {
  return (
    value.indexOf('-webkit-') !== -1 ||
    value.indexOf('-moz-') !== -1 ||
    value.indexOf('-ms-') !== -1 ||
    value.indexOf('-o-') !== -1
  );
};

/**
 * function to check is node is empty or not
 * @param {import('postcss').Rule} rule
 * @returns {boolean}
 */
const isEmpty = rule => {
  return (
    rule.nodes.length === 0 ||
    rule.nodes.filter(v => v.type !== 'comment').length === 0
  );
};

/**
 * PostCSS plugin to remove duplicate values from CSS selectors.
 * @type {import('postcss').PluginCreator<Options>}
 * @param {Options} options
 * @return {import('postcss').Plugin}
 */
const plugin = (options = {}) => {
  const { selector, preserveEmpty = false } = options;
  return {
    postcssPlugin: PLUGIN_NAME,
    prepare({ root }) {
      root.walkRules(rule => {
        // if selector is passed and its fail to match with rule selector
        // then this plugin opration will not applied
        if (selector) {
          if (!matchSelector(selector, rule.selector)) {
            return;
          }
        }

        if (isEmpty(rule)) {
          // it will remove empty selector if preserveEmpty is not true
          if (preserveEmpty !== true) {
            rule.remove();
          }
        } else {
          /**
           * @type {RuleDeclarationsMap}
           */
          const ruleDeclarations = new Map();

          /**
           * @type {RuleDeclarationsMap}
           */
          const fallbackRuleDeclarations = new Map();

          rule.walkDecls(declaration => {
            const key = declaration.prop;
            const value = declaration.value.trim();
            const important = Boolean(declaration.important);
            const isValidFallback = isValidFallbackValue(value);

            let currentRemoved = false;
            if (isValidFallback) {
              const fallbackRuleObject = fallbackRuleDeclarations.get(
                `${key}:${value}`,
              );
              if (fallbackRuleObject) {
                if (fallbackRuleObject.important) {
                  if (important) {
                    fallbackRuleObject.remove();
                  } else {
                    declaration.remove();
                    currentRemoved = true;
                  }
                } else {
                  fallbackRuleObject.remove();
                }
              }
            } else if (ruleDeclarations.has(key)) {
              const data = ruleDeclarations.get(key);
              if (data.important) {
                // if current value is important then it will overwrite previous style
                if (important) {
                  data.remove();
                } else {
                  // if current value is not important older style will overwrite
                  declaration.remove();
                  currentRemoved = true;
                }
              } else {
                data.remove();
              }
            }

            // if current node is removed then no need to update map
            if (currentRemoved) return;

            if (isValidFallback) {
              const k = `${key}:${value}`;
              fallbackRuleDeclarations.set(k, {
                important,
                remove: () => {
                  declaration.remove();
                  // delete entry from map as well
                  fallbackRuleDeclarations.delete(k);
                },
              });
            } else {
              ruleDeclarations.set(key, {
                value,
                important,
                remove: () => {
                  declaration.remove();
                  // delete entry from map as well
                  ruleDeclarations.delete(key);
                },
              });
            }
          });

          ruleDeclarations.clear();
          fallbackRuleDeclarations.clear();
        }
      });
    },
  };
};

plugin.postcss = true;
module.exports = plugin;
