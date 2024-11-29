# dollar

A modern DOM manipulation library that feels like native JavaScript. Write cleaner code with an API that matches the actual DOM, while keeping the convenience of jQuery-style selections and chaining.

```javascript
// jQuery
$('.menu').addClass('active').css('background-color', 'blue');

// dollar - use the actual DOM API
$.menu.classList.add('active').style.backgroundColor = 'blue';
```

## Why dollar?

- **Authentic DOM Methods**: Use `classList.add()` instead of `addClass()`, `style.backgroundColor` instead of `css()`
- **Smart Selector**: Target elements with attributes (`<div menu>`) or classes (`.menu`) - matches both!
- **Real Arrays**: Native `map`, `filter`, `forEach` without `.each()` or `.toArray()`
- **Modern Chaining**: Proxies enable natural property access and method chaining
- **Zero Dependencies**: Tiny footprint using modern browser features

## Pure JavaScript Feel

```javascript
// jQuery way
$('.items').filter('[data-enabled]').addClass('active').hide();

// dollar - just like vanilla JS
$.items
  .filter(el => el.dataset.enabled)
  .classList.add('active')
  .style.display = 'none';
```

## Smart Selector

```javascript
// <div menu>Menu 1</div>
// <div class="menu">Menu 2</div>

// Selects both elements above
$.menu.classList.add('active');
```

## Complex selectors

```javascript
$('header [nav] > .link');
```

## Real Arrays, Real DOM

```javascript
// Find all expensive items and format their prices
const expensiveItems = $.item
  .filter(el => parseFloat(el.dataset.price) > 100)
  .map(el => ({
    name: el.textContent,
    price: `$${el.dataset.price}`
  }));

const firstMenu = $.menu[0];
const menuCount = $.menu.length;

for (const el of $.menu) {
  console.log(el);
}
```

## Function Property Assignment

Pass a function to any property to run it on each element. The function receives the element as its argument and its return value is assigned to the property.

```javascript
// Conditional display
$.item.style.display = el => 
  el.dataset.active ? '' : 'none'

// Dynamic colors
$.item.style.color = el => 
  el.dataset.priority === 'high' ? 'red' : 'black'

// Set text based on data
$.price.textContent = el => 
  `$${el.dataset.amount}`

// Class toggling
$.item.className = el => 
  el.dataset.enabled ? 'active enabled' : 'disabled'

// Inline search/filter
<input oninput="$.item.style.display = el =>
  !this.value || el.textContent.includes(this.value) ? '' : 'none'"
>
```

This lets you write concise code that automatically applies functions to each element in a selection.

## Event Handling Without the Mess

```javascript
// jQuery
$('.menu').on('click', function(e) {
  $(this).addClass('clicked');
}).on('mouseenter', function(e) {
  $(this).addClass('hover');
});

// dollar
$.menu
  .onClick(e => e.target.classList.add('clicked'))
  .onMouseenter(e => e.target.classList.add('hover'));
```

Here's a more detailed and better documented version of the Inline Handlers section:

## Perfect for Inline Handlers

Turn complex interactions into concise one-liners that are easy to understand and maintain.

### Toggle Elements

```html
<!-- Toggle all panels with one click -->
<button onclick="$.panel.classList.toggle('active')">Toggle Panels</button>

<!-- Toggle with custom class -->
<button onclick="$.section.classList.toggle('expanded')">Expand All</button>
```

### Live Search/Filtering
```html
<!-- Basic search filter -->
<input 
  type="search" 
  placeholder="Search items..."
  oninput="$.item.style.display = 
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
    $.item.classList.remove('highlight');
    if (this.value) {
      $.item
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
  const invalid = $(this, '[required]').filter(el => !el.value);
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
    $(this.parentElement, '[data-price]').textContent = 
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
    $.counter.textContent = Number($.counter[0].textContent) + 1
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
    $.card.classList.toggle('expanded');
    this.textContent = 
      $.card[0].classList.contains('expanded') ? 
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
$.use(visibilityPlugin);

// Natural usage
$.menu.visible.show().onClick(e => console.log('clicked'));
```

## Installation

npm

```bash
npm install dollar
```

umd (browser)

```html
<script src="https://cdn.jsdelivr.net/npm/@panphora/dollar@1.1.3/dist/dollar.umd.min.js"></script>
```

esm (browser)

```html
<script type="module">
  import $ from 'https://cdn.jsdelivr.net/npm/@panphora/dollar@1.1.3/dist/dollar.esm.min.js';
</script>
```

## Getting Started

### Get productive with dollar in under 5 minutes

```javascript
// 1. Basic Selection
// Select elements just like you would with querySelectorAll
$.menu                     // <div menu>, <div class="menu">
$('button')               // <button>
$('.items')               // elements with 'items' class
$('[data-enabled]')       // elements with data-enabled attribute
$('ul > li')              // direct child selectors work too

// 2. Modifying Elements
// Use regular DOM properties with automatic chaining
$.menu
  .classList.add('active')         // add a class
  .style.backgroundColor = 'blue'  // set styles directly

// 3. Filtering
// Use native array methods - no special jQuery syntax
$.item
  .filter(el => el.dataset.enabled)    // only enabled items
  .map(el => el.textContent)           // get text content
  .forEach(text => console.log(text))  // do something with each

// 4. Event Handling
// Simple event binding with automatic 'this' handling
$.button
  .onClick(e => e.target.classList.add('clicked'))
  .onMouseenter(e => e.target.classList.add('hover'))

// 5. Context Selection
// Search within specific elements
$('.sidebar', '.item')    // items inside sidebar
$(menuElement, 'button')  // buttons inside menu element

// 6. Working with Forms
$('form')
  .onSubmit(e => {
    e.preventDefault()
    const data = new FormData(e.target)
    console.log(Object.fromEntries(data))
  })

// 7. Array-like Features
$.item.length             // get count
$.item[0]                 // get first element
for (const el of $.item)  // iteration works
[...$.item]              // spread into array
```

### Common Patterns

```javascript
// Toggle visibility of elements
$.panel.style.display = 'none'     // hide all panels
$.panel.style.display = ''         // show all panels

// Add/remove multiple classes
$.menu.classList.add('active', 'visible')
$.menu.classList.remove('loading', 'disabled')

// Filter and modify
$.item
  .filter(el => el.dataset.category === 'featured')
  .classList.add('highlighted')

// Finding elements
const activeItems = $.item.filter(el => el.classList.contains('active'))
const firstEnabled = $.item.find(el => el.dataset.enabled)
const hasDisabled = $.item.some(el => el.disabled)

// Get/set attributes
$.button.setAttribute('aria-expanded', 'true')
const ids = $.item.map(el => el.id)

// Working with data attributes
$.user.dataset.status = 'online'   // set data-status="online"
const roles = $.user.map(el => el.dataset.role)
```

### Common mistakes

```javascript
// ❌ Don't try to chain after assignment
$.menu.style.color = 'blue'
  .classList.add('active')

// ✅ Do - separate statements
$.menu.classList.add('active')
$.menu.style.color = 'blue'

// ✅ or use forEach
$.menu.forEach(el => {
  el.classList.add('active')
  el.style.color = 'blue'
})
```

## Browser Support

Works in all modern browsers with ES6+ support. No polyfills needed, no legacy baggage.

## Size Comparison

- jQuery: 30KB minified + gzipped
- dollar: 1KB minified + gzipped

# How it's worse than jQuery

- Less cross-browser normalization than jQuery
- Native DOM can be more verbose than jQuery
- No chaining after assignment
- Fewer utility functions / no AJAX

## License

MIT
