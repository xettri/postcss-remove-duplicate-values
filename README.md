# [postcss][git_url]-remove-duplicate-values

[![npm version](https://img.shields.io/npm/v/postcss-remove-duplicate-values.svg)][npm_url]
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[PostCSS Remove Duplicate Values] is a plugin for [PostCSS] that removes duplicate CSS property values within rules, optimizing stylesheet size and improving maintainability.

## Installation

You can install the plugin via npm, pnpm, or yarn:

```bash
npm install postcss-remove-duplicate-values --save-dev
pnpm add postcss-remove-duplicate-values -D
yarn add postcss-remove-duplicate-values -D
```

## What does it do?

This plugin identifies and removes duplicate CSS property values within rules, considering specificity and preserving `!important` declarations. When you have multiple declarations with the same property within a single rule, it retains only the last declaration, prioritizing `!important` values over non-`!important` values.

### Examples:

Here are some CSS examples showcasing the behavior of the plugin:

#### Example A: Without !important

```css
/* Input A */
.button {
  color: red;
  color: blue;
}

/* Output A */
.button {
  color: blue;
}
```

#### Example B: With !important

```css
/* Input B */
.button {
  color: red !important;
  color: yellow !important;
  color: blue;
}
.card {
  display: flex !important;
  display: block;
}

/* Output B */
.button {
  color: yellow !important;
}
.card {
  display: flex !important;
}
```

## Configuration

Integrating [PostCSS Remove Duplicate Values] into your [PostCSS] configuration is straightforward. Add it to your list of plugins:

```js
const postcss = require("postcss");
const removeDuplicateValues = require("postcss-remove-duplicate-values");

const css = `
.button {
  color: red;
  color: blue;
}`;

// Example 1: Using plugins array
postcss([
  removeDuplicateValues({
    // options here
  }),
])
  .process(css, { from: undefined })
  .then((result) => {
    console.log(result.css);
  });

// Example 2: Using use() method
postcss()
  .use(
    removeDuplicateValues({
      /* options */
    })
  )
  .process(css, { from: undefined })
  .then((result) => {
    console.log(result.css);
  });
```

If you are using `postcss.config.js`, you can include it as follows:

```js
module.exports = {
  plugins: [require("postcss-remove-duplicate-values")],
};
```

For more customization, you can pass options to the plugin:

```js
const removeDuplicateValues = require("postcss-remove-duplicate-values");
module.exports = {
  plugins: [
    removeDuplicateValues({
      // options here
    }),
  ],
};
```

## Options

Before applying the plugin, you can configure the following options:

| Option                            | Type                                                | Default     |
| --------------------------------- | --------------------------------------------------- | ----------- |
| [`selector`](#selector)           | `(selector: string) => boolean \| string \| RegExp` | `undefined` |
| [`preserveEmpty`](#preserveempty) | `boolean`                                           | `false`     |

#### selector

The selector option specifies the selector to consider while removing duplicate values. This option allows you to target specific selectors for duplicate value removal. Default its undefined i.e. apply to all rules. Selector can be defined as:

- **String**: A CSS selector string. Only rules matching this selector will have their duplicate values removed.
- **RegExp**: A regular expression. Rules with selectors matching this regular expression will have their duplicate values removed.
- **Function**: `(selector: string) => boolean` A function that takes a selector string as input and returns a boolean value indicating whether the selector should be considered for duplicate value removal.

**Example**:

```css
/* Input CSS */
.container {
  display: block;
  color: red;
  color: blue;
}

.button {
  display: flex;
  color: green;
}
```

If we set selector `.container`, only the properties within the .container selector will be considered for duplicate value removal. Similarly, you can use regular expressions or custom functions to match specific selectors for this operation.

```css
/* Output CSS */
.container {
  display: block;
  color: blue;
}

.button {
  display: flex;
  color: green;
}
```

### preserveEmpty

The `preserveEmpty` option determines whether empty selectors should be preserved or removed during the process of removing duplicate values. An empty selector is a selector without any properties.

**Example**:
Consider the following CSS:

```css
/* Input CSS */
.classA {
}

.classB {
  /* some comment */
}

.button {
  display: block;
}
```

If `preserveEmpty` is set to false, the empty selector `.somecss` will be removed during the process. If set to true, the empty selector will be preserved in the output.

```css
/* Output CSS */
.button {
  display: block;
}
```

[PostCSS Remove Duplicate Values]: https://github.com/xettri/postcss-remove-duplicate-values
[npm_url]: https://www.npmjs.com/package/postcss-remove-duplicate-values
[git_url]: https://github.com/xettri/postcss-remove-duplicate-values
[PostCSS]: https://github.com/postcss/postcss
