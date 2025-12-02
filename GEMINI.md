# GEMINI.md - Context & Usage Guide

## Project Overview

**MLS (MeiliSearch Library for Svelte)** is a comprehensive Svelte 5+ component library and toolkit designed for managing, monitoring, and interacting with Meilisearch instances.

*   **Type:** Svelte/SvelteKit Component Library
*   **Purpose:** Provide atomic UI components, feature-rich modules, and domain services for Meilisearch integration.
*   **Key Stack:** Svelte 5 (Runes), TypeScript, Vite, Meilisearch, Storybook.

## Architecture

The project adheres to **Atomic Design** principles combined with **Domain-Driven Design (DDD)**.

### 1. Directory Structure (`src/lib/`)

*   **`design-system/`**: Pure UI components, strictly presentational.
    *   `atoms/`: Basic elements (Button, Input, Badge).
    *   `molecules/`: Simple compositions (SearchInput, ConfirmDialog).
    *   `organisms/`: Complex sections (TaskTable, ApiKeyTable).
    *   `templates/`: Page layouts (AdminShell).
*   **`features/`**: Self-contained feature modules connecting UI to logic.
    *   Examples: `backup`, `tasks`, `settings`, `security`.
*   **`meili/`**: Domain layer, framework-agnostic business logic.
    *   `services/`: `TaskService`, `BatchService`, `TypedIndex`.
    *   `utils/`: API clients, token generation.
    *   `types/`: TypeScript definitions.
*   **`golden-paths/`**: "Zero-config" components for instant usage (e.g., `AdminConsole`).

### 2. Key Concepts

*   **Svelte 5 Runes:** The project explicitly uses Svelte 5 features (e.g., `$props()`, `$state`).
*   **Co-location:** Tests (`*.test.ts`) and stories (`*.stories.svelte`) are located next to their source files.
*   **Types:** Extensive use of TypeScript interfaces for strict typing of Meilisearch entities.

## Building & Development

### Key Commands

*   **Install Dependencies:** `npm install`
*   **Dev Server:** `npm run dev` (Vite)
*   **Build Library:** `npm run build` (Svelte-package)
*   **Type Check:** `npm run check` (Svelte-check)
*   **Unit Tests:** `npm run test:unit` (Vitest)
*   **Linting:** `npm run lint` (ESLint)
*   **Formatting:** `npm run format` (Prettier)
*   **Storybook:** `npm run storybook` (Component workbench)

### Testing Strategy

*   **Unit Tests (`*.test.ts`):** Component isolation tests.
*   **Contract Tests (`*.contract.test.ts`):** Ensure feature interface stability.
*   **Property Tests (`*.property.test.ts`):** Verify domain invariants (using fast-check).
*   **Integration Tests (`tests/integration/`):** Test public API and cross-feature flows.
*   **E2E Tests (`tests/e2e/`):** Full browser flows using Playwright.

## Development Conventions

1.  **Component Creation:**
    *   Place in `src/lib/design-system/[type]` or `src/lib/features/[feature]`.
    *   Use Svelte 5 syntax (`<script lang="ts">` with runes).
    *   Create a co-located `*.test.ts` file.
    *   Create a co-located `*.stories.svelte` file for UI components.
    *   Export from the relevant `index.ts` barrel file.
2.  **Styling:**
    *   Use CSS variables (Design Tokens) defined in `src/lib/design-system/tokens`.
    *   Support Light/Dark modes via these variables.
    *   Use BEM-like naming for complex internal classes if necessary, but scoped styles are preferred.
3.  **State Management:**
    *   Use Svelte's reactivity system (Runes) primarily.
    *   Context API is used for providing MeiliSearch client configuration (`MeiliProvider`).

## Public API

The `src/lib/index.ts` file is the source of truth for exports. It maintains:
*   **Backward Compatible Exports:** Flat exports of components/services.
*   **Atomic Structure Exports:** `designSystem`, `features`, `meili`.
*   **Golden Paths:** `QuickStart`, `AdminConsole`.

## Dependencies

*   `svelte`: ^5.0.0
*   `meilisearch`: ^0.37.0 (Peer dependency ^0.35.0)
*   `vite`: ^5.0.3
*   `vitest`: ^2.0.0
*   `storybook`: ^10.1.2
