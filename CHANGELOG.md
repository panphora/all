# Changelog

## v1.6.1 - Bug Fix for Empty Collections
- Fixed handling of empty collections to prevent errors when chaining
- Improved property access on non-existent elements
- Added safe property inspection using Object.getOwnPropertyDescriptor
- Empty collections now return no-op functions that maintain chainability

## v1.6.0 - Library Renamed to All.js
- **BREAKING CHANGE**: Library renamed from "all" to "All" to avoid conflict with `document.all`
- API changed from `all` to `All` (e.g., `All.menu` instead of `all.menu`)
- Published as `alldom` on npm (same package name)
- All functionality remains exactly the same, only the global variable name changes

## v1.5.0 - Library Renamed to all.js
- **BREAKING CHANGE**: Library renamed from "dollar" to "all.js"
- API changed from `$` to `all` (e.g., `all.menu` instead of `$.menu`)
- Published as `alldom` on npm
- All functionality remains exactly the same, only the API name changes
- Automatically unwrap proxy arguments when passed as args (e.g. `.prepend(all.menu)`)

## v1.4.3 - Bug Fixes
- Prevented double method execution in certain scenarios

## v1.4.2 - DOM Method Arguments Fix
- Fixed DOM methods with multiple arguments

## v1.4.1 - Context Support
- Improved context-based selection support

## v1.3.0 - Empty Collection Handling
- Made empty collections silently do nothing when properties are accessed
- Improved chaining for intermediate methods that return empty proxies

## v1.1.x - Early Releases
- Event delegation with object-based binding capabilities
- Introduced built-in plugins: `eq()`, `prop()`, `css()`
- Enhanced method chaining for DOM nodes

## v1.0.0 - Initial Release as dollar.js
- Original release as `$` (dollar.js)
- Core DOM manipulation functionality
- jQuery-like syntax with native DOM methods