const postcss = require('postcss');
const plugin = require('../index.js');

/**
 * Process CSS with the plugin and return the result
 * @param {string} css - CSS input string
 * @param {Object} options - Plugin options
 * @returns {Promise<Object>} PostCSS result object
 */
const processCSS = (css, options = {}) => {
  return postcss([plugin(options)]).process(css, { from: undefined });
};

/**
 * Get CSS output string from the plugin
 * @param {string} css - CSS input string
 * @param {Object} options - Plugin options
 * @returns {Promise<string>} CSS output string
 */
const getCSS = async (css, options = {}) => {
  const result = await processCSS(css, options);
  return result.css;
};

/**
 * Generate test CSS with duplicate properties
 * @param {string} selector - CSS selector
 * @param {Array<Array<string>>} properties - Array of [property, value] pairs
 * @returns {string} Generated CSS string
 */
const generateTestCSS = (selector, properties) => {
  const cssRules = properties.map(([prop, value]) => `  ${prop}: ${value};`).join('\n');
  return `${selector} {\n${cssRules}\n}`;
};

/**
 * Generate large CSS for performance testing
 * @param {number} ruleCount - Number of rules to generate
 * @param {number} propCount - Number of properties per rule
 * @returns {string} Generated CSS string
 */
const generateLargeCSS = (ruleCount = 100, propCount = 5) => {
  const rules = [];
  
  for (let i = 0; i < ruleCount; i++) {
    const properties = [];
    for (let j = 0; j < propCount; j++) {
      // Add duplicate properties for testing
      properties.push(`prop${j}: value${i}-${j};`);
      properties.push(`prop${j}: duplicate${i}-${j};`);
    }
    rules.push(`.rule-${i} {\n  ${properties.join('\n  ')}\n}`);
  }
  
  return rules.join('\n\n');
};

/**
 * Measure execution time of a function
 * @param {Function} fn - Function to measure
 * @returns {Promise<number>} Execution time in milliseconds
 */
const measureTime = async (fn) => {
  const startTime = Date.now();
  await fn();
  const endTime = Date.now();
  return endTime - startTime;
};

/**
 * Create CSS with specific patterns for testing
 * @param {Object} patterns - Test patterns
 * @returns {string} Generated CSS
 */
const createTestPatterns = (patterns) => {
  const cssParts = [];
  
  if (patterns.duplicates) {
    cssParts.push(`
      .duplicates {
        color: red;
        color: blue;
        margin: 10px;
        margin: 20px;
      }
    `);
  }
  
  if (patterns.important) {
    cssParts.push(`
      .important {
        color: red !important;
        color: blue;
        background: white !important;
        background: black;
      }
    `);
  }
  
  if (patterns.vendorPrefixes) {
    cssParts.push(`
      .vendor-prefixes {
        -webkit-transform: rotate(45deg);
        transform: rotate(45deg);
        -moz-transform: rotate(45deg);
      }
    `);
  }
  
  if (patterns.emptyRules) {
    cssParts.push(`
      .empty-rule {
      }
      .comment-only {
        /* Comment */
      }
    `);
  }
  
  return cssParts.join('\n');
};

module.exports = {
  processCSS,
  getCSS,
  generateTestCSS,
  generateLargeCSS,
  measureTime,
  createTestPatterns
};
