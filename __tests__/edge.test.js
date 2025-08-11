const postcss = require('postcss');
const plugin = require('../src/index.js');

const getCSS = async (css, options = {}) => {
  const result = await postcss([plugin(options)]).process(css, { from: undefined });
  return result.css;
};

describe('Edge Cases and Complex Scenarios', () => {
  describe('CSS at-rules and complex selectors', () => {
    test('should handle media queries', async () => {
      const input = `
        @media (max-width: 768px) {
          .responsive {
            color: red;
            color: blue;
          }
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('@media (max-width: 768px)');
      expect(output).toContain('color: blue');
      expect(output).not.toContain('color: red');
    });

    test('should handle keyframes', async () => {
      const input = `
        @keyframes slide {
          0% {
            transform: translateX(0);
            transform: translateX(0px);
          }
          100% {
            transform: translateX(100px);
            transform: translateX(100px);
          }
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('@keyframes slide');
      expect(output).toContain('transform: translateX(0px)');
      expect(output).toContain('transform: translateX(100px)');
      expect(output).not.toContain('transform: translateX(0)');
    });

    test('should handle complex selectors with pseudo-elements', async () => {
      const input = `
        .button:hover::before {
          content: "Hello";
          content: "World";
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('content: "World"');
      expect(output).not.toContain('content: "Hello"');
    });

    test('should handle attribute selectors', async () => {
      const input = `
        [data-test="value"] {
          border: 1px solid red;
          border: 2px solid blue;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('border: 2px solid blue');
      expect(output).not.toContain('border: 1px solid red');
    });
  });

  describe('CSS values with special characters', () => {
    test('should handle URLs with quotes', async () => {
      const input = `
        .background {
          background-image: url("image1.jpg");
          background-image: url('image2.jpg');
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain("background-image: url('image2.jpg')");
      expect(output).not.toContain('background-image: url("image1.jpg")');
    });

    test('should handle calc() functions', async () => {
      const input = `
        .element {
          width: calc(100% - 20px);
          width: calc(100% - 30px);
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('width: calc(100% - 30px)');
      expect(output).not.toContain('width: calc(100% - 20px)');
    });

    test('should handle CSS variables with fallbacks', async () => {
      const input = `
        .element {
          color: var(--primary-color, red);
          color: var(--primary-color, blue);
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('color: var(--primary-color, blue)');
      expect(output).not.toContain('color: var(--primary-color, red)');
    });

    test('should handle rgba/hsla values', async () => {
      const input = `
        .element {
          background-color: rgba(255, 0, 0, 0.5);
          background-color: rgba(0, 255, 0, 0.8);
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('background-color: rgba(0, 255, 0, 0.8)');
      expect(output).not.toContain('background-color: rgba(255, 0, 0, 0.5)');
    });
  });

  describe('Vendor prefix edge cases', () => {
    test('should handle vendor prefixes in complex values', async () => {
      const input = `
        .element {
          -webkit-transform: translate3d(0, 0, 0) rotate(45deg);
          transform: translate3d(0, 0, 0) rotate(45deg);
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('-webkit-transform: translate3d(0, 0, 0) rotate(45deg)');
      expect(output).toContain('transform: translate3d(0, 0, 0) rotate(45deg)');
    });

    test('should handle vendor prefixes with !important', async () => {
      const input = `
        .element {
          -webkit-transform: rotate(45deg) !important;
          -webkit-transform: rotate(90deg) !important;
          transform: rotate(45deg);
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('-webkit-transform: rotate(90deg) !important');
      expect(output).toContain('transform: rotate(45deg)');
      expect(output).not.toContain('-webkit-transform: rotate(45deg) !important');
    });

    test('should handle multiple vendor prefixes for same property', async () => {
      const input = `
        .element {
          -webkit-transform: rotate(45deg);
          -moz-transform: rotate(45deg);
          -ms-transform: rotate(45deg);
          -o-transform: rotate(45deg);
          transform: rotate(45deg);
        }
      `;
      
      const output = await getCSS(input);
      
      // All vendor prefixes should be preserved
      expect(output).toContain('-webkit-transform: rotate(45deg)');
      expect(output).toContain('-moz-transform: rotate(45deg)');
      expect(output).toContain('-ms-transform: rotate(45deg)');
      expect(output).toContain('-o-transform: rotate(45deg)');
      expect(output).toContain('transform: rotate(45deg)');
    });
  });

  describe('Empty and malformed CSS handling', () => {
    test('should handle rules with only whitespace', async () => {
      const input = `
        .whitespace-only {
          
        }
        .normal-rule {
          color: blue;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).not.toContain('.whitespace-only');
      expect(output).toContain('.normal-rule');
      expect(output).toContain('color: blue');
    });

    test('should handle rules with only newlines', async () => {
      const input = `
        .newline-only {

        }
        .normal-rule {
          color: blue;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).not.toContain('.newline-only');
      expect(output).toContain('.normal-rule');
      expect(output).toContain('color: blue');
    });

    test('should handle CSS with mixed content types', async () => {
      const input = `
        /* Comment */
        .rule1 {
          color: red;
          color: blue;
        }
        
        @import "styles.css";
        
        .rule2 {
          margin: 10px;
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('/* Comment */');
      expect(output).toContain('@import "styles.css"');
      expect(output).toContain('color: blue');
      expect(output).toContain('margin: 10px');
      expect(output).not.toContain('color: red');
    });
  });

  describe('Performance edge cases', () => {
    test('should handle extremely long property values', async () => {
      const longValue = 'a'.repeat(10000);
      const input = `
        .long-value {
          content: "${longValue}";
          content: "short";
        }
      `;
      
      const startTime = Date.now();
      const output = await getCSS(input);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
      expect(output).toContain('content: "short"');
      expect(output).not.toContain(longValue);
    });

    test('should handle many duplicate properties efficiently', async () => {
      const duplicates = Array.from({ length: 100 }, () => 'color: red;').join('\n');
      const input = `
        .many-duplicates {
          ${duplicates}
          color: blue;
        }
      `;
      
      const startTime = Date.now();
      const output = await getCSS(input);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500);
      expect(output).toContain('color: blue');
      expect(output).not.toContain('color: red');
    });
  });

  describe('Selector filtering edge cases', () => {
    test('should handle complex selector functions', async () => {
      const input = `
        .button-primary {
          color: red;
          color: blue;
        }
        .button-secondary {
          color: green;
          color: yellow;
        }
        .card {
          margin: 10px;
        }
      `;
      
      const output = await getCSS(input, {
        selector: (selector) => {
          return selector.includes('button') && selector.includes('primary');
        }
      });
      
      expect(output).toContain('color: blue');
      expect(output).not.toContain('color: red');
      expect(output).toContain('color: green');
      expect(output).toContain('color: yellow');
      expect(output).toContain('margin: 10px');
    });

    test('should handle regex with special characters', async () => {
      const input = `
        .btn-primary {
          color: red;
          color: blue;
        }
        .btn-secondary {
          color: green;
          color: yellow;
        }
      `;
      
      const output = await getCSS(input, { selector: /\.btn-/ });
      
      expect(output).toContain('color: blue');
      expect(output).toContain('color: yellow');
      expect(output).not.toContain('color: red');
      expect(output).not.toContain('color: green');
    });

    test('should handle function that returns false for all selectors', async () => {
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
        selector: () => false
      });
      
      // No selectors should be processed
      expect(output).toContain('color: red');
      expect(output).toContain('color: blue');
      expect(output).toContain('margin: 10px');
      expect(output).toContain('margin: 20px');
    });
  });

  describe('CSS parsing edge cases', () => {
    test('should handle CSS with escaped characters', async () => {
      const input = `
        .escaped {
          content: "Hello\\"World";
          content: "Goodbye\\"World";
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('content: "Goodbye\\"World"');
      expect(output).not.toContain('content: "Hello\\"World"');
    });

    test('should handle CSS with unicode characters', async () => {
      const input = `
        .unicode {
          content: "🎉";
          content: "🎊";
        }
      `;
      
      const output = await getCSS(input);
      
      expect(output).toContain('content: "🎊"');
      expect(output).not.toContain('content: "🎉"');
    });
  });
});
