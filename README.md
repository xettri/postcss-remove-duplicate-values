# [postcss][git_url]-remove-duplicate-values

[![npm version](https://img.shields.io/npm/v/postcss-remove-duplicate-values.svg)][npm_url]
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **Smart PostCSS plugin that removes duplicate CSS properties, reduces bundle size, and improves CSS maintainability.**

## ✨ What It Does

Automatically removes duplicate CSS properties from your stylesheets while keeping the most important ones. Perfect for cleaning up CSS and improving performance.

### 🎯 Key Features
- **🧹 Removes duplicate properties** (keeps the last one)
- **⚡ Handles `!important` declarations** intelligently
- **🎨 Supports vendor prefixes** and modern CSS
- **🎯 Filters specific selectors** (optional)
- **🗑️ Cleans empty rules** (configurable)
- **🚀 Zero configuration** needed

## 🚀 Quick Start

### 1. Install
```bash
npm install postcss-remove-duplicate-values --save-dev
# or
pnpm add postcss-remove-duplicate-values -D
# or
yarn add postcss-remove-duplicate-values -D
```

### 2. Use in PostCSS
```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-remove-duplicate-values')
  ]
}
```

### 3. That's it! 🎉
The plugin automatically removes duplicates from your CSS.

## 📖 Examples

### Basic Duplicate Removal
```css
/* Before */
.button {
  color: red;
  color: blue;
  margin: 10px;
  margin: 20px;
}

/* After */
.button {
  color: blue;
  margin: 20px;
}
```

### `!important` Handling
```css
/* Before */
.button {
  color: red !important;
  color: blue;
  font-weight: normal;
  font-weight: bold !important;
}

/* After */
.button {
  color: red !important;
  font-weight: bold !important;
}
```

### Vendor Prefixes
```css
/* Before */
.button {
  transform: translateX(40px);
  -webkit-transform: translateX(10px);
  -moz-transform: translateX(10px);
  transform: translateX(10px);
}

/* After */
.button {
  /* Plugin removes duplicate 'transform' properties, keeping the last one */
  /* Vendor prefixes are preserved */
  -webkit-transform: translateX(10px);
  -moz-transform: translateX(10px);
  transform: translateX(10px);
}
```

## ⚙️ Configuration Options

Before applying the plugin, you can configure the following options:

| Option                            | Type                                                | Default     |
| --------------------------------- | --------------------------------------------------- | ----------- |
| [`selector`](#selector)           | `(selector: string) => boolean \| string \| RegExp` | `undefined` |
| [`preserveEmpty`](#preserveempty) | `boolean`                                           | `false`     |

### selector
Filter which CSS selectors to process.

```js
// Only process .button selectors
removeDuplicateValues({
  selector: '.button'
})

// Process selectors matching regex
removeDuplicateValues({
  selector: /^\.btn-/
})

// Custom function
removeDuplicateValues({
  selector: (selector) => selector.includes('button')
})
```

### preserveEmpty
Keep or remove empty CSS rules.

```js
// Remove empty rules (default)
removeDuplicateValues({
  preserveEmpty: false
})

// Keep empty rules
removeDuplicateValues({
  preserveEmpty: true
})
```

## 🔧 Advanced Usage

### With PostCSS API
```js
const postcss = require('postcss')
const removeDuplicateValues = require('postcss-remove-duplicate-values')

const css = `
.button {
  color: red;
  color: blue;
}`

postcss([removeDuplicateValues()])
  .process(css)
  .then(result => {
    console.log(result.css)
    // Output: .button { color: blue; }
  })
```

### With Build Tools
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('postcss-remove-duplicate-values')
              ]
            }
          }
        ]
      }
    ]
  }
}
```


## 📚 More Examples

### Selector Filtering
```css
/* Input CSS */
.container {
  color: red;
  color: blue;
}
.button {
  margin: 10px;
  margin: 20px;
}

/* With selector: '.container' */
.container {
  color: blue;
}
.button {
  margin: 10px;
  margin: 20px; /* Not processed */
}
```

### Empty Rule Handling
```css
/* Input CSS */
.empty-rule {
}
.button {
  color: blue;
}

/* With preserveEmpty: false */
.button {
  color: blue;
}
/* .empty-rule removed */

/* With preserveEmpty: true */
.empty-rule {
}
.button {
  color: blue;
}
```

## 🎮 Try It Live!

**Test the plugin in real-time with our interactive playground:**

[🎮 **Try the Playground** →](https://xettri.github.io/postcss-remove-duplicate-values)

### What You Can Do in the Playground:
- ✨ **Test CSS processing** in real-time
- 🎯 **Experiment with options** (selector filtering, empty rule preservation)
- 📚 **Try pre-built examples** for common scenarios
- 📊 **See live statistics** of duplicate removal results
- 🎨 **Understand plugin behavior** through interactive examples

<br>

**Made with ❤️ by [Bharat Rawat](https://bharatrawat.com)**

[PostCSS Remove Duplicate Values]: https://github.com/xettri/postcss-remove-duplicate-values
[npm_url]: https://www.npmjs.com/package/postcss-remove-duplicate-values
[git_url]: https://github.com/xettri/postcss-remove-duplicate-values
[PostCSS]: https://github.com/postcss/postcss
