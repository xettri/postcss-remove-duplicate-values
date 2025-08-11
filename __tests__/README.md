# Test Suite for postcss-remove-duplicate-values

This directory contains comprehensive tests for the PostCSS plugin that removes duplicate CSS property values.

## Test Structure

### `plugin.test.js` - Core Functionality Tests
Tests the main plugin functionality including:
- Basic duplicate property removal
- `!important` declaration handling
- Vendor prefix support
- Selector filtering options
- Empty rule handling
- Edge cases and complex scenarios
- Performance with large CSS files

### `edge-cases.test.js` - Edge Cases and Complex Scenarios
Tests specific edge cases including:
- CSS at-rules (media queries, keyframes)
- Complex selectors with pseudo-elements
- CSS values with special characters
- Vendor prefix edge cases
- Empty and malformed CSS handling
- Performance edge cases
- Selector filtering edge cases

### `integration.test.js` - Integration and Real-world Tests
Tests integration scenarios including:
- PostCSS plugin integration
- Configuration options integration
- Real-world CSS scenarios (Bootstrap-like, CSS Grid, animations)
- CSS output formatting
- Error handling integration
- Performance integration

### `utils.js` - Test Utilities
Helper functions for testing:
- CSS processing utilities
- Test CSS generation
- Performance measurement
- Pattern creation

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests for CI
```bash
npm run test:ci
```

## Test Coverage

The test suite aims for **90%+ coverage** across:
- **Branches**: All conditional logic paths
- **Functions**: All plugin functions
- **Lines**: All executable code lines
- **Statements**: All code statements

## Test Categories

### 1. Basic Functionality
- ✅ Duplicate property removal
- ✅ Non-duplicate property preservation
- ✅ Multiple duplicate properties in sequence

### 2. Important Declarations
- ✅ `!important` over non-important
- ✅ Multiple `!important` declarations (last wins)
- ✅ Mixed important and non-important

### 3. Vendor Prefixes
- ✅ `-webkit-`, `-moz-`, `-ms-`, `-o-` prefixes
- ✅ Vendor prefixes with `!important`
- ✅ Multiple vendor prefixes for same property
- ✅ Complex vendor prefix values

### 4. Selector Filtering
- ✅ String selector matching
- ✅ Regular expression matching
- ✅ Function-based selector matching
- ✅ No selector (process all)

### 5. Empty Rule Handling
- ✅ Remove empty rules by default
- ✅ Preserve empty rules when configured
- ✅ Rules with only comments
- ✅ Rules with only whitespace

### 6. Edge Cases
- ✅ CSS at-rules (media queries, keyframes)
- ✅ Complex selectors (pseudo-elements, attributes)
- ✅ Special CSS values (URLs, calc(), variables)
- ✅ Escaped characters and unicode
- ✅ Malformed CSS handling

### 7. Performance
- ✅ Large CSS files (1000+ rules)
- ✅ Many duplicate properties
- ✅ Extremely long property values
- ✅ Many vendor prefixes

### 8. Integration
- ✅ PostCSS plugin chain
- ✅ Different configuration options
- ✅ Real-world CSS scenarios
- ✅ CSS output formatting

## Adding New Tests

When adding new tests:

1. **Use descriptive test names** that explain what is being tested
2. **Group related tests** using `describe` blocks
3. **Test both positive and negative cases**
4. **Include edge cases** and error conditions
5. **Use the utility functions** from `utils.js` when possible
6. **Maintain test isolation** - each test should be independent

## Example Test Structure

```javascript
describe('Feature Name', () => {
  test('should handle normal case', async () => {
    const input = '/* CSS input */';
    const output = await getCSS(input);
    
    expect(output).toContain('expected output');
    expect(output).not.toContain('unexpected output');
  });

  test('should handle edge case', async () => {
    const input = '/* edge case CSS */';
    const output = await getCSS(input);
    
    expect(output).toMatch(/expected pattern/);
  });
});
```

## Debugging Tests

If tests fail:

1. **Check the test output** for specific error messages
2. **Verify CSS input** matches expected format
3. **Check plugin options** are correctly configured
4. **Use console.log** to debug CSS output
5. **Run individual tests** using Jest's `--testNamePattern` option

## Performance Testing

Performance tests ensure the plugin handles large CSS files efficiently:
- Large CSS files should process in < 2 seconds
- Many duplicate properties should process in < 500ms
- Vendor prefix handling should be efficient

## Contributing

When contributing to the test suite:
1. Follow the existing test patterns
2. Add tests for any new functionality
3. Ensure all tests pass before submitting
4. Update this README if adding new test categories
5. Maintain high test coverage standards
