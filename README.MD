# vuex-decorator-lite
A vuex proxy used with class

# Demo
```ts
import { Module, VuexModel } from 'vuex-decorator-lite';
import Vuex from 'vuex';

class StoreModel {
    // state(must initialized or set 'useDefineForClassFields' to true in tsconfig.json)
    firstName: string = 'Zhang';
    lastName: string = 'San';
    // getter
    get fullName() {
        return `${this.lastName} ${this.firstName}`;
    }
    // mutation 
    set fullName(value: string) {
        const [last, first] = value;
        this.firstName = first;
        this.lastName = last;
    }
    // action
    intro() {
        console.log(`this is ${this.fullName}`);
    }

    // module
    // register modules automatically
    @Module({ reusable: true })
    module1!: Module1;
}

class Module1 {
    // root instance
    $root!: StoreModel;

    moduleState = 123;
    get moduleGetter() {
        //get global members by this.$root
        return this.$root.fullName + this.moduleState;
    }
    moduleAction(value: string) {
        //get global members by this.$root
        this.$root.intro();
        this.$root.fullName = value;
        console.log('hello', value);
    }
};

class Module2 { };

const model = new VuexModel(StoreModel);
// register module manually
model.regishterModule({ module2: Module2 }, { reusable: true });
const store = model.createStore({ strict: true });
// add model(class instance) to vue prototype
Vue.use(model, { name: 'model' });
Vue.use(Vuex);
const app = new Vue({ store, other: {} })
//------------------------------------------------------
//used in view
import { Component, Vue } from ' vue-class-component'
import { StoreModel } from '../store'

@Component()
export default class extends Vue {

    store!: StoreModel;

    get firstName() {
        // return this.$store.state.firstName
        return this.store.firstName;
    }
    get fullName() {
        // return this.$store.getter.fullName
        return this.store.fullName;
    }
    setName(value: string) {
        // this.$store.commit('fullName', vlaue);
        this.store.fullName = value;
    }
    intro() {
        // this.$store.dispatch('intro')
        this.store.intro();
    }
}
```