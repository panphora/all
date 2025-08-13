# All.js

A modern DOM manipulation library that feels like native JavaScript. Write cleaner code with an API that matches the actual DOM, while keeping the convenience of jQuery-style selections and chaining.

```javascript
// jQuery
All('.menu').addClass('active').css('background-color', 'blue');

// All.js - use the actual DOM API
All.menu.classList.add('active').style.backgroundColor = 'blue';
```

## Why All.js?

- **Native DOM Methods**: Use `classList.add()` instead of `addClass()`, `style.backgroundColor` instead of `css()`
- **Native Array Methods**: Native `map`, `filter`, `forEach` without `.each()` or `.toArray()`
- **Method Chaining**: Proxies enable natural property access and method chaining, including with native DOM methods that return elements
- **Smart Selectors**: Target elements with attributes (`<div menu>`) or classes (`.menu`) - matches both!
- **Zero Dependencies**: Tiny footprint using modern browser features

## Pure JavaScript Feel

```javascript
// jQuery way
All('.items').filter('[data-enabled]').addClass('active').hide();

// All.js - just like vanilla JS
All.items
  .filter(el => el.dataset.enabled)
  .classList.add('active')
  .style.display = 'none';
```

## Smart Selectors

```javascript
// <div menu>Menu 1</div>
// <div class="menu">Menu 2</div>

// Selects both elements above
All.menu.classList.add('active');
```

## Complex selectors

```javascript
All('header [nav] > .link');
```

## Real Arrays, Real DOM

```javascript
// Find all expensive items and format their prices
const expensiveItems = All.item
  .filter(el => parseFloat(el.dataset.price) > 100)
  .map(el => ({
    name: el.textContent,
    price: `$${el.dataset.price}`
  }));

const firstMenu = All.menu[0];
const menuCount = All.menu.length;

for (const el of All.menu) {
  console.log(el);
}
```

## Native DOM Method Chaining

```javascript
// Chain methods that return elements
All.menu
  .querySelector('.submenu')   // Returns element
  .cloneNode(true)            // Returns cloned element
  .classList.add('copy');     // Continues chaining

// Chain with All.js objects
const menu = All.menu;
All.main.appendChild(menu);     // Accepts All.js objects directly
All.sidebar.prepend(All.nav);     // Works with All insertion methods
```

## Function Property Assignment

Pass a function to any property to run it on each element. The function receives the element as its argument and its return value is assigned to the property.

```javascript
// Conditional display
All.item.style.display = el => 
  el.dataset.active ? '' : 'none'

// Dynamic colors
All.item.style.color = el => 
  el.dataset.priority === 'high' ? 'red' : 'black'

// Set text based on data
All.price.textContent = el => 
  `$${el.dataset.amount}`

// Class toggling
All.item.className = el => 
  el.dataset.enabled ? 'active enabled' : 'disabled'

// Inline search/filter
<input oninput="All.item.style.display = el =>
  !this.value || el.textContent.includes(this.value) ? '' : 'none'"
>
```

This lets you write concise code that automatically applies functions to each element in a selection.

## Event Handling Without the Mess

```javascript
// jQuery
All('.menu').on('click', function(e) {
  All(this).addClass('clicked');
}).on('mouseenter', function(e) {
  All(this).addClass('hover');
});

// All.js
All.menu
  .onclick(e => e.target.classList.add('clicked'))
  .onmouseenter(e => e.target.classList.add('hover'));
```

## Event Delegation

```javascript
// Delegate clicks on .button elements within .menu
All.menu.onclick('.button', e => {
  console.log('Button clicked', e.target);
});

// Multiple delegated handlers with object syntax
All.menu.onclick({
  '.button': e => console.log('Button clicked'),
  '.link': e => console.log('Link clicked')
});
```

## Built-in Plugins

All.js includes several default plugins for common operations:

```javascript
// Element selection
All.menu.eq(0)           // Get first menu element
All.menu.eq(-1)          // Get last menu element

// Bulk property setting
All.button.prop({
  disabled: true,
  type: 'submit'
})

// jQuery-style CSS
All.item.css({
  backgroundColor: 'blue',
  marginTop: '10px'
})
```

## Perfect for Inline Handlers

Turn complex interactions into concise one-liners that are easy to understand and maintain.

### Toggle Elements

```html
<!-- Toggle all panels with one click -->
<button onclick="All.panel.classList.toggle('active')">Toggle Panels</button>

<!-- Toggle with custom class -->
<button onclick="All.section.classList.toggle('expanded')">Expand All</button>
```

### Live Search/Filtering
```html
<!-- Basic search filter -->
<input 
  type="search" 
  placeholder="Search items..."
  oninput="All.item.style.display = 
    el => !this.value || 
    el.textContent.toLowerCase().includes(this.value.toLowerCase())
      ? ''
      : 'none'"
>

<!-- Search with highlighting -->
<input 
  type="search" 
  placeholder="Search and highlight..."
  oninput="
    All.item.classList.remove('highlight');
    if (this.value) {
      All.item
        .filter(el => el.textContent.toLowerCase().includes(this.value.toLowerCase()))
        .classList.add('highlight')
    }
  "
>
```

### Form Validation
```html
<!-- Validate required fields on submit -->
<form novalidate onsubmit="
  event.preventDefault();
  const invalid = All(this, '[required]').filter(el => !el.value);
  invalid.classList.add('error');
  if (invalid.length === 0) {
    this.submit();
  }
">
  <input required placeholder="Name">
  <input required placeholder="Email">
  <button>Submit</button>
</form>
```

### Dynamic Updates

```html
<!-- Update multiple prices based on plan selection -->
<div>
  <select onchange="
    All(this.parentElement, '[data-price]').textContent = 
      this.options[this.selectedIndex].dataset.price
  ">
    <option data-price="$10/mo">Basic</option>
    <option data-price="$20/mo">Pro</option>
  </select>
  <div data-price>$10/mo</div>
  <div data-price>$10/mo</div>
</div>

<!-- Update counters -->
<div>
  <button onclick="
    All.counter.textContent = Number(All.counter[0].textContent) + 1
  ">Increment All</button>
  <span counter>0</span>
</div>
```

### Responsive Interactions

```html
<!-- Toggle elements with transitions -->
<style>
.card { transition: all 0.3s; }
.card.expanded { height: 200px; }
</style>

<div>
  <button onclick="
    All.card.classList.toggle('expanded');
    this.textContent = 
      All.card[0].classList.contains('expanded') ? 
        'Collapse All' : 'Expand All'
  ">Expand All</button>
  
  <div class="card">Content</div>
  <div class="card">Content</div>
</div>
```

These inline handlers are especially useful for:
- Quick prototypes and demos
- Simple interactive components
- Small projects where a full JS file would be overkill
- Learning and teaching DOM manipulation
- Static sites where you want to add minimal interactivity

Note: For larger applications or complex interactions, consider moving these handlers to a separate JavaScript file for better maintainability.

## Extensible Through Plugins

```javascript
// Define plugin with properties and methods
const visibilityPlugin = {
  properties: {
    visible: elements => elements.filter(el => el.offsetHeight > 0)
  },
  methods: {
    show() {
      this.forEach(el => el.style.display = '');
      return this;
    }
  }
};

// Use plugin
All.use(visibilityPlugin);

// Natural usage
All.menu.visible.show().onclick(e => console.log('clicked'));
```

## Advanced Chaining

All.js intelligently handles method return values:
- Methods returning Elements (like `cloneNode`) → Continue chaining
- Methods returning undefined (like `removeAttribute`) → Continue chaining
- Methods returning other values (like `getAttribute`) → Return value array

```javascript
// Methods returning Elements chain automatically
All.menu
  .cloneNode(true)      // Returns Element
  .classList.add('copy');

// Methods returning undefined continue the chain
All.button
  .removeAttribute('disabled')  // Returns undefined
  .classList.add('active');     // Chaining continues

// Get actual return values when needed
const ids = All.item.map(el => el.id);
const hasClass = All.menu.classList.contains('active');
```

## Working with All.js Objects

All.js objects can be used as arguments to DOM methods:

```javascript
// Pass All.js objects directly to DOM methods
All.main.appendChild(All.sidebar);
All.nav.insertBefore(All.header, All.main);

// Works with any method accepting Elements
All.menu.replaceWith(All.nav);
All.section.after(All.footer);
```

## Installation

npm

```bash
npm install alldom
```

umd (browser)

```html
<script src="https://cdn.jsdelivr.net/npm/alldom@1.6.0/dist/all.umd.min.js"></script>
```

esm (browser)

```html
<script type="module">
  import All from 'https://cdn.jsdelivr.net/npm/alldom@1.6.0/dist/all.esm.min.js';
</script>
```

## Getting Started

### Get productive with All.js in under 5 minutes

```javascript
// 1. Basic Selection
// Select elements just like you would with querySelectorAll
All.menu                     // <div menu>, <div class="menu">
All('button')               // <button>
All('.items')               // elements with 'items' class
All('[data-enabled]')       // elements with data-enabled attribute
All('ul > li')              // direct child selectors work too

// 2. Modifying Elements
// Use regular DOM properties with automatic chaining
All.menu
  .classList.add('active')         // add a class
  .style.backgroundColor = 'blue'  // set styles directly

// 3. Filtering
// Use native array methods - no special jQuery syntax
All.item
  .filter(el => el.dataset.enabled)    // only enabled items
  .map(el => el.textContent)           // get text content
  .forEach(text => console.log(text))  // do something with each

// 4. Event Handling
// Simple event binding with automatic 'this' handling
All.button
  .onclick(e => e.target.classList.add('clicked'))
  .onmouseenter(e => e.target.classList.add('hover'))

// 5. Context Selection
// Search within specific elements
All('.sidebar', '.item')    // items inside sidebar
All(menuElement, 'button')  // buttons inside menu element

// 6. Working with Forms
All('form')
  .onsubmit(e => {
    e.preventDefault()
    const data = new FormData(e.target)
    console.log(Object.fromEntries(data))
  })

// 7. Array-like Features
All.item.length             // get count
All.item[0]                 // get first element
for (const el of All.item)  // iteration works
[...All.item]              // spread into array
```

### Common Patterns

```javascript
// Toggle visibility of elements
All.panel.style.display = 'none'     // hide all panels
All.panel.style.display = ''         // show all panels

// Add/remove multiple classes
All.menu.classList.add('active', 'visible')
All.menu.classList.remove('loading', 'disabled')

// Filter and modify
All.item
  .filter(el => el.dataset.category === 'featured')
  .classList.add('highlighted')

// Finding elements
const activeItems = All.item.filter(el => el.classList.contains('active'))
const firstEnabled = All.item.find(el => el.dataset.enabled)
const hasDisabled = All.item.some(el => el.disabled)

// Get/set attributes
All.button.setAttribute('aria-expanded', 'true')
const ids = All.item.map(el => el.id)

// Working with data attributes
All.user.dataset.status = 'online'   // set data-status="online"
const roles = All.user.map(el => el.dataset.role)
```

### Common mistakes

```javascript
// ❌ Don't try to chain after assignment
All.menu.style.color = 'blue'
  .classList.add('active')

// ✅ Do - separate statements
All.menu.classList.add('active')
All.menu.style.color = 'blue'

// ✅ or use forEach
All.menu.forEach(el => {
  el.classList.add('active')
  el.style.color = 'blue'
})
```

## Browser Support

Works in all modern browsers with ES6+ support. No polyfills needed, no legacy baggage.

## Size Comparison

- jQuery: 30KB minified + gzipped
- All.js: 1KB minified + gzipped

## How it's worse than jQuery

- Less cross-browser normalization than jQuery
- Native DOM can be more verbose than jQuery
- No chaining after assignment
- Fewer utility functions / no AJAX

## License

MIT