import { DESIGN_TYPE } from './constants';

export interface ModuleOptions {
    /**
     * Create a reusable module
     * @default false
     */
    reusable?: boolean;
}

const MODULE_KEYS = Symbol();

export function Module(options?: ModuleOptions) {
    return function (target: any, name: string) {
        const modules = Reflect.getMetadata(MODULE_KEYS, target) || [];
        const propertyType = Reflect.getMetadata(DESIGN_TYPE, target, name);
        modules.push({ name, type: propertyType, options });
        Reflect.defineMetadata(MODULE_KEYS, modules, target);
    }
}

Module.hasModule = function (target: any) {
    return Reflect.hasMetadata(MODULE_KEYS, target);
}

Module.getModules = function (target: any): Array<{ name: string, type: any, options?: ModuleOptions }> {
    return Reflect.getMetadata(MODULE_KEYS, target);
}