import { Store as S, Module as M } from 'vuex'
import { Module, ModuleOptions } from './module';
import { Newable } from './type';

function getState(store: S<any>, module: string[]) {
    let state = store.state;
    for (let index = 0; module && index < module.length; index++) {
        const element = module[index];
        state = state[element];
        if (state === undefined) return;
    }
    return state;
}

export class Store {
    static createStore(instance: { $store: S<any>, $root: any } & Record<string, any>, name: string[] = [], namespaced = false, reusable = false) {
        const prototype = Object.getPrototypeOf(instance);
        const store: M<any, any> = { namespaced, mutations: {}, getters: {}, actions: {}, modules: {} };
        // compute state
        const state = store.state = Object.keys(instance).reduce((result, key) => {
            result[key] = instance[key];
            Object.defineProperty(instance, key, {
                get: () => getState(instance.$store, name)[key],
                set: (value) => getState(instance.$store, name)[key] = value
            })
            return result;
        }, {} as Record<string, any>);
        // compute mutations(setters) getters and actions(methods)
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
        reusable && (store.state = () => state);
        // compute modules
        if (Module.hasModule(prototype)) {
            Module.getModules(prototype).forEach(module => {
                Store.registerModule(module.name, module.type, instance, store, module.options);
            })
        }
        return store;
    }

    static registerModule(name: string, type: Newable, parent: any, store: M<any, any>, options?: ModuleOptions) {
        const prototype = Object.getPrototypeOf(parent);
        const childInstance = Store.construct(type);
        Object.defineProperty(prototype, name, { get: () => childInstance });
        Object.defineProperty(childInstance, '$root', { get: () => parent.$root || parent });
        Object.defineProperty(childInstance, '$store', { get: () => parent.$store });
        const reusable = options?.reusable;
        const module = Store.createStore(childInstance, [name], true, reusable);
        store.modules![name] = module;
    }

    static construct(cls: Newable) {
        return new cls();
    }
}

