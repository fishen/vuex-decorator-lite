(function(e, a) { for(var i in a) e[i] = a[i]; if(a.__esModule) Object.defineProperty(e, "__esModule", { value: true }); }(exports,
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 601:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DESIGN_RETURN_TYPE = exports.DESIGN_TYPE = exports.DESIGN_PARAM_TYPES = void 0;
exports.DESIGN_PARAM_TYPES = "design:paramtypes";
exports.DESIGN_TYPE = "design:type";
exports.DESIGN_RETURN_TYPE = "design:returntype";


/***/ }),

/***/ 607:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Module = exports.VuexModel = void 0;
__webpack_require__(906);
var model_1 = __webpack_require__(134);
Object.defineProperty(exports, "VuexModel", ({ enumerable: true, get: function () { return model_1.VuexModel; } }));
var module_1 = __webpack_require__(656);
Object.defineProperty(exports, "Module", ({ enumerable: true, get: function () { return module_1.Module; } }));


/***/ }),

/***/ 134:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VuexModel = void 0;
var store_1 = __webpack_require__(923);
var vuex_1 = __importDefault(__webpack_require__(53));
var VuexModel = /** @class */ (function () {
    function VuexModel(type, options) {
        this.instance = store_1.Store.construct(type);
        this.module = store_1.Store.createStore(this.instance, [], false, options === null || options === void 0 ? void 0 : options.reusable);
    }
    VuexModel.prototype.install = function (vue, options) {
        var _this = this;
        var name = Object.assign({ name: 'store' }, options).name;
        Object.defineProperty(vue.prototype, name, { get: function () { return _this.instance; } });
    };
    VuexModel.prototype.createStore = function (options) {
        var module = Object.assign({}, this.module);
        var value = new vuex_1.default.Store(Object.assign({}, options, module));
        Object.defineProperty(this.instance, '$store', { value: value });
        return value;
    };
    VuexModel.prototype.regishterModule = function (module, options) {
        var _this = this;
        Object.keys(module).forEach(function (key) {
            store_1.Store.registerModule(key, module[key], _this.instance, _this.module, options);
        });
    };
    return VuexModel;
}());
exports.VuexModel = VuexModel;


/***/ }),

/***/ 656:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Module = void 0;
var constants_1 = __webpack_require__(601);
var MODULE_KEYS = Symbol();
function Module(options) {
    return function (target, name) {
        var modules = Reflect.getMetadata(MODULE_KEYS, target) || [];
        var propertyType = Reflect.getMetadata(constants_1.DESIGN_TYPE, target, name);
        console.log(propertyType);
        modules.push({ name: name, type: propertyType, options: options });
        Reflect.defineMetadata(MODULE_KEYS, modules, target);
    };
}
exports.Module = Module;
Module.hasModule = function (target) {
    return Reflect.hasMetadata(MODULE_KEYS, target);
};
Module.getModules = function (target) {
    return Reflect.getMetadata(MODULE_KEYS, target);
};


/***/ }),

/***/ 923:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Store = void 0;
var module_1 = __webpack_require__(656);
function getState(store, module) {
    var state = store.state;
    for (var index = 0; module && index < module.length; index++) {
        var element = module[index];
        state = state[element];
        if (state === undefined)
            return;
    }
    return state;
}
var Store = /** @class */ (function () {
    function Store() {
    }
    Store.createStore = function (instance, name, namespaced, reusable) {
        if (name === void 0) { name = []; }
        if (namespaced === void 0) { namespaced = false; }
        if (reusable === void 0) { reusable = false; }
        var prototype = Object.getPrototypeOf(instance);
        var store = { namespaced: namespaced, mutations: {}, getters: {}, actions: {}, modules: {} };
        // compute state
        var state = store.state = Object.keys(instance).reduce(function (result, key) {
            result[key] = instance[key];
            Object.defineProperty(instance, key, {
                get: function () { return getState(instance.$store, name)[key]; },
                set: function (value) { return getState(instance.$store, name)[key] = value; }
            });
            return result;
        }, {});
        // compute mutations(setters) getters and actions(methods)
        Object.getOwnPropertyNames(prototype).reduce(function (result, key) {
            var descriptor = Object.getOwnPropertyDescriptor(prototype, key);
            if (key === 'constructor' || !descriptor)
                return result;
            var methods = ['get', 'set', 'value'];
            methods.filter(function (method) { return descriptor.configurable && typeof descriptor[method] === 'function'; }).forEach(function (method) {
                var original = descriptor[method];
                var path = namespaced ? __spread(name, [key]).join('/') : key;
                if (method === 'set') {
                    descriptor.set = function (v) { return instance.$store.commit(path, v); };
                    result.mutations[key] = function (s, value) { return original.call(s, value); };
                }
                if (method === 'get') {
                    result.getters[key] = original.bind(instance);
                    descriptor.get = function () { return instance.$store.getters[path]; };
                }
                if (method === 'value') {
                    descriptor.value = function (payload) { return instance.$store.dispatch(path, payload); };
                    result.actions[key] = function (_context, payload) { return original.call(instance, payload); };
                }
            });
            Object.defineProperty(prototype, key, descriptor);
            return result;
        }, store);
        reusable && (store.state = function () { return state; });
        // compute modules
        if (module_1.Module.hasModule(prototype)) {
            module_1.Module.getModules(prototype).forEach(function (module) {
                Store.registerModule(module.name, module.type, instance, store, module.options);
            });
        }
        return store;
    };
    Store.registerModule = function (name, type, parent, store, options) {
        var prototype = Object.getPrototypeOf(parent);
        var childInstance = Store.construct(type);
        Object.defineProperty(prototype, name, { get: function () { return childInstance; } });
        Object.defineProperty(childInstance, '$root', { get: function () { return parent.$root || parent; } });
        Object.defineProperty(childInstance, '$store', { get: function () { return parent.$store; } });
        var reusable = options === null || options === void 0 ? void 0 : options.reusable;
        var module = Store.createStore(childInstance, [name], true, reusable);
        store.modules[name] = module;
    };
    Store.construct = function (cls) {
        console.log(cls);
        return new cls();
    };
    return Store;
}());
exports.Store = Store;


/***/ }),

/***/ 906:
/***/ ((module) => {

module.exports = require("reflect-metadata");;

/***/ }),

/***/ 53:
/***/ ((module) => {

module.exports = require("vuex");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(607);
/******/ })()

));
//# sourceMappingURL=index.js.map