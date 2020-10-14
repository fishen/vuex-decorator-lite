import { Store } from "./store";
import Vuex, { Module, Plugin } from 'vuex';
import { Newable } from './type';
import { ModuleOptions } from './module';

export interface VuexModelOptions<P = any> {
    plugins?: Plugin<P>[];
    strict?: boolean;
    devtools?: boolean;
}

export class VuexModel<C extends Newable, S = any> {

    public readonly instance: InstanceType<C>;
    public readonly module: Module<S, any>

    constructor(model: Newable, options?: ModuleOptions) {
        this.instance = Store.construct(model);
        this.module = Store.createStore(this.instance, [], false, options?.reusable);
    }
    install(vue: { prototype: any }, options?: { name: string }) {
        const { name } = Object.assign({ name: 'store' }, options);
        Object.defineProperty(vue.prototype, name, { get: () => this.instance });
    }
    createStore(options?: VuexModelOptions) {
        const module = Object.assign({}, this.module);
        const value = new Vuex.Store<S>(Object.assign({}, options, module))
        Object.defineProperty(this.instance, '$store', { value });
        return value;
    }
    regishterModule(module: Record<string, Newable>, options?: ModuleOptions) {
        Object.keys(module).forEach(key => {
            Store.registerModule(key, module[key], this.instance, this.module, options);
        });
    }
}