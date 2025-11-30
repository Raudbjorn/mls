import { describe, it, expect } from 'vitest';

/**
 * Icon Atom Tests
 *
 * Icons are decorative or semantic visual elements.
 * Tests should verify consistent rendering and accessibility.
 */
describe('Icon', () => {
  describe('rendering', () => {
    it.todo('should render the specified icon by name', () => {
      expect.fail('TODO: Test that Icon renders correct SVG/path for given icon name');
    });

    it.todo('should apply size prop correctly', () => {
      expect.fail('TODO: Test that Icon scales to small/medium/large/custom sizes');
    });

    it.todo('should apply color prop or inherit from parent', () => {
      expect.fail('TODO: Test that Icon uses currentColor or specified color prop');
    });

    it.todo('should handle unknown icon names gracefully', () => {
      expect.fail('TODO: Test that Icon shows fallback or empty state for invalid names');
    });
  });

  describe('accessibility', () => {
    it.todo('should have aria-hidden for decorative icons', () => {
      expect.fail('TODO: Test that decorative icons are hidden from screen readers');
    });

    it.todo('should have aria-label for semantic icons', () => {
      expect.fail('TODO: Test that icons with meaning have accessible labels');
    });

    it.todo('should support title element for tooltips', () => {
      expect.fail('TODO: Test that SVG title element is rendered when label provided');
    });
  });
});
