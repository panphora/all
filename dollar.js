const createMethodHandler = (elements, plugins, methods) => ({
  get(target, prop) {
    // Handle array-like numeric access and length
    if (prop === 'length') return elements.length;
    
    // Handle Symbol.iterator BEFORE number check
    if (prop === Symbol.iterator) {
      return elements[Symbol.iterator].bind(elements);
    }

    // Handle numeric indices
    if (!isNaN(prop)) return elements[prop];

    // Handle array methods
    if (prop in Array.prototype) {
      const arrayMethod = Array.prototype[prop];
      return (...args) => {
        const result = arrayMethod.apply(elements, args);
        // For methods that return arrays, wrap in proxy
        if (Array.isArray(result)) {
          return createElementProxy(result, plugins, methods);
        }
        // For single element returns (like find), return raw value
        if (result instanceof Element) {
          return result;
        }
        // For boolean/primitive returns (some, every, etc), return raw value
        return result;
      };
    }

    // Handle event listeners
    if (prop.startsWith('on')) {
      return (handler) => {
        const eventName = prop.slice(2);
        elements.forEach(el => el.addEventListener(eventName, handler));
        return createElementProxy(elements, plugins, methods);
      };
    }

    // Check plugins first
    if (plugins[prop]) {
      const plugin = plugins[prop];
      if (typeof plugin === 'function') {
        return createElementProxy(plugin(elements), plugins, methods);
      }
      if (typeof plugin === 'object') {
        if (plugin.value) {
          return createElementProxy(plugin.value(elements), plugins, methods);
        }
        if (plugin.properties) {
          return createNestedPluginProxy(elements, plugin.properties, plugins, methods);
        }
      }
      return plugin;
    }

    if (methods[prop]) {
      const method = methods[prop];
      return (...args) => {
        const result = method.apply(createElementProxy(elements, plugins, methods), args);
        return result instanceof Array ? createElementProxy(result, plugins, methods) : result;
      };
    }

    const firstEl = elements[0];
    if (!firstEl) {
      // Return no-op proxy for any intermediate objects
      return new Proxy({}, {
        get: () => () => createElementProxy([], plugins, methods),
        set: () => true
      });
    }

    const value = firstEl[prop];
    
    // Handle functions
    if (typeof value === 'function') {
      return (...args) => {
        const results = elements.map(el => el[prop](...args));
        // Return the original proxy for chainable methods
        if (results[0] === undefined) {
          return createElementProxy(elements, plugins, methods);
        }
        // Return results for value-returning methods
        return results;
      };
    }

    // Handle intermediate objects (style, classList, dataset)
    if (['style', 'classList', 'dataset'].includes(prop)) {
      return createIntermediateProxy(elements, prop, plugins, methods);
    }

    // Return array of values for leaf properties
    return elements.map(el => el[prop]);
  },

  set(target, prop, value) {
    elements.forEach(el => {
      el[prop] = typeof value === 'function' ? value(el) : value;
    });
    return true;
  }
});

const createNestedPluginProxy = (elements, properties, plugins, methods) => {
  return new Proxy({}, {
    get(target, prop) {
      if (properties[prop]) {
        const plugin = properties[prop];
        if (typeof plugin === 'function') {
          return createElementProxy(plugin(elements), plugins, methods);
        }
        return plugin;
      }
      return undefined;
    }
  });
};

const createIntermediateProxy = (elements, propName, plugins, methods) => {
  return new Proxy({}, {
    get(target, prop) {
      const firstEl = elements[0];
      if (!firstEl) {
        // Return function that does nothing and maintains chainability
        return typeof prop === 'function' ? 
          () => createElementProxy([], plugins, methods) : 
          undefined;
      }

      const value = firstEl[propName][prop];
      if (typeof value === 'function') {
        return (...args) => {
          elements.forEach(el => el[propName][prop](...args));
          return createElementProxy(elements, plugins, methods);
        };
      }

      return elements.map(el => el[propName][prop]);
    },

    set(target, prop, value) {
      elements.forEach(el => {
        el[propName][prop] = typeof value === 'function' ? value(el) : value;
      });
      return true;
    }
  });
};

const sharedState = {
  plugins: {},
  methods: {}
};

const createElementProxy = (elements, plugins = sharedState.plugins, methods = sharedState.methods) => {
  return new Proxy(elements, createMethodHandler(elements, plugins, methods));
};

const $ = new Proxy(function(contextOrSelector, selector) {
  // If only one argument, use the original behavior
  if (arguments.length === 1 && typeof contextOrSelector === 'string') {
    return createElementProxy(Array.from(document.querySelectorAll(contextOrSelector)));
  }
  
  // Handle context + selector case
  if (arguments.length === 2) {
    if (!(contextOrSelector instanceof Element)) {
      throw new TypeError('Context must be an Element');
    }
    if (typeof selector !== 'string') {
      throw new TypeError('Selector must be a string');
    }

    // Check if the context element itself matches the selector
    const matches = [];
    if (contextOrSelector.matches(selector)) {
      matches.push(contextOrSelector);
    }

    // Get matching children
    const children = contextOrSelector.querySelectorAll(selector);
    return createElementProxy([...matches, ...children]);
  }

  throw new TypeError('Invalid arguments. Use $(selector) or $(context, selector)');
}, {
  get(target, prop) {
    if (prop === 'use') {
      return function(plugin) {
        if (!plugin || typeof plugin !== 'object') {
          throw new TypeError('Plugin must be an object with "properties" or "methods"');
        }
        if (plugin.properties) {
          Object.assign(sharedState.plugins, plugin.properties);
        }
        if (plugin.methods) {
          Object.assign(sharedState.methods, plugin.methods);
        }
        return this;
      };
    }

    if (prop === Symbol.iterator) return undefined;
    if (prop in target) return target[prop];
    
    const elements = Array.from(document.querySelectorAll(`[${prop}], .${prop}`));
    return createElementProxy(elements);
  }
});

export default $;