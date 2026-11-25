# Frontend Agent Instructions

You are the owner and long-term maintainer of this codebase, and its design is up to you.

## Scope

These instructions apply to all files under `Front/`.

This project is a React Native application using Expo, Expo Router, and TypeScript.

Follow the existing project architecture and conventions before introducing new patterns.

---

## Architecture

```text
src/
├─ app/          # Expo Router routes and layouts only
├─ features/     # Feature/domain-specific implementation
├─ components/   # Shared UI used across multiple features
├─ lib/          # Shared technical infrastructure
├─ providers/    # App-wide React providers
├─ constants/    # Shared constants and design tokens
└─ types/        # Truly shared TypeScript types
```

Use this mental model:

```text
app        = navigation
features   = product/domain functionality
components = shared UI
lib        = technical infrastructure
providers  = app-wide context/providers
```

Preserve these boundaries when creating or moving files.

---

## Expo Router

`src/app` is for routes and route-level layouts only.

Keep route files thin.

Route files may:

* read route parameters
* configure navigation
* perform redirects
* connect feature components to routes

Do not place substantial business logic, API logic, or large UI implementations directly in route files.

Prefer:

```tsx
import { PromiseDetailScreen } from '@/features/promises/components/PromiseDetailScreen';

export default function Page() {
  return <PromiseDetailScreen />;
}
```

Use Expo Router route groups such as `(auth)`, `(app)`, and `(tabs)` for navigation organization.

Prefer route-group layouts for authentication protection instead of repeating auth checks on individual screens.

---

## Features

Feature-specific implementation belongs in:

```text
src/features/<feature>/
```

Current feature domains include:

```text
auth
promises
friends
invitations
maps
location
```

A feature may contain:

```text
api.ts
types.ts
hooks.ts
components/
```

If a feature grows, these may become directories such as `hooks/` or `api/`.

Keep code close to the feature that owns it.

Do not move feature-specific code into global directories simply to make it reusable in theory.

---

## Components

Feature-specific components belong in:

```text
src/features/<feature>/components/
```

Cross-feature reusable UI belongs in:

```text
src/components/
├─ ui/
└─ layout/
```

Examples for `components/ui`:

* Button
* Input
* Modal
* Badge
* Avatar
* LoadingIndicator
* EmptyState

Examples for `components/layout`:

* Screen
* Header
* SafeAreaContainer
* KeyboardAwareLayout

Do not place domain-specific components in shared UI directories.

Prefer small, focused components with a clear responsibility.

Avoid combining complex business logic, API requests, navigation, and large presentation code in one component.

---

## API

Shared HTTP infrastructure belongs in:

```text
src/lib/api/
├─ client.ts
└─ config.ts
```

Feature API functions belong in:

```text
src/features/<feature>/api.ts
```

All backend requests should use the shared API client.

Do not:

* create duplicate HTTP clients inside features
* hardcode backend base URLs in components
* perform direct API requests inside route files
* duplicate authentication-header handling

---

## Authentication

Authentication logic belongs primarily in:

```text
src/features/auth/
```

App-wide authentication context belongs in:

```text
src/providers/AuthProvider.tsx
```

Persistent auth/token storage should remain behind the project's storage abstraction.

Prefer protecting authenticated navigation at the route-group layout level.

Do not scatter repeated authentication checks across screens.

---

## Maps and Location

Map UI belongs in:

```text
src/features/maps/
```

Location behavior belongs in:

```text
src/features/location/
```

Keep these responsibilities separate.

For platform-specific implementations, prefer React Native filename conventions:

```text
Component.web.tsx
Component.native.tsx
Component.ios.tsx
Component.android.tsx
```

Use platform-specific files when implementations differ substantially.

Do not use browser-only APIs in shared native code.

---

## TypeScript

Use TypeScript strictly.

Avoid `any`.

Keep feature-specific types inside their owning feature.

Use `src/types/` only for types genuinely shared across unrelated features.

Define API request and response types explicitly when their shapes are known.

Prefer domain-specific unions over arbitrary strings.

```ts
type PromiseStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED';
```

---

## Imports and Naming

Prefer absolute imports:

```tsx
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
```

Avoid deep relative imports such as:

```tsx
../../../../components/ui/Button
```

Naming conventions:

```text
React components  → PascalCase.tsx
Hooks             → useSomething
Utilities         → camelCase.ts
Routes            → lowercase / kebab-case
Dynamic routes    → [promiseId]
```

Preserve existing project naming conventions when they are already established.

---

## State

Keep state as local as possible.

Use:

* component state for local UI state
* feature hooks for feature behavior
* providers for genuinely app-wide state

Do not introduce a global state library unless it is clearly necessary or already used by the project.

Do not duplicate server-derived data into global state without a reason.

If the project uses a server-state library such as TanStack Query, follow that existing approach consistently.

---

## React Native Rules

Use React Native primitives in shared/native code.

Prefer:

```text
View
Text
Pressable
TextInput
FlatList
SectionList
```

Do not use browser elements or APIs such as:

```text
div
span
button
window
document
localStorage
```

unless the code is explicitly web-only.

Prefer `Pressable` for new generic interactive UI unless an existing project convention says otherwise.

Use `FlatList` or `SectionList` for potentially large collections.

---

## Code Quality

Before creating new code:

1. inspect nearby files
2. identify existing conventions
3. search for reusable components, hooks, utilities, and API functions
4. modify existing abstractions when appropriate instead of duplicating them

Do not create unnecessary abstractions.

Avoid premature layers such as `manager`, `repository`, `factory`, or `service` unless they solve a real architectural problem.

Do not extract trivial code into hooks or utilities merely for abstraction.

Prefer simple, readable code.

---

## Dependencies

Do not add a dependency when React, React Native, Expo, or existing project dependencies can reasonably solve the problem.

Before adding a library, verify compatibility with:

* the current Expo SDK
* React Native
* Android
* iOS
* Web, when applicable

Do not introduce overlapping libraries that solve the same problem.

---

## Changes and Refactoring

Keep changes focused on the requested task.

Do not perform unrelated large-scale refactors.

Do not rename or reorganize large parts of the project unless necessary.

Safe cleanup directly related to the requested change is allowed.

When existing project conventions conflict with these guidelines, prefer consistency with established code unless there is a clear architectural problem.

Do not modify code outside `Front/` unless explicitly requested.

If a frontend task requires a backend change, describe the required API contract instead of silently editing backend code.

---

## Error and Async Handling

Do not silently swallow errors.

Handle relevant:

* loading states
* error states
* empty states
* mutation/submission states

Use `async` / `await` consistently.

Prevent duplicate submissions when appropriate.

Do not leave unhandled promises in UI event handlers.

---

## Performance

Do not add `useMemo`, `useCallback`, or `React.memo` automatically.

Use them only when there is a meaningful performance or referential-stability reason.

Prefer clarity over premature optimization.

---

## Validation

After making changes, inspect `package.json` and run relevant existing project scripts when available.

Examples:

```bash
npm run lint
npm run typecheck
npm test
```

Only run scripts that actually exist.

Do not invent validation commands.

If validation fails because of an unrelated pre-existing issue, report it clearly instead of hiding or modifying unrelated code.

---

## Final Decision Rule

When deciding where code belongs, use this order:

1. Which feature owns this behavior?
2. Does it require an Expo Router route?
3. Is there already an implementation that can be reused?
4. Is the UI feature-specific or truly shared?
5. Is the code domain logic or technical infrastructure?
6. Can state remain local?
7. Can this be implemented without a new dependency?

Most importantly:

> `src/app` defines where users can navigate.
> `src/features` defines what the application does.

Keep that boundary clear.
