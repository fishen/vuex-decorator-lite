import { DESIGN_TYPE } from './constants';
import { Newable } from './type';

export interface ModuleOptions {
    /**
     * Create a reusable module
     * @default false
     */
    reusable?: boolean;
    /**
     * Module type, if the emitDecoratorMetadata option is enabled, then it is optional
     */
    type?: Newable;
}

const MODULE_KEYS = Symbol();

export function Module(options?: ModuleOptions) {
    return function (target: any, name: string) {
        const modules = Reflect.getMetadata(MODULE_KEYS, target) || [];
        const propertyType = Reflect.getMetadata(DESIGN_TYPE, target, name);
        console.log(propertyType);
        modules.push({ name, type: propertyType, options });
        Reflect.defineMetadata(MODULE_KEYS, modules, target);
    }
}

Module.hasModule = function (target: any) {
    return Reflect.hasMetadata(MODULE_KEYS, target);
}

Module.getModules = function (target: any): { name: string, type: any, options?: ModuleOptions }[] {
    return Reflect.getMetadata(MODULE_KEYS, target);
}