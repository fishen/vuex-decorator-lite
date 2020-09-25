import { Store as S, Module as M } from 'vuex'
import { Module, StoreOptions } from './module';

function getState(store: S<any>, module: string[]) {
    let state = store.state;
    for (let index = 0; module && index < module.length; index++) {
        const element = module[index];
        state = state[element];
        if (state === undefined) return;
    }
    return state;
}

const STORE_KEY = Symbol();

export function Store(options?: Omit<StoreOptions, 'module'>): any {
    return function (ctor: (new () => any)) {
        (ctor as any)[STORE_KEY] = { options };
    }
}

Store.createStore = function (instance: { $store: S<any>, $root: any } & Record<string, any>, name: string[] = [], namespaced: boolean = false) {
    const prototype = Object.getPrototypeOf(instance);
    const { options } = prototype.constructor[STORE_KEY];
    const opts = Object.assign({}, options) as StoreOptions;
    const store: M<any, any> = { namespaced, mutations: {}, getters: {}, actions: {}, modules: {} };
    //compute state
    const state = store.state = Object.keys(instance).reduce((result, key) => {
        result[key] = instance[key];
        Object.defineProperty(instance, key, {
            get: () => getState(instance.$store, name)[key],
            set: (value) => getState(instance.$store, name)[key] = value
        })
        return result;
    }, {} as Record<string, any>);
    opts.reusable && (store.state = () => state);
    //compute mutations(setters) getters and actions(methods)
    Object.getOwnPropertyNames(prototype).reduce((result, key) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        if (key === 'constructor' || !descriptor) return result;
        const methods = ['get', 'set', 'value'] as const;
        methods.filter(method => descriptor.configurable && typeof descriptor[method] === 'function').forEach((method) => {
            const original = descriptor[method];
            const path = namespaced ? [...name, key].join('/') : key;
            if (method === 'set') {
                descriptor.set = v => instance.$store.commit(path, v);
                result.mutations![key] = (state, value) => original.call(state, value);
            }
            if (method === 'get') {
                result.getters![key] = original.bind(instance);
                descriptor.get = () => instance.$store.getters[path];
            }
            if (method === 'value') {
                descriptor.value = (payload: any) => instance.$store.dispatch(path, payload);
                result.actions![key] = (_context, payload) => original.call(instance, payload);
            }
        })
        Object.defineProperty(prototype, key, descriptor);
        return result;
    }, store);
    //compute modules
    if (Module.hasModule(prototype)) {
        Module.getModules(prototype).forEach(module => {
            const childInstance = Store.construct(module.type);
            Object.defineProperty(prototype, module.name, { get: () => childInstance });
            Object.defineProperty(childInstance, '$root', { get: () => instance.$root || instance });
            Object.defineProperty(childInstance, '$store', { get: () => instance.$store });
            store.modules![module.name] = Store.createStore(childInstance, [...name, module.name], true);
        })
    }
    return store;
}

Store.construct = function <C extends new (...args: any) => any>(cls: C) {
    if (typeof cls !== 'function' || !(STORE_KEY in cls)) throw new Error('Invalid store class, did you forget to add a `Store` decorator?');
    return new cls();
}