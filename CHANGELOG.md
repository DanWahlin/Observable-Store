# Changelog

## 3.0.0 — February 2026

### Breaking Changes

- **Removed `includeStateChangesOnSubscribe` setting.** This was deprecated in v2.1.0. Use `stateWithPropertyChanges` or `globalStateWithPropertyChanges` instead.
- **ES2022 build target.** The library now targets ES2022, which means it requires a modern JavaScript runtime. Older bundlers that cannot handle native classes (e.g., Angular 15's webpack) are no longer supported. If you need Angular 15 support, stay on v2.x.
- **Dual ESM + CJS output.** The package now ships both ES module (`observable-store.js`) and CommonJS (`observable-store.cjs`) builds via the `exports` field in `package.json`. Most bundlers will resolve this automatically.

### New Features

- **`destroy()` method.** Call `destroy()` on a service to unregister it from the global store and complete its state dispatchers. This prevents memory leaks when services are created and destroyed dynamically (e.g., in Angular's `ngOnDestroy`).
- **Deep cloning for complex objects.** Objects with custom prototypes (Dayjs, Moment.js, Luxon DateTime, etc.) are now cloned correctly using a 4-strategy cascade: `clone()` → constructor → `Object.create` → reference fallback. Previously, `JSON.parse(JSON.stringify())` would strip prototype methods and corrupt these objects. (Fixes [#314](https://github.com/DanWahlin/Observable-Store/issues/314))
- **Deep Map/Set cloning.** Map and Set values are now individually deep-cloned rather than shallow-copied, preventing mutation leaks across state snapshots.

### Improvements

- **Vite build system.** Replaced `tsc` with [Vite](https://vitejs.dev/) library mode for building both `observable-store` and `observable-store-extensions`.
- **Vitest test framework.** Replaced Jasmine with [Vitest](https://vitest.dev/). 103 tests run in ~50ms.
- **TypeScript 5.8.** Upgraded from TypeScript 4.9.
- **Reduced dev dependencies.** From 8 to 4 (removed jasmine, ts-node, @types/jasmine, @types/node).
- **Code quality.** `hasOwnProperty()` → `Object.hasOwn()`, `var` → `const`, `==` → `===`, removed dead imports, reduced redundant cloning in `setState()`.

### Samples

All sample applications have been upgraded to current framework versions:
- **Angular:** 15 → 21 (standalone components, `@if`/`@for` control flow, `provideZoneChangeDetection`)
- **React:** 16 → 19 (hooks, React Router v7, Vite)
- **Vue:** 2 → 3.5 (Composition API, Vue Router v4, Vite)
- **JavaScript:** webpack → Vite

### Extensions

- `@codewithdan/observable-store-extensions` has been modernized with Vite + TypeScript 5.8 and ships dual ESM/CJS builds matching the core library.

---

## 2.2.15 — November 2022

- New `isStoreInitialized` property. Thanks to [Jason Landbridge](https://github.com/JasonLandbridge).

## 2.2.13 — August 2021

- Added `getStateSliceProperty()` function. Thanks to [Connor Smith](https://github.com/ConnorSmith-pf).

## 2.2.10 — May 2020

- Fixed internal cloning to respect `deepClone` parameter. Thanks to [Steve-RW](https://github.com/Steve-RW).

## 2.2.9 — May 2020

- Added Map and Set cloning support. Thanks to [Chris Andrade](https://github.com/chrisjandrade).

## 2.2.3 — December 2019

- Added Redux DevTools extension (`@codewithdan/observable-store-extensions`).
- Added `allStoreServices` property and `addExtension()` function.

## 2.1.0 — October 2019

- Added `stateWithPropertyChanges` and `globalStateWithPropertyChanges` observables.
- Deprecated `includeStateChangesOnSubscribe`.

## 2.0.0 — October 2019

- Strongly-typed API.
- RxJS moved to peer dependency.
- Added `globalSettings`.
- Added cloning for state immutability.
