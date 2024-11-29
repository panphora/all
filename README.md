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
- **Smart Selection**: Target elements with attributes (`<div menu>`) or classes (`.menu`) - matches both!
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

## Smart Selections

```javascript
<div menu>Menu 1</div>
<div class="menu">Menu 2</div>

// Select by attribute or class
$.menu.classList.add('active');

// Complex selectors work too
$('header [nav] > .link');
```

## Real Arrays, Real DOM

```javascript
const visibleMenus = $.menu
  .filter(el => !el.classList.contains('hidden'))
  .map(el => el.textContent);

const firstMenu = $.menu[0];
const menuCount = $.menu.length;

for (const el of $.menu) {
  console.log(el);
}
```

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

## Perfect for Inline Handlers

```html
<!-- Toggle panels with one line -->
<button onclick="$.panel.classList.toggle('active')">Toggle All Panels</button>

<!-- Live search filtering -->
<input 
  type="search" 
  oninput="$.item.style.display = this.value ? 
    $.item.filter(el => el.textContent.includes(this.value)).style.display = '' : ''"
>

<!-- Form submission with validation -->
<form onsubmit="return $(this, '[required]').filter(el => !el.value).classList.add('error').length === 0">
  <input required>
  <input required>
  <button>Submit</button>
</form>

<!-- Dynamic updates -->
<div>
  <select onchange="$(this.parentElement, '[prices]').textContent = `$${this.value}`">
    <option value="10">Basic</option>
    <option value="20">Pro</option>
  </select>
  <div prices>$10</div>
  <div prices>$10</div>
</div>
```

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
