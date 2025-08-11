const postcss = require('postcss');
const plugin = require('../index.js');

// Helper function to process CSS with the plugin
const processCSS = (css, options = {}) => {
  return postcss([plugin(options)]).process(css, { from: undefined });
};

// Helper function to get CSS output
const getCSS = async (css, options = {}) => {
  const result = await processCSS(css, options);
  return result.css;
};

describe('postcss-remove-duplicate-values', () => {
  describe('Basic functionality', () => {
    test('should remove duplicate properties without !important', async () => {
      const input = `
        .button {
          color: red;
          color: blue;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('color: blue');
      expect(output).not.toContain('color: red');
      expect(output).toMatch(/\.button\s*\{\s*color:\s*blue;\s*\}/);
    });

    test('should remove duplicate properties with different values', async () => {
      const input = `
        .card {
          display: block;
          display: flex;
          margin: 10px;
          margin: 20px;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('display: flex');
      expect(output).toContain('margin: 20px');
      expect(output).not.toContain('display: block');
      expect(output).not.toContain('margin: 10px');
    });

    test('should preserve non-duplicate properties', async () => {
      const input = `
        .element {
          color: blue;
          background: red;
          font-size: 16px;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('color: blue');
      expect(output).toContain('background: red');
      expect(output).toContain('font-size: 16px');
    });
  });

  describe('!important handling', () => {
    test('should preserve !important declarations over non-important ones', async () => {
      const input = `
        .button {
          color: red !important;
          color: blue;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('color: red !important');
      expect(output).not.toContain('color: blue');
    });

    test('should keep the last !important declaration when multiple exist', async () => {
      const input = `
        .button {
          color: red !important;
          color: yellow !important;
          color: blue !important;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('color: blue !important');
      expect(output).not.toContain('color: red !important');
      expect(output).not.toContain('color: yellow !important');
    });

    test('should handle mixed important and non-important declarations', async () => {
      const input = `
        .card {
          display: block;
          display: flex !important;
          margin: 10px !important;
          margin: 20px;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('display: flex !important');
      expect(output).toContain('margin: 10px !important');
      expect(output).not.toContain('display: block');
      expect(output).not.toContain('margin: 20px');
    });
  });

  describe('Vendor prefix handling', () => {
    test('should handle -webkit- prefixed values', async () => {
      const input = `
        .element {
          transform: rotate(45deg);
          -webkit-transform: rotate(45deg);
        }
      `;
      
      const output = await getCSS(input);
      
      // Should keep the vendor prefix as it's treated as a fallback
      expect(output).toContain('-webkit-transform: rotate(45deg)');
      expect(output).toContain('transform: rotate(45deg)');
    });

    test('should handle -moz- prefixed values', async () => {
      const input = `
        .element {
          -moz-transform: rotate(45deg);
          transform: rotate(45deg);
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('-moz-transform: rotate(45deg)');
      expect(output).toContain('transform: rotate(45deg)');
    });

    test('should handle -ms- prefixed values', async () => {
      const input = `
        .element {
          -ms-transform: rotate(45deg);
          transform: rotate(45deg);
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('-ms-transform: rotate(45deg)');
      expect(output).toContain('transform: rotate(45deg)');
    });

    test('should handle -o- prefixed values', async () => {
      const input = `
        .element {
          -o-transform: rotate(45deg);
          transform: rotate(45deg);
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('-o-transform: rotate(45deg)');
      expect(output).toContain('transform: rotate(45deg)');
    });

    test('should handle vendor prefixes with !important', async () => {
      const input = `
        .element {
          -webkit-transform: rotate(45deg) !important;
          transform: rotate(45deg);
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('-webkit-transform: rotate(45deg) !important');
      expect(output).toContain('transform: rotate(45deg)');
    });
  });

  describe('Selector filtering', () => {
    test('should process only specified string selector', async () => {
      const input = `
        .container {
          color: red;
          color: blue;
        }
        .button {
          color: green;
          color: yellow;
        }
      `;
      
      const output = await getCSS(input, { selector: '.container' });
      
      expect(output).toContain('color: blue');
      expect(output).not.toContain('color: red');
      expect(output).toContain('color: green');
      expect(output).toContain('color: yellow');
    });

    test('should process only regex matching selectors', async () => {
      const input = `
        .btn-primary {
          color: red;
          color: blue;
        }
        .btn-secondary {
          color: green;
          color: yellow;
        }
        .card {
          margin: 10px;
        }
      `;
      
      const output = await getCSS(input, { selector: /\.btn-/ });
      
      expect(output).toContain('color: blue');
      expect(output).toContain('color: yellow');
      expect(output).not.toContain('color: red');
      expect(output).not.toContain('color: green');
      expect(output).toContain('margin: 10px');
    });

    test('should process only function matching selectors', async () => {
      const input = `
        .button {
          color: red;
          color: blue;
        }
        .card {
          margin: 10px;
          margin: 20px;
        }
      `;
      
      const output = await getCSS(input, { 
        selector: (selector) => selector.includes('button') 
      });
      
      expect(output).toContain('color: blue');
      expect(output).not.toContain('color: red');
      expect(output).toContain('margin: 10px');
      expect(output).toContain('margin: 20px');
    });

    test('should process all selectors when no selector option is provided', async () => {
      const input = `
        .button {
          color: red;
          color: blue;
        }
        .card {
          margin: 10px;
          margin: 20px;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('color: blue');
      expect(output).toContain('margin: 20px');
      expect(output).not.toContain('color: red');
      expect(output).not.toContain('margin: 10px');
    });
  });

  describe('Empty rule handling', () => {
    test('should remove empty rules by default', async () => {
      const input = `
        .empty-rule {
        }
        .non-empty-rule {
          color: blue;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).not.toContain('.empty-rule');
      expect(output).toContain('.non-empty-rule');
      expect(output).toContain('color: blue');
    });

    test('should preserve empty rules when preserveEmpty is true', async () => {
      const input = `
        .empty-rule {
        }
        .non-empty-rule {
          color: blue;
        }
      `;
      
      const output = await getCSS(input, { preserveEmpty: true });
      
      expect(output).toContain('.empty-rule');
      expect(output).toContain('.non-empty-rule');
      expect(output).toContain('color: blue');
    });

    test('should handle rules with only comments as empty', async () => {
      const input = `
        .comment-only {
          /* This is a comment */
        }
        .with-property {
          color: blue;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).not.toContain('.comment-only');
      expect(output).toContain('.with-property');
      expect(output).toContain('color: blue');
    });

    test('should preserve rules with only comments when preserveEmpty is true', async () => {
      const input = `
        .comment-only {
          /* This is a comment */
        }
        .with-property {
          color: blue;
        }
      `;
      
      const output = await getCSS(input, { preserveEmpty: true });
      
      expect(output).toContain('.comment-only');
      expect(output).toContain('.with-property');
      expect(output).toContain('color: blue');
    });
  });

  describe('Edge cases and complex scenarios', () => {
    test('should handle multiple duplicate properties in sequence', async () => {
      const input = `
        .element {
          color: red;
          color: blue;
          color: green;
          color: yellow;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('color: yellow');
      expect(output).not.toContain('color: red');
      expect(output).not.toContain('color: blue');
      expect(output).not.toContain('color: green');
    });

    test('should handle properties with complex values', async () => {
      const input = `
        .element {
          background: linear-gradient(to right, #ff0000, #00ff00);
          background: radial-gradient(circle, #0000ff, #ffff00);
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('background: radial-gradient(circle, #0000ff, #ffff00)');
      expect(output).not.toContain('background: linear-gradient(to right, #ff0000, #00ff00)');
    });

    test('should handle properties with spaces and special characters', async () => {
      const input = `
        .element {
          content: "Hello World";
          content: "Goodbye World";
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('content: "Goodbye World"');
      expect(output).not.toContain('content: "Hello World"');
    });

    test('should handle CSS custom properties', async () => {
      const input = `
        .element {
          --color: red;
          --color: blue;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('--color: blue');
      expect(output).not.toContain('--color: red');
    });
  });

  describe('Integration and real-world scenarios', () => {
    test('should handle complex CSS with multiple rules', async () => {
      const input = `
        .header {
          background: #fff;
          background: #f0f0f0;
          color: #333;
        }
        
        .nav {
          display: block;
          display: flex;
        }
        
        .content {
          margin: 0;
          padding: 20px;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('background: #f0f0f0');
      expect(output).toContain('color: #333');
      expect(output).toContain('display: flex');
      expect(output).toContain('margin: 0');
      expect(output).toContain('padding: 20px');
      
      expect(output).not.toContain('background: #fff');
      expect(output).not.toContain('display: block');
    });

    test('should work with PostCSS plugins chain', async () => {
      const input = `
        .button {
          color: red;
          color: blue;
          background: white;
        }
      `;
      
      // Simulate plugin chain
      const result = await postcss([
        plugin(),
        // Add another plugin here if needed
      ]).process(input, { from: undefined });
      
      expect(result.css).toContain('color: blue');
      expect(result.css).toContain('background: white');
      expect(result.css).not.toContain('color: red');
    });
  });

  describe('Error handling and robustness', () => {
    test('should handle malformed CSS gracefully', async () => {
      const input = `
        .malformed {
          color: red
          color: blue;
        }
      `;
      
      // PostCSS will throw a syntax error for malformed CSS before our plugin runs
      await expect(async () => {
        await getCSS(input);
      }).rejects.toThrow('Missed semicolon');
    });

    test('should handle empty CSS input', async () => {
      const input = '';
      
      const output = await getCSS(input);
      expect(output).toBe('');
    });

    test('should handle CSS with only whitespace', async () => {
      const input = '   \n  \t  ';
      
      const output = await getCSS(input);
      expect(output.trim()).toBe('');
    });
  });

  describe('Performance and memory', () => {
    test('should handle large number of properties efficiently', async () => {
      const properties = Array.from({ length: 1000 }, (_, i) => `prop${i}: value${i};`);
      const duplicateProperties = Array.from({ length: 1000 }, (_, i) => `prop${i}: duplicate${i};`);
      
      const input = `
        .large-rule {
          ${properties.join('\n          ')}
          ${duplicateProperties.join('\n          ')}
        }
      `;
      
      const startTime = Date.now();
      const output = await getCSS(input);
      const endTime = Date.now();
      
      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Should contain the duplicate values (last ones)
      expect(output).toContain('prop0: duplicate0');
      expect(output).toContain('prop999: duplicate999');
      
      // Should not contain the original values
      expect(output).not.toContain('prop0: value0');
      expect(output).not.toContain('prop999: value999');
    });
  });
});
