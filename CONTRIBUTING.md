# Contributing to MLS

Thank you for your interest in contributing to MLS (MeiliSearch Library for Svelte)! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Architecture](#architecture)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Style Guide](#style-guide)
- [Documentation](#documentation)

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive environment.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/mls.git`
3. Add upstream remote: `git remote add upstream https://github.com/Raudbjorn/mls.git`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- A running MeiliSearch instance (for testing)
- Git

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Run Storybook
npm run storybook
```

### MeiliSearch Setup

For local development, you can run MeiliSearch using Docker:

```bash
docker run -p 7700:7700 \
  -e MEILI_MASTER_KEY='masterKey' \
  getmeili/meilisearch:latest
```

## Architecture

MLS follows an Atomic Design pattern with Domain-Driven Design principles:

```
src/lib/
├── design-system/     # UI components (atoms, molecules, organisms, templates)
├── features/         # Feature modules
├── meili/           # Domain layer (services, utils, types)
├── golden-paths/    # Zero-config components
└── index.ts         # Public API
```

### Key Principles

1. **Atomic Design**: Components are organized by complexity
2. **Feature Modules**: Self-contained feature implementations
3. **Domain Separation**: Business logic separated from UI
4. **Type Safety**: Full TypeScript coverage
5. **Testing**: Comprehensive test coverage

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (browser, Node version, etc.)

### Suggesting Features

1. Check the roadmap and existing feature requests
2. Open a discussion or issue describing:
   - The problem it solves
   - Proposed solution
   - Alternative approaches considered

### Contributing Code

#### Adding a New Component

1. **Design System Component** (atoms/molecules/organisms):
   ```bash
   # Create component
   src/lib/design-system/atoms/YourComponent.svelte

   # Add tests
   src/lib/design-system/atoms/YourComponent.test.ts

   # Add story
   src/lib/design-system/atoms/YourComponent.stories.svelte

   # Export from barrel
   src/lib/design-system/atoms/index.ts
   ```

2. **Feature Component**:
   ```bash
   # Create feature folder
   src/lib/features/your-feature/

   # Add main component
   src/lib/features/your-feature/YourFeature.svelte

   # Add contract test
   src/lib/features/your-feature/YourFeature.contract.test.ts

   # Export from index
   src/lib/features/your-feature/index.ts
   ```

3. **Domain Logic**:
   ```bash
   # Add service
   src/lib/meili/services/YourService.ts

   # Add property tests
   src/lib/meili/services/YourService.property.test.ts
   ```

#### Component Guidelines

- Use Svelte 5 syntax (runes)
- Include TypeScript types
- Add accessibility attributes
- Support theming via CSS variables
- Include JSDoc comments

Example component:

```svelte
<script lang="ts">
  /**
   * MyComponent - A brief description
   * @example
   * <MyComponent prop="value" />
   */

  interface Props {
    prop: string;
    optional?: boolean;
  }

  let { prop, optional = false }: Props = $props();
</script>

<div class="my-component" aria-label={prop}>
  <slot />
</div>

<style>
  .my-component {
    /* Use design tokens */
    padding: var(--mls-space-4);
    color: var(--mls-text-primary);
  }
</style>
```

## Pull Request Process

1. **Before submitting**:
   - Ensure all tests pass: `npm test`
   - Format code: `npm run format`
   - Check types: `npm run check`
   - Update documentation if needed

2. **PR Guidelines**:
   - Use a clear, descriptive title
   - Reference any related issues
   - Include screenshots for UI changes
   - Add tests for new functionality
   - Update CHANGELOG.md

3. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Screenshots (if applicable)

   ## Checklist
   - [ ] My code follows the style guide
   - [ ] I have added tests
   - [ ] Documentation is updated
   ```

## Testing Guidelines

### Test Types

1. **Unit Tests** (`*.test.ts`)
   - Test components in isolation
   - Mock external dependencies
   - Co-located with source files

2. **Contract Tests** (`*.contract.test.ts`)
   - Test feature interfaces
   - Ensure API stability

3. **Property Tests** (`*.property.test.ts`)
   - Test domain invariants
   - Use fast-check for generation

4. **Integration Tests** (`tests/integration/`)
   - Test library-level behavior
   - Validate public API

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import MyComponent from './MyComponent.svelte';

describe('MyComponent', () => {
  it('should render with props', () => {
    const { getByText } = render(MyComponent, {
      props: { text: 'Hello' }
    });

    expect(getByText('Hello')).toBeTruthy();
  });

  it('should handle click events', async () => {
    const { getByRole } = render(MyComponent);
    const button = getByRole('button');

    await fireEvent.click(button);
    // Assert expected behavior
  });
});
```

## Style Guide

### Code Style

- Use Prettier for formatting (configured in `.prettierrc`)
- Use ESLint for linting
- Follow TypeScript best practices

### Git Commit Messages

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

Examples:
```
feat(search): add hybrid search component
fix(button): correct disabled state styling
docs(readme): update installation instructions
```

### CSS Guidelines

- Use design tokens for all values
- Follow BEM naming for complex components
- Keep specificity low
- Support light/dark themes

```css
.component {
  /* Use tokens */
  color: var(--mls-text-primary);
  padding: var(--mls-space-4);

  /* Support themes */
  background: var(--mls-surface-paper);

  /* Transitions */
  transition: all var(--mls-duration-base) var(--mls-ease-inOut);
}

.component--variant {
  /* BEM modifier */
}

.component__element {
  /* BEM element */
}
```

## Documentation

### Component Documentation

Add JSDoc comments to all exported components:

```typescript
/**
 * Component description
 *
 * @param {string} prop - Property description
 * @returns {void}
 *
 * @example
 * <MyComponent prop="value" />
 */
```

### Storybook Stories

Create stories for all visual components:

```svelte
<script module lang="ts">
  import type { Meta } from '@storybook/svelte';
  import Component from './Component.svelte';

  export const meta: Meta<Component> = {
    title: 'Category/Component',
    component: Component,
    tags: ['autodocs'],
  };
</script>

<script>
  import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="Default">
  <Component />
</Story>
```

### README Updates

Update README.md when adding:
- New features
- Breaking changes
- Configuration options
- Examples

## Questions?

- Open a discussion on GitHub
- Check existing issues and PRs
- Review the architecture documentation

Thank you for contributing to MLS! 🎉