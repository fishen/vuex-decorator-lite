import { Store } from "./store";
import Vuex, { Plugin, Store as VStore } from 'vuex';

export interface VuexModelOptions<C extends { new(...args: any): any }, P = any> {
    model: C;
    plugins?: Plugin<P>[];
    strict?: boolean;
    devtools?: boolean;
}

export class VuexModel<C extends { new(...args: any): any }, S = any> {
    public instance: InstanceType<C>;
    public store: VStore<S>
    constructor(options: VuexModelOptions<C>) {
        this.instance = Store.construct(options.model);
        const items = Store.createStore(this.instance);
        delete (options as any).model;
        this.store = new Vuex.Store<S>(Object.assign({}, options, items))
        Object.defineProperty(this.instance, '$store', { get: () => this.store });
    }
    install(vue: { prototype: any }, options?: { name: string }) {
        const { name } = Object.assign({}, options, { name: 'store' });
        Object.defineProperty(vue.prototype, name, { get: () => this.instance });
    }
}