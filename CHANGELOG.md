# Changelog

## Library Renamed to all.js
- **BREAKING CHANGE**: Library renamed from "dollar" to "all.js"
- API changed from `$` to `all` (e.g., `all.menu` instead of `$.menu`)
- Published as `alldom` on npm
- All functionality remains exactly the same, only the API name changes

## 12/6/24
- Added event delegation with object-based binding capabilities
- Introduced built-in plugins: `eq()`, `prop()`, `css()`
- Enhanced method chaining, so all methods that return DOM nodes chain
- Automatically unwrap proxy arguments when passed as args (e.g. `.prepend(all.menu)`)