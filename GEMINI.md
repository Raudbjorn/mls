# MLS (MeiliSearch Library for Svelte) Project Context

## Project Overview
**MLS** is a comprehensive Svelte/SvelteKit component library designed for managing and interacting with MeiliSearch instances. It provides a suite of components for search administration, monitoring, and advanced features like hybrid search and vector index configuration.

### Core Technologies
*   **Framework:** Svelte 5 (Runes) & SvelteKit (Packaging)
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Search Engine:** MeiliSearch
*   **Testing:** Vitest (Unit/Contract/Property), Playwright (E2E)
*   **Documentation:** Storybook

## Architecture
The project follows a hybrid architecture combining **Atomic Design** for UI and **Domain-Driven Design** for logic.

### Directory Structure (`src/lib/`)
1.  **Design System (`design-system/`)**: Pure UI components.
    *   `atoms/`: Basic building blocks (Button, Input).
    *   `molecules/`: Simple combinations (SearchInput, ConfirmDialog).
    *   `organisms/`: Complex sections (TaskTable).
    *   `templates/`: Page layouts (AdminShell).
2.  **Features (`features/`)**: Domain-specific, self-contained modules.
    *   Examples: `backup/`, `tasks/`, `settings/`.
    *   Each feature combines UI components with business logic.
3.  **Domain Layer (`meili/`)**: Core business logic, agnostic of UI.
    *   `services/`: Business logic classes (TaskService).
    *   `utils/`: Helper functions.
    *   `types/`: TypeScript definitions.
4.  **Golden Paths (`golden-paths/`)**: Pre-configured, "zero-config" components like `AdminConsole`.

## Development & Workflow

### Key Commands
*   **Install Dependencies:** `npm install`
*   **Start Dev Server:** `npm run dev` (Vite)
*   **Build Library:** `npm run build` (Vite + SvelteKit package)
*   **Run Tests:**
    *   Unit: `npm run test:unit` (Vitest)
    *   Watch: `npm run test:unit:watch`
    *   All: `npm run test`
*   **Type Check:** `npm run check`
*   **Lint & Format:** `npm run lint` / `npm run format`
*   **Storybook:** `npm run storybook`

### Testing Strategy
*   **Unit Tests (`*.test.ts`):** Co-located with components. Test in isolation.
*   **Contract Tests (`*.contract.test.ts`):** For feature components to ensure API stability.
*   **Property Tests (`*.property.test.ts`):** For domain logic using `fast-check`.
*   **Integration Tests (`tests/integration/`):** Validate public API surface.
*   **E2E Tests (`tests/e2e/`):** Full user flows using Playwright.

## Coding Conventions
*   **Style:** Prettier & ESLint enforced.
*   **Svelte Version:** Svelte 5 with Runes syntax (`$props()`, `$state()`, etc.).
*   **TypeScript:** Strict typing required for all exports and internal logic.
*   **CSS:** Use CSS variables (Design Tokens) for theming (e.g., `var(--mls-space-4)`).
*   **Commits:** Conventional Commits format (`type(scope): description`).
    *   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Key Files
*   `src/lib/index.ts`: Public API entry point.
*   `package.json`: Dependencies and scripts.
*   `vite.config.ts`: Build configuration.
*   `svelte.config.js`: SvelteKit configuration.
*   `ARCHITECTURE.md`: Detailed architectural guidelines.
*   `CONTRIBUTING.md`: Contribution guidelines and setup.
