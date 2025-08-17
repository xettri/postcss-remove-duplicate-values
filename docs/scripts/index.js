// Configuration
const CONFIG = {
  ANIMATION_DURATION: 4000,
  SNACKBAR_POSITION: 'bottom-left',
  TAB_INDENT: '  ',
  SELECTOR_REGEX: /([^{]+)\{([^}]*)\}/g,
  DECLARATION_SEPARATOR: ';',
};

// DOM Elements Cache
const DOM = {
  inputCSS: null,
  outputCSS: null,
  selectorInput: null,
  preserveEmptyToggle: null,
  stats: {
    inputRules: null,
    outputRules: null,
    duplicatesRemoved: null,
    emptyRulesRemoved: null,
    rulesSkipped: null,
  },
};

// Test examples with better organization
const EXAMPLES = {
  basic: {
    name: 'Basic Duplicates',
    description: 'Simple duplicate property removal',
    css: `.button {
  color: red;
  color: blue;
  margin: 10px;
  margin: 20px;
  padding: 5px;
}`,
  },
  important: {
    name: '!important Handling',
    description: 'Handle important declarations',
    css: `.button {
  color: red !important;
  color: blue;
  font-weight: normal;
  font-weight: bold !important;
  margin: 10px;
  margin: 20px !important;
}`,
  },
  vendor: {
    name: 'Vendor Prefixes',
    description: 'Browser compatibility handling',
    css: `.button {
  -webkit-transform: translateX(10px);
  -moz-transform: translateX(10px);
  transform: translateX(10px);
  -webkit-border-radius: 5px;
  border-radius: 5px;
}`,
  },
  colors: {
    name: 'Color Variations',
    description: 'Different color formats',
    css: `.button {
  color: #fff;
  color: #ffffff;
  background: rgb(255, 255, 255);
  background: white;
  border: 1px solid #000;
  border: 1px solid black;
}`,
  },
  selector: {
    name: 'Selector Filtering',
    description: 'Target specific selectors',
    css: `.button {
  color: red;
  color: blue;
  margin: 10px;
  margin: 20px;
  padding: 5px;
}

.demo {
  color: red;
  color: blue;
}`,
  },
  complex: {
    name: 'Complex Selectors',
    description: 'Advanced CSS patterns',
    css: `[data-button="primary"] {
  color: red;
  color: blue;
}

.button.primary:hover {
  background: white;
  background: #fff;
}

#main .container > .row .col {
  margin: 10px;
  margin: 20px;
}`,
  },
  empty: {
    name: 'Empty Rules',
    description: 'Handle empty CSS rules',
    css: `.button {
  color: red;
  color: blue;
}

.empty-rule {
}

.another-empty {
}`,
  },
};

/**
 * Load a CSS example into the input editor
 * @param {string} type - Example type key
 */
function loadExample(type, initLoad = false) {
  const example = EXAMPLES[type];
  if (!example) {
    showSnackbar(`Example "${type}" not found`, 'error');
    return;
  }

  if (!DOM.inputCSS) {
    console.error('Input editor not initialized');
    return;
  }

  // Load example CSS
  DOM.inputCSS.value = example.css;

  // Clear previous output and reset stats
  clearOutput();
  resetStats();
  // no need to show loaded example in case of
  // first time load with page load
  if (initLoad) return;
  showSnackbar(`Loaded: ${example.name}`, 'success');
}

/**
 * Process CSS using the PostCSS simulation
 */
async function processCSS() {
  if (!DOM.inputCSS || !DOM.outputCSS) {
    showSnackbar('Editors not initialized', 'error');
    return;
  }

  const inputText = DOM.inputCSS.value.trim();
  if (!inputText) {
    showSnackbar('Please enter some CSS to process', 'error');
    return;
  }

  try {
    const options = {
      selector: DOM.selectorInput?.value.trim() || '',
      preserveEmpty: DOM.preserveEmptyToggle?.checked || false,
    };

    const result = await window.runPostCSS(inputText, options);
    updateOutput(result);
    updateStats(result);

    showSnackbar('CSS processed successfully!', 'success');
  } catch (error) {
    console.error('Processing error:', error);
    showSnackbar(`Error processing CSS: ${error.message}`, 'error');
  }
}

/**
 * Process CSS declarations to remove duplicates
 * @param {string} declarations - Raw declarations string
 * @returns {string} Processed declarations
 */
function processDeclarations(declarations) {
  const declarationMap = new Map();
  const decls = declarations
    .split(CONFIG.DECLARATION_SEPARATOR)
    .map(d => d.trim())
    .filter(d => d);

  // Process declarations in reverse order (last wins)
  for (let i = decls.length - 1; i >= 0; i--) {
    const decl = decls[i];
    const [property, ...valueParts] = decl.split(':');

    if (!property || !valueParts.length) continue;

    const propertyName = property.trim();
    const value = valueParts.join(':').trim();

    // Skip if already processed (last declaration wins)
    if (declarationMap.has(propertyName)) continue;

    declarationMap.set(propertyName, `${propertyName}: ${value}`);
  }

  // Convert back to string, maintaining order
  return Array.from(declarationMap.values()).join(';\n  ');
}

/**
 * Check if selector matches filter pattern
 * @param {string} selectorText - CSS selector
 * @param {string} filter - Filter pattern
 * @returns {boolean} True if matches
 */
function matchSelector(selectorText, filter) {
  if (!filter) return true;

  // Simple pattern matching
  const patterns = filter.split(',').map(p => p.trim());
  return patterns.some(pattern => {
    if (pattern.startsWith('.')) {
      return selectorText.includes(pattern);
    } else if (pattern.startsWith('#')) {
      return selectorText.includes(pattern);
    } else {
      return selectorText.includes(pattern);
    }
  });
}

/**
 * Count declarations in a CSS string
 * @param {string} css - CSS string
 * @returns {number} Declaration count
 */
function countDeclarations(css) {
  return css.split(CONFIG.DECLARATION_SEPARATOR).filter(d => d.trim()).length;
}

/**
 * Clear output editor and reset statistics
 */
function clearOutput() {
  if (DOM.outputCSS) {
    DOM.outputCSS.value = '';
    hideCopyButton();
  }
}

/**
 * Clear all results (output and statistics)
 */
function clearResults() {
  clearOutput();
  resetStats();
}

/**
 * Reset all statistics to zero
 */
function resetStats() {
  Object.values(DOM.stats).forEach(element => {
    if (element) element.textContent = '0';
  });
  hideCopyButton();
}

/**
 * Update output with processed CSS
 * @param {Object} result - Processing result
 */
function updateOutput(result) {
  if (DOM.outputCSS) {
    DOM.outputCSS.value = result.css;
    showCopyButton();
  }
}

/**
 * Update statistics display
 * @param {Object} result - Processing result
 */
function updateStats(result) {
  const { rules, duplicates, emptyRulesRemoved, rulesSkipped } = result;

  if (DOM.stats.inputRules) DOM.stats.inputRules.textContent = rules;
  if (DOM.stats.outputRules) DOM.stats.outputRules.textContent = rules;
  if (DOM.stats.duplicatesRemoved)
    DOM.stats.duplicatesRemoved.textContent = duplicates;
  if (DOM.stats.emptyRulesRemoved)
    DOM.stats.emptyRulesRemoved.textContent = emptyRulesRemoved;
  if (DOM.stats.rulesSkipped) DOM.stats.rulesSkipped.textContent = rulesSkipped;
}

/**
 * Show action buttons when there's content to work with
 */
function showCopyButton() {
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');

  if (copyButton) {
    copyButton.style.opacity = '1';
    copyButton.style.pointerEvents = 'auto';
  }

  if (clearButton) {
    clearButton.style.opacity = '1';
    clearButton.style.pointerEvents = 'auto';
  }
}

/**
 * Hide action buttons when there's no content
 */
function hideCopyButton() {
  const copyButton = document.getElementById('copyButton');
  const clearButton = document.getElementById('clearButton');

  if (copyButton) {
    copyButton.style.opacity = '0';
    copyButton.style.pointerEvents = 'none';
  }

  if (clearButton) {
    clearButton.style.opacity = '0';
    clearButton.style.pointerEvents = 'none';
  }
}

/**
 * Copy results to clipboard
 */
async function copyResults() {
  if (!DOM.outputCSS) return;

  const outputText = DOM.outputCSS.value;
  if (!outputText.trim()) {
    showSnackbar('No results to copy', 'warning');
    return;
  }

  try {
    await navigator.clipboard.writeText(outputText);
    showSnackbar('Results copied to clipboard!', 'success');
  } catch (error) {
    // Fallback for older browsers
    fallbackCopy(outputText);
  }
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 */
function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    showSnackbar('Results copied to clipboard!', 'success');
  } catch (error) {
    showSnackbar('Failed to copy results', 'error');
  } finally {
    document.body.removeChild(textArea);
  }
}

/**
 * Show snackbar notification
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, warning, info)
 */
function showSnackbar(message, type = 'info') {
  const config = {
    text: message,
    duration: CONFIG.ANIMATION_DURATION,
    pos: CONFIG.SNACKBAR_POSITION,
    backgroundColor: getSnackbarColor(type),
    textColor: '#ffffff',
    width: 'auto',
    showAction: true,
    actionText: 'Dismiss',
    actionTextColor: getSnackbarActionColor(type),
    customClass: 'custom-snackbar',
  };

  Snackbar.show(config);
}

/**
 * Get snackbar background color based on type
 * @param {string} type - Message type
 * @returns {string} Hex color
 */
function getSnackbarColor(type) {
  const colors = {
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
    info: '#3b82f6',
  };
  return colors[type] || colors.info;
}

/**
 * Get snackbar action color based on type
 * @param {string} type - Message type
 * @returns {string} Hex color
 */
function getSnackbarActionColor(type) {
  const colors = {
    success: '#a7f3d0',
    error: '#fecaca',
    warning: '#fed7aa',
    info: '#bfdbfe',
  };
  return colors[type] || colors.info;
}

/**
 * Initialize DOM element cache
 */
function initializeDOM() {
  // Main editors
  DOM.inputCSS = document.getElementById('inputCSS');
  DOM.outputCSS = document.getElementById('outputCSS');

  // Form controls
  DOM.selectorInput = document.getElementById('selectorInput');
  DOM.preserveEmptyToggle = document.getElementById('preserveEmptyToggle');

  // Statistics elements
  DOM.stats.inputRules = document.getElementById('inputRules');
  DOM.stats.outputRules = document.getElementById('outputRules');
  DOM.stats.duplicatesRemoved = document.getElementById('duplicatesRemoved');
  DOM.stats.emptyRulesRemoved = document.getElementById('emptyRulesRemoved');
  DOM.stats.rulesSkipped = document.getElementById('rulesSkipped');

  // Validate critical elements
  if (!DOM.inputCSS || !DOM.outputCSS) {
    console.error('Critical DOM elements not found');
    return false;
  }

  return true;
}

/**
 * Initialize editor event listeners
 */
function initializeEditors() {
  if (!DOM.inputCSS) return;

  // Handle tab key for indentation
  DOM.inputCSS.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;

      // Insert indentation
      this.value =
        this.value.substring(0, start) +
        CONFIG.TAB_INDENT +
        this.value.substring(end);

      // Update cursor position
      this.selectionStart = this.selectionEnd =
        start + CONFIG.TAB_INDENT.length;
    }
  });
}

/**
 * Main initialization function
 */
function initialize() {
  if (!initializeDOM()) {
    console.error('Failed to initialize DOM');
    return;
  }

  initializeEditors();

  // Load initial example with delay to ensure DOM is ready
  setTimeout(() => {
    loadExample('basic', true);
  }, 100);
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', initialize);
