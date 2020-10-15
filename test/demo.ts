import { Module, VuexModel } from '../src/index';
import Vue from 'vue';
import Vuex from 'vuex';

class Address {
    // root instance
    $root!: StoreModel;

    city = "BeiJing";
    street = "SomeStreet";
    zipCode = "10086";

    info() {
        // access global members by this.$root
        console.log(`${this.$root.fullName}-${this.city}`);
    }
};

class Position {
    latitude = 0;
    longtitude = 0;
    set value(option: { latitude: number, longtitude: number }) {
        this.latitude = option.latitude;
        this.longtitude = option.longtitude;
    }
};

class StoreModel {
    // state(must initialized or set 'useDefineForClassFields' to true in tsconfig.json)
    firstName: string = 'San';
    lastName: string = 'Zhang';
    // getter
    get fullName() {
        return `${this.lastName} ${this.firstName}`;
    }
    // mutation 
    set fullName(value: string) {
        const [last, first] = value.split(' ');
        this.firstName = first;
        this.lastName = last;
    }
    // action
    intro() {
        console.log(`My name is ${this.fullName}`);
    }

    // module
    // register modules automatically
    @Module({ reusable: true, type: Address })
    address!: Address;
    position!: Position;
}


const model = new VuexModel(StoreModel);
//register module manually in javascript
model.regishterModule({ position: Position });
Vue.use(Vuex);
const store = model.createStore({ strict: true });
// add model(class instance) to vue prototype
Vue.use(model, { name: 'model' });
// const app = new Vue({ store })

//original vuex
console.log(store.state.firstName, store.state.lastName);// San Zhang
console.log(store.getters.fullName);// Zhang San
console.log(store.dispatch('intro'));// My name is Zhang San
store.commit('fullName', 'Si Lee');
console.log(store.dispatch('intro'));// My name is Si Lee
console.log(store.dispatch('address/info'));// Si Lee-BeiJing
store.commit('position/value', { latitude: 56, longtitude: 138 });
console.log(store.state.position.latitude, store.state.position.longtitude);// 56 138

//model instance
const { fullName, address, position } = model.instance;
console.log(fullName);// Si Lee
console.log(address.street);// SomeStreet
address.info();// Si Lee-BeiJing
console.log(position.latitude);// 56
model.instance.fullName = "Wu Wang";
console.log(store.getters.fullName);// Wu Wang
console.log(model.instance.fullName === store.getters.fullName);// true
position.value = { latitude: 60, longtitude: 140 };
console.log(store.state.position.latitude, store.state.position.longtitude);// 60 140



//------------------------------------------------------
//used in view

import Component from 'vue-class-component'

@Component
export default class extends Vue {

    model!: StoreModel;

    get firstName() {
        // return this.$store.state.firstName
        return this.model.firstName;
    }
    get fullName() {
        // return this.$store.getter.fullName
        return this.model.fullName;
    }
    setName(value: string) {
        // this.$store.commit('fullName', vlaue);
        this.model.fullName = value;
    }
    intro() {
        // this.$store.dispatch('intro')
        this.model.intro();
    }
}