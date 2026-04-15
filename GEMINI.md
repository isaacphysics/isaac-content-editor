# Isaac Content Editor

## Project Overview

The **Isaac Content Editor** is a React-based web application designed for structured editing of educational content for the Isaac platform (e.g., Isaac Physics, Ada Computer Science). It provides a "semantic" editing experience, allowing users to modify complex JSON-based content types (concepts, questions, figures, etc.) through a high-level, type-safe user interface.

### Key Technologies
- **Frontend:** React 19, TypeScript 5.9
- **Routing:** React Router 7
- **Styling:** Bootstrap 5, Reactstrap, CSS Modules
- **Data Fetching:** SWR (Stale-While-Revalidate)
- **Content Rendering:** KaTeX (Math), Remarkable (Markdown), CodeMirror (Code/JSON)
- **Build Tool:** Craco (Create React App Configuration Override)
- **Source Control Integration:** GitHub API for reading/writing content

### Architecture
- **Semantic Editing:** The core of the application is in `src/components/semantic/`. It uses a "presenter" pattern where each content type defined in `src/isaac-data-types.d.ts` has a corresponding presenter component (e.g., `FigurePresenter`, `QuestionPresenter`) that handles its specific UI and update logic.
- **Global State:** Managed via `AppContext` in `src/App.tsx`, covering editor state, GitHub context, selection, and navigation.
- **Service Layer:** 
  - `src/services/github.ts`: Handles GitHub API interactions.
  - `src/services/isaacApi.ts`: Provides fetchers for local, staging, and live Isaac servers.
  - `src/services/auth.ts`: Manages authentication.

---

## Building and Running

### Prerequisites
- Node.js
- Yarn (preferred) or NPM

### Key Commands

| Command | Description |
| :--- | :--- |
| `yarn install` | Installs project dependencies. |
| `yarn start` | Runs the app in development mode at `http://localhost:3000`. |
| `yarn build` | Runs linting and builds the app for production. |
| `yarn test` | Launches the test runner (Craco test). |
| `yarn lint` | Runs ESLint checks on the `src/` directory. |

---

## Development Conventions

### Coding Style
- **TypeScript First:** Always use strong typing. Refer to `src/isaac-data-types.d.ts` for established content models.
- **Functional Components:** Use functional components with hooks (e.g., `useContext`, `useEffect`, `useSWR`).
- **CSS Modules:** Use `.module.css` for component-level styling to avoid global namespace pollution.
- **Immutability:** Treat the document state as immutable. Use the `update` callback provided to presenters to dispatch changes.

### Semantic Presenters
When adding or modifying content types:
1.  Check `src/components/semantic/registry.tsx` (if it exists) or the `SemanticItem` logic to see how components are mapped to content types.
2.  Implement or update presenters in `src/components/semantic/presenters/`.
3.  Ensure the presenter handles both `value` (direct content) and `children` (nested content) correctly, often using `ContentValueOrChildrenPresenter`.

### Testing
- Place tests alongside source files with a `.test.tsx` extension.
- Use `craco test` to run them.
