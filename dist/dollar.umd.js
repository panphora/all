/*!
 * dollar v1.4.2
 * (c) 2025 David Miranda
 * Released under the MIT License
 */
var $ = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // dollar.js
  var dollar_exports = {};
  __export(dollar_exports, {
    default: () => dollar_default
  });
  var createMethodHandler = (elements, plugins, methods) => ({
    get(target, prop) {
      if (prop === "length") return elements.length;
      if (prop === Symbol.iterator) {
        return elements[Symbol.iterator].bind(elements);
      }
      if (!isNaN(prop)) return elements[prop];
      if (prop in Array.prototype) {
        const arrayMethod = Array.prototype[prop];
        return (...args) => {
          const result = arrayMethod.apply(elements, args);
          if (Array.isArray(result)) {
            return createElementProxy(result, plugins, methods);
          }
          if (result instanceof Element) {
            return result;
          }
          return result;
        };
      }
      if (prop.startsWith("on")) {
        return (selectorOrHandlerOrObject, optionalHandler) => {
          const eventName = prop.slice(2);
          if (selectorOrHandlerOrObject && typeof selectorOrHandlerOrObject === "object") {
            Object.entries(selectorOrHandlerOrObject).forEach(([selector, handler]) => {
              elements.forEach((el) => {
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
          if (optionalHandler) {
            const selector = selectorOrHandlerOrObject;
            const handler = optionalHandler;
            elements.forEach((el) => {
              el.addEventListener(eventName, (e) => {
                const closest = e.target.closest(selector);
                if (closest && el.contains(closest)) {
                  handler.call(closest, e);
                }
              });
            });
          } else {
            const handler = selectorOrHandlerOrObject;
            elements.forEach((el) => el.addEventListener(eventName, handler));
          }
          return createElementProxy(elements, plugins, methods);
        };
      }
      if (plugins[prop]) {
        const plugin = plugins[prop];
        if (typeof plugin === "function") {
          return createElementProxy(plugin(elements), plugins, methods);
        }
        if (typeof plugin === "object") {
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
        if (["style", "classList", "dataset"].includes(prop)) {
          return createIntermediateProxy([], prop, plugins, methods);
        }
        return void 0;
      }
      const value = firstEl[prop];
      if (typeof value === "function") {
        return (...args) => {
          const unwrappedArgs = args.map((arg) => {
            if (arg && arg.constructor === Proxy) {
              return Array.from(arg);
            }
            return arg;
          });
          const results = elements.map((el) => {
            const hasProxyArgs = unwrappedArgs.some(Array.isArray);
            if (hasProxyArgs) {
              const elementResults = unwrappedArgs.map((arg) => {
                if (Array.isArray(arg)) {
                  return arg.map((proxyEl) => el[prop](proxyEl));
                }
                return [el[prop](...args)];
              }).flat();
              return elementResults[elementResults.length - 1];
            } else {
              return el[prop](...args);
            }
          });
          if (results[0] instanceof Element) {
            return createElementProxy(results.filter(Boolean), plugins, methods);
          }
          if (results[0] === void 0) {
            return createElementProxy(elements, plugins, methods);
          }
          return results;
        };
      }
      if (["style", "classList", "dataset"].includes(prop)) {
        return createIntermediateProxy(elements, prop, plugins, methods);
      }
      return elements.map((el) => el[prop]);
    },
    set(target, prop, value) {
      elements.forEach((el) => {
        el[prop] = value;
      });
      return true;
    }
  });
  var createNestedPluginProxy = (elements, properties, plugins, methods) => {
    return new Proxy({}, {
      get(target, prop) {
        if (properties[prop]) {
          const plugin = properties[prop];
          if (typeof plugin === "function") {
            return createElementProxy(plugin(elements), plugins, methods);
          }
          return plugin;
        }
        return void 0;
      }
    });
  };
  var createIntermediateProxy = (elements, propName, plugins, methods) => {
    return new Proxy({}, {
      get(target, prop) {
        const firstEl = elements[0];
        if (!firstEl) return void 0;
        const value = firstEl[propName][prop];
        if (typeof value === "function") {
          return (...args) => {
            elements.forEach((el) => el[propName][prop](...args));
            return createElementProxy(elements, plugins, methods);
          };
        }
        return elements.map((el) => el[propName][prop]);
      },
      set(target, prop, value) {
        elements.forEach((el) => {
          el[propName][prop] = value;
        });
        return true;
      }
    });
  };
  var sharedState = {
    plugins: {},
    methods: {}
  };
  var createElementProxy = (elements, plugins = sharedState.plugins, methods = sharedState.methods) => {
    return new Proxy(elements, createMethodHandler(elements, plugins, methods));
  };
  var toElementArray = (input) => {
    if (input instanceof Element || input instanceof Document) {
      return [input];
    }
    if (Array.isArray(input)) {
      if (input.every((el) => el instanceof Element || el instanceof Document)) {
        return input;
      }
      throw new TypeError("All array elements must be DOM Elements or Document");
    }
    if (typeof input === "string") {
      return Array.from(document.querySelectorAll(input));
    }
    throw new TypeError("Input must be a selector string, Element, Document, or Array of Elements");
  };
  var defaultPlugins = {
    methods: {
      eq(index) {
        if (typeof index !== "number") {
          throw new TypeError("eq() requires a number as an argument");
        }
        const normalizedIndex = index < 0 ? this.length + index : index;
        return this[normalizedIndex] ? [this[normalizedIndex]] : [];
      },
      prop(properties) {
        if (typeof properties !== "object" || properties === null) {
          throw new TypeError("prop() requires an object of properties");
        }
        Object.entries(properties).forEach(([key, value]) => {
          this.forEach((el) => {
            el[key] = value;
          });
        });
        return this;
      },
      css(styles) {
        if (typeof styles !== "object" || styles === null) {
          throw new TypeError("css() requires an object of styles");
        }
        Object.entries(styles).forEach(([property, value]) => {
          this.forEach((el) => {
            el.style[property] = value;
          });
        });
        return this;
      }
    }
  };
  var $ = new Proxy(function(selectorOrElements, contextSelector) {
    let elements = toElementArray(selectorOrElements);
    if (arguments.length === 2) {
      if (typeof contextSelector !== "string") {
        throw new TypeError("Context selector must be a string");
      }
      elements = elements.flatMap((el) => {
        var _a;
        return [
          ...((_a = el.matches) == null ? void 0 : _a.call(el, contextSelector)) ? [el] : [],
          ...Array.from(el.querySelectorAll(contextSelector))
        ];
      });
    }
    return createElementProxy(elements);
  }, {
    get(target, prop) {
      if (prop === "use") {
        return function(plugin) {
          if (!plugin || typeof plugin !== "object") {
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
      if (prop === Symbol.iterator) return void 0;
      if (prop in target) return target[prop];
      const elements = Array.from(document.querySelectorAll(`[${prop}], .${prop}`));
      return createElementProxy(elements);
    }
  });
  $.use(defaultPlugins);
  var dollar_default = $;
  return __toCommonJS(dollar_exports);
})();
window.$ = $.default;
