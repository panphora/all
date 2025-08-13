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

## 12/6/24
- Added event delegation with object-based binding capabilities
- Introduced built-in plugins: `eq()`, `prop()`, `css()`
- Enhanced method chaining, so all methods that return DOM nodes chain
- Automatically unwrap proxy arguments when passed as args (e.g. `.prepend(All.menu)`)