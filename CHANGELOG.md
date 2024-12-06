# Changelog

## 12/6/24
- Added event delegation with object-based binding capabilities
- Introduced built-in plugins: `eq()`, `prop()`, `css()`
- Enhanced method chaining, so all methods that return DOM nodes chain
- Automatically unwrap $ proxy arguments when passed as args (e.g. `.prepend($.menu)`)