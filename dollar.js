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

    // Handle event listeners and support event delegation
    if (prop.startsWith('on')) {
      return (selectorOrHandlerOrObject, optionalHandler) => {
        const eventName = prop.slice(2);
        
        // Handle object of bindings
        if (selectorOrHandlerOrObject && typeof selectorOrHandlerOrObject === 'object') {
          Object.entries(selectorOrHandlerOrObject).forEach(([selector, handler]) => {
            elements.forEach(el => {
              el.addEventListener(eventName, (e) => {
                const closest = e.target.closest(selector);
                if (closest && el.contains(closest)) {
                  handler.call(closest, e);
                }
              });
            });
          });
          return createElementProxy(elements, plugins, methods);
        }
        
        // Handle single binding (existing delegation code)
        if (optionalHandler) {
          const selector = selectorOrHandlerOrObject;
          const handler = optionalHandler;
          
          elements.forEach(el => {
            el.addEventListener(eventName, (e) => {
              const closest = e.target.closest(selector);
              if (closest && el.contains(closest)) {
                handler.call(closest, e);
              }
            });
          });
        } else {
          const handler = selectorOrHandlerOrObject;
          elements.forEach(el => el.addEventListener(eventName, handler));
        }
        
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

    // Get first element's property to determine type
    const firstEl = elements[0];
    if (!firstEl) {
      // If the property is a known DOM method, return a no-op function for chaining.
      const candidateMethod = Element.prototype[prop] || Node.prototype[prop];
      if (typeof candidateMethod === 'function') {
        return (...args) => createElementProxy([], plugins, methods);
      }
      if (['style', 'classList', 'dataset'].includes(prop)) {
        return createIntermediateProxy([], prop, plugins, methods);
      }
      return undefined;
    }

    const value = firstEl[prop];
    
    // The library is designed to handle chaining correctly
    // - When a method returns an Element (like cloneNode), it wraps it in a proxy
    // - When a method returns undefined (like removeAttribute), it chains on the original elements
    // - For other return values, like strings, it returns the results in an array
    // We also handle passing in a $-wrapped proxy object as an argument and loop over all elements in it
// In the method handler's get function, replace the function call handling with:
if (typeof value === 'function') {
  return (...args) => {
    // Unwrap any proxy arguments
    const unwrappedArgs = args.map(arg => {
      if (arg && arg.constructor === Proxy) {
        return Array.from(arg);
      }
      return arg;
    });

    const results = elements.map(el => {
      // Check if any of the unwrapped arguments are arrays (from proxies)
      const hasProxyArgs = unwrappedArgs.some(Array.isArray);
      
      if (hasProxyArgs) {
        // Handle proxy arguments case
        const elementResults = unwrappedArgs.map(arg => {
          if (Array.isArray(arg)) {
            return arg.map(proxyEl => el[prop](proxyEl));
          }
          return [el[prop](...args)];
        }).flat();
        return elementResults[elementResults.length - 1];
      } else {
        // Simple case - just call the method once with original arguments
        return el[prop](...args);
      }
    });

    if (results[0] instanceof Element) {
      return createElementProxy(results.filter(Boolean), plugins, methods);
    }
    if (results[0] === undefined) {
      return createElementProxy(elements, plugins, methods);
    }
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
      el[prop] = value;
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
      // Handle function properties (like classList.add)
      const firstEl = elements[0];
      if (!firstEl) return undefined;

      const value = firstEl[propName][prop];
      if (typeof value === 'function') {
        return (...args) => {
          elements.forEach(el => el[propName][prop](...args));
          return createElementProxy(elements, plugins, methods);
        };
      }

      // Return array of values for leaf properties
      return elements.map(el => el[propName][prop]);
    },

    set(target, prop, value) {
      elements.forEach(el => {
        el[propName][prop] = value;
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

const toElementArray = (input) => {
  if (input instanceof Element || input instanceof Document) {
    return [input];
  }
  if (Array.isArray(input)) {
    if (input.every(el => el instanceof Element || el instanceof Document)) {
      return input;
    }
    throw new TypeError('All array elements must be DOM Elements or Document');
  }
  if (typeof input === 'string') {
    return Array.from(document.querySelectorAll(input));
  }
  throw new TypeError('Input must be a selector string, Element, Document, or Array of Elements');
};

// Default plugins
const defaultPlugins = {
  methods: {
    eq(index) {
      if (typeof index !== 'number') {
        throw new TypeError('eq() requires a number as an argument');
      }
      
      // Handle negative indices (counting from the end)
      const normalizedIndex = index < 0 ? this.length + index : index;
      
      // Return array with single element at index, or empty array if index is invalid
      return this[normalizedIndex] ? [this[normalizedIndex]] : [];
    },

    prop(properties) {
      if (typeof properties !== 'object' || properties === null) {
        throw new TypeError('prop() requires an object of properties');
      }
      
      Object.entries(properties).forEach(([key, value]) => {
        this.forEach(el => {
          el[key] = value;
        });
      });
      
      return this;
    },
    
    css(styles) {
      if (typeof styles !== 'object' || styles === null) {
        throw new TypeError('css() requires an object of styles');
      }
      
      Object.entries(styles).forEach(([property, value]) => {
        this.forEach(el => {
          el.style[property] = value;
        });
      });
      
      return this;
    }
  }
};

const $ = new Proxy(function(selectorOrElements, contextSelector) {
  // First normalize the elements from the first argument
  let elements = toElementArray(selectorOrElements);
  
  // If there's a context selector, filter by matching elements and their descendants
  if (arguments.length === 2) {
    if (typeof contextSelector !== 'string') {
      throw new TypeError('Context selector must be a string');
    }
    elements = elements.flatMap(el => [
      ...(el.matches?.(contextSelector) ? [el] : []),
      ...Array.from(el.querySelectorAll(contextSelector))
    ]);
  }
  
  return createElementProxy(elements);
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

// Install default plugins
$.use(defaultPlugins);

export default $;