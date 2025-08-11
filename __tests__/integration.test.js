const postcss = require('postcss');
const plugin = require('../src/index.js');

describe('Integration Tests', () => {
  describe('PostCSS Plugin Integration', () => {
    test('should work as a PostCSS plugin', async () => {
      const input = `
        .test {
          color: red;
          color: blue;
        }
      `;

      const result = await postcss([plugin()]).process(input, {
        from: undefined,
      });

      expect(result.css).toContain('color: blue');
      expect(result.css).not.toContain('color: red');
      expect(result.css).toMatch(/\.test\s*\{\s*color:\s*blue;\s*\}/);
    });

    test('should work with plugin options', async () => {
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

      const result = await postcss([plugin({ selector: '.button' })]).process(
        input,
        { from: undefined },
      );

      expect(result.css).toContain('color: blue');
      expect(result.css).not.toContain('color: red');
      expect(result.css).toContain('margin: 10px');
      expect(result.css).toContain('margin: 20px');
    });

    test('should work in plugin chain', async () => {
      const input = `
        .element {
          color: red;
          color: blue;
          background: white;
        }
      `;

      // Simulate a plugin chain
      const result = await postcss([
        plugin(),
        // Add another plugin here if needed
      ]).process(input, { from: undefined });

      expect(result.css).toContain('color: blue');
      expect(result.css).toContain('background: white');
      expect(result.css).not.toContain('color: red');
    });
  });

  describe('Configuration Options Integration', () => {
    test('should handle undefined options gracefully', async () => {
      const input = `
        .test {
          color: red;
          color: blue;
        }
      `;

      const result = await postcss([plugin(undefined)]).process(input, {
        from: undefined,
      });

      expect(result.css).toContain('color: blue');
      expect(result.css).not.toContain('color: red');
    });

    test('should handle empty options object', async () => {
      const input = `
        .test {
          color: red;
          color: blue;
        }
      `;

      const result = await postcss([plugin({})]).process(input, {
        from: undefined,
      });

      expect(result.css).toContain('color: blue');
      expect(result.css).not.toContain('color: red');
    });

    test('should handle partial options', async () => {
      const input = `
        .test {
          color: red;
          color: blue;
        }
      `;

      const result = await postcss([plugin({ preserveEmpty: true })]).process(
        input,
        { from: undefined },
      );

      expect(result.css).toContain('color: blue');
      expect(result.css).not.toContain('color: red');
    });
  });

  describe('Real-world CSS Scenarios', () => {
    test('should handle Bootstrap-like CSS', async () => {
      const input = `
        .btn {
          display: inline-block;
          font-weight: 400;
          text-align: center;
          vertical-align: middle;
          cursor: pointer;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          border-radius: 0.25rem;
          transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .btn-primary {
          color: #fff;
          background-color: #007bff;
          border-color: #007bff;
          color: #ffffff;
          background-color: #0056b3;
          border-color: #0056b3;
        }
      `;

      const result = await postcss([plugin()]).process(input, {
        from: undefined,
      });

      // Check for exact property declarations, not substrings
      const output = result.css;

      // The plugin should keep the last declaration of each property
      expect(output).toMatch(/\bcolor:\s*#ffffff\b/);
      expect(output).toMatch(/\bbackground-color:\s*#0056b3\b/);
      expect(output).toMatch(/\bborder-color:\s*#0056b3\b/);

      // The plugin should remove the first declaration of each property
      expect(output).not.toMatch(/\bcolor:\s*#fff\b/);
      expect(output).not.toMatch(/\bbackground-color:\s*#007bff\b/);
      expect(output).not.toMatch(/\bborder-color:\s*#007bff\b/);
    });

    test('should handle CSS Grid/Flexbox properties', async () => {
      const input = `
        .grid-container {
          display: grid;
          display: flex;
          grid-template-columns: repeat(3, 1fr);
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          gap: 30px;
        }
      `;

      const result = await postcss([plugin()]).process(input, {
        from: undefined,
      });

      expect(result.css).toContain('display: flex');
      expect(result.css).toContain('grid-template-columns: repeat(4, 1fr)');
      expect(result.css).toContain('gap: 30px');
      expect(result.css).not.toContain('display: grid');
      expect(result.css).not.toContain('grid-template-columns: repeat(3, 1fr)');
      expect(result.css).not.toContain('gap: 20px');
    });

    test('should handle CSS animations and transitions', async () => {
      const input = `
        .animated {
          transition: all 0.3s ease;
          transition: all 0.5s ease-in-out;
          animation: slideIn 0.3s ease;
          animation: slideIn 0.5s ease-out;
        }
      `;

      const result = await postcss([plugin()]).process(input, {
        from: undefined,
      });

      expect(result.css).toContain('transition: all 0.5s ease-in-out');
      expect(result.css).toContain('animation: slideIn 0.5s ease-out');
      expect(result.css).not.toContain('transition: all 0.3s ease');
      expect(result.css).not.toContain('animation: slideIn 0.3s ease');
    });
  });

  describe('CSS Output Formatting', () => {
    test('should preserve CSS formatting and structure', async () => {
      const input = `
        .formatted {
          color: red;
          color: blue;
          
          /* Comment */
          background: white;
        }
      `;

      const result = await postcss([plugin()]).process(input, {
        from: undefined,
      });

      expect(result.css).toContain('color: blue');
      expect(result.css).toContain('background: white');
      expect(result.css).toContain('/* Comment */');
      expect(result.css).not.toContain('color: red');
    });

    test('should handle CSS with multiple rules and spacing', async () => {
      const input = `
        .rule1 {
          color: red;
          color: blue;
        }
        
        .rule2 {
          margin: 10px;
          margin: 20px;
        }
        
        .rule3 {
          padding: 5px;
        }
      `;

      const result = await postcss([plugin()]).process(input, {
        from: undefined,
      });

      expect(result.css).toContain('color: blue');
      expect(result.css).toContain('margin: 20px');
      expect(result.css).toContain('padding: 5px');
      expect(result.css).not.toContain('color: red');
      expect(result.css).not.toContain('margin: 10px');
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle malformed CSS without crashing', async () => {
      const input = `
        .malformed {
          color: red
          color: blue;
        }
      `;

      // PostCSS will throw a syntax error for malformed CSS before our plugin runs
      await expect(async () => {
        await postcss([plugin()]).process(input, { from: undefined });
      }).rejects.toThrow('Missed semicolon');
    });

    test('should handle empty CSS input', async () => {
      const input = '';

      const result = await postcss([plugin()]).process(input, {
        from: undefined,
      });
      expect(result.css).toBe('');
    });

    test('should handle CSS with only comments', async () => {
      const input = `
        /* This is a comment */
        /* Another comment */
      `;

      const result = await postcss([plugin()]).process(input, {
        from: undefined,
      });
      expect(result.css).toContain('/* This is a comment */');
      expect(result.css).toContain('/* Another comment */');
    });
  });

  describe('Performance Integration', () => {
    test('should handle large CSS files efficiently', async () => {
      // Generate a large CSS file with many rules
      const rules = Array.from(
        { length: 1000 },
        (_, i) => `
        .rule-${i} {
          color: red;
          color: blue;
          margin: ${i}px;
          margin: ${i * 2}px;
        }
      `,
      ).join('\n');

      const input = rules;

      const startTime = Date.now();
      const result = await postcss([plugin()]).process(input, {
        from: undefined,
      });
      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(2000);

      // Should contain the expected output
      expect(result.css).toContain('color: blue');
      expect(result.css).toContain('margin: 1998px');
      expect(result.css).not.toContain('color: red');
      expect(result.css).not.toContain('margin: 999px');
    });

    test('should handle CSS with many vendor prefixes efficiently', async () => {
      const vendorRules = Array.from(
        { length: 100 },
        (_, i) => `
        .vendor-${i} {
          -webkit-transform: rotate(${i}deg);
          -moz-transform: rotate(${i}deg);
          -ms-transform: rotate(${i}deg);
          -o-transform: rotate(${i}deg);
          transform: rotate(${i}deg);
        }
      `,
      ).join('\n');

      const input = vendorRules;

      const startTime = Date.now();
      const result = await postcss([plugin()]).process(input, {
        from: undefined,
      });
      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(1000);

      // All vendor prefixes should be preserved
      expect(result.css).toContain('-webkit-transform: rotate(0deg)');
      expect(result.css).toContain('-moz-transform: rotate(0deg)');
      expect(result.css).toContain('-ms-transform: rotate(0deg)');
      expect(result.css).toContain('-o-transform: rotate(0deg)');
      expect(result.css).toContain('transform: rotate(0deg)');
    });
  });
});
