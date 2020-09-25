import { DESIGN_TYPE } from './constants';
import { ModuleOptions } from 'vuex';

export interface StoreOptions extends ModuleOptions {
    /**
     * Create a reusable module
     * @default false
     */
    reusable?: boolean;
}

const MODULE_KEYS = Symbol();

export function Module(type?: Function) {
    return function (target: any, name: string) {
        const modules = Reflect.getMetadata(MODULE_KEYS, target) || [];
        const propertyType = type || Reflect.getMetadata(DESIGN_TYPE, target, name);
        modules.push({ name, type: propertyType });
        Reflect.defineMetadata(MODULE_KEYS, modules, target);
    }
}

Module.hasModule = function (target: any) {
    return Reflect.hasMetadata(MODULE_KEYS, target);
}

Module.getModules = function (target: any): Array<{ name: string, type: any }> {
    return Reflect.getMetadata(MODULE_KEYS, target);
}