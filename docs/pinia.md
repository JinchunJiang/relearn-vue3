# pinia

对比 Vuex 3.x/4.x
Vuex 3.x 只适配 Vue 2，而 Vuex 4.x 是适配 Vue 3 的。

Pinia API 与 Vuex(<=4) 也有很多不同，即：

- mutation 已被弃用。它们经常被认为是极其冗余的。它们初衷是带来 devtools 的集成方案，但这已不再是一个问题了。
- 更好的 TS 支持
- 自动补全更友好
- 无需要动态添加 Store，它们默认都是动态的，甚至你可能都不会注意到这点。注意，你仍然可以在任何时候手动使用一个 Store 来注册它，但因为它是自动的，所以你不需要担心它。
- 不再有嵌套结构的模块。你仍然可以通过导入和使用另一个 Store 来隐含地嵌套 stores 空间。虽然 Pinia 从设计上提供的是一个扁平的结构，但仍然能够在 Store 之间进行交叉组合。你甚至可以让 Stores 有循环依赖关系。
- 不再有可命名的模块。考虑到 Store 的扁平架构，Store 的命名取决于它们的定义方式，你甚至可以说所有 Store 都应该命名。

## 开始

```js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount('#app');
```

Store 只有三个概念：state、getter、action。可以假设这些概念相当于 vue 组件的 data、computed 和 methods。

## 核心概念

### 定义 Store

```js
import { defineStore } from 'pinia';

// 约定俗成：difineStore返回值命名格式 => useXxxStore
// 第一个参数是你的应用中 Store 的唯一 ID。
// 第二个参数接收setup函数或option对象
export const useAlertsStore = defineStore('alerts', {
  // 其他配置...
});
```

- Option Store

  ```js
  export const useCounterStore = defineStore('counter', {
    state: () => ({ count: 0 }),
    getters: {
      double: state => state.count * 2,
    },
    actions: {
      increment() {
        this.count++;
      },
    },
  });
  ```

- Setup Store

  ```js
  export const useCounterStore = defineStore('counter', () => {
    const count = ref(0);
    function increment() {
      count.value++;
    }

    return { count, increment };
  });
  ```

  在 Setup Store 中：

  - ref() 就是 state 属性
  - computed() 就是 getters
  - function() 就是 actions

  **注意，stores 是一个用 reactive 包装的对象。在使用时，从 store 中解构 state 同样会失去响应式，和 setup 中对 props 进行解构一样。**

  ```js
  const store = useCounterStore();
  // 丢失响应式
  // const { count } = store;
  // 为了保持响应式需要这样写
  const { count } = storeToRefs(store);
  ```

### State

```js
import { defineStore } from 'pinia';

const useStore = defineStore('storeId', {
  // 为了完整类型推理，推荐使用箭头函数
  // 在vue2中，想让其是响应式的，需要预定义好，或者调用Vue.set，和vue中一致
  state: () => {
    return {
      // 所有这些属性都将自动推断出它们的类型
      count: 0,
      name: 'Eduardo',
      isAdmin: true,
      items: [],
      hasChanged: true,
    };
  },
});
```

### 访问 state

```js
const store = useStore();
store.count++;
```

### 重置 state

```js
const store = useStore();
store.$reset(); // 重置到初始值
```

### 变更 state

1. 直接`state.count++`
2. 通过 store.$patch 一个 state 的补丁对象在同一时间修改多个属性

   ```js
   store.$dispatch({
     count: store.count + 1,
     age: 120,
   });
   ```

3. 通过 store.$patch 一个函数来对 state 进行修改
   ```js
   store.$patch(state => {
     state.items.push({ name: 'shoes', quantity: 1 });
     state.hasChanged = true;
   });
   ```

### 替换 state

你不能完全替换掉 store 的 state，因为那样会破坏其响应性。但是，你可以 patch 它。

```js
// 这实际上并没有替换`$state`
store.$state = { count: 24 };
// 在它内部调用 `$patch()`：
store.$patch({ count: 24 });
```

通过过变更 pinia 实例的 state 来设置整个应用的初始 state

```js
pinia.state.value = {};
```

### 订阅 state

通过 store 的 $subscribe() 方法侦听 state 及其变化。比起普通的 watch()，使用 $subscribe() 的好处是 subscriptions 在 patch 后只触发一次 (例如，当使用上面的函数版本时)。

```js
cartStore.$subscribe((mutation, state) => {
  // import { MutationType } from 'pinia'
  mutation.type; // 'direct' | 'patch object' | 'patch function'
  // 和 cartStore.$id 一样
  mutation.storeId; // 'cart'
  // 只有 mutation.type === 'patch object'的情况下才可用
  mutation.payload; // 传递给 cartStore.$patch() 的补丁对象。

  // 每当状态发生变化时，将整个 state 持久化到本地存储。
  localStorage.setItem('cart', JSON.stringify(state));
});
```

默认情况下，state subscription 会被绑定到添加它们的组件上 (如果 store 在组件的 setup() 里面)。这意味着，当该组件被卸载时，它们将被自动删除。如果你想在组件卸载后依旧保留它们，请将 { detached: true } 作为第二个参数，以将 state subscription 从当前组件中分离：

```js
<script setup>
  const someStore = useSomeStore()
  // 此订阅器即便在组件卸载之后仍会被保留
  someStore.$subscribe(callback, { detached: true })
</script>
```

> 在 pinia 实例上使用 watch()函数监听整个 state

```js
watch(
  pinia.state,
  state => {
    // 每当状态发生变化时，将整个 state 持久化到本地存储。
    localStorage.setItem('piniaState', JSON.stringify(state));
  },
  { deep: true }
);
```

## Getter

**getter 类似 computed**

```js
export const useStore = defineStore('main', {
  state: () => ({
    count: 0,
  }),
  getters: {
    // ts中会进行类型推断
    doubleCount: state => state.count * 2,
    // 用普通函数(而非箭头函数)定义的getter种，用this访问整个store实例，从而访问其他getter
    // ts中必须明确标准返回值的类型
    doublePlusOne() {
      return this.doubleCount + 1;
    },
  },
});
```

使用 getter

- 使用 setup

```js
setup() {
  const store = useStore();
  store.doubleCount; // 0
}
```

- 不适用 setup()

```js
import { mapState } from 'pinia';
import { useCounterStore } from '../stores/counter';

export default {
  computed: {
    // 允许在组件中访问 this.doubleCount
    // 与从 store.doubleCount 中读取的相同
    ...mapState(useCounterStore, ['doubleCount']),
    // 与上述相同，但将其注册为 this.myOwnName
    ...mapState(useCounterStore, {
      myOwnName: 'doubleCount',
      // 你也可以写一个函数来获得对 store 的访问权
      double: store => store.doubleCount,
    }),
  },
};
```

## Action

**Action 相当于组件的 methods**
actions 可以是同步也可以是异步的
】
定义

```js
// 示例文件路径：
// ./src/stores/counter.js

import { defineStore } from 'pinia';

const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

使用时，

- setup

  ```js
  setup() {
    const counterStore = useCounterStore()
    counterStore.increment()
  }
  ```

- 不在 setup 中
  ```js
  export default {
    methods: {
      // 访问组件内的 this.increment()
      // 与从 store.increment() 调用相同
      ...mapActions(useCounterStore, ['increment'])
      // 与上述相同，但将其注册为this.myOwnName()
      ...mapActions(useCounterStore, { myOwnName: 'increment' }),
    },
  }
  ```

### 订阅 action

你可以通过 store.$onAction() 来监听 action 和它们的结果。
传递给它的回调函数会在 action 本身之前执行。
after 表示在 promise 解决之后，允许你在 action 解决后执行一个回调函数。
onError 允许你在 action 抛出错误或 reject 时执行一个回调函数。

```js
const unsubscribe = someStore.$onAction(
  ({
    name, // action 名称
    store, // store 实例，类似 `someStore`
    args, // 传递给 action 的参数数组
    after, // 在 action 返回或解决后的钩子
    onError, // action 抛出或拒绝的钩子
  }) => {
    // 为这个特定的 action 调用提供一个共享变量
    const startTime = Date.now();
    // 这将在执行 "store "的 action 之前触发。
    console.log(`Start "${name}" with params [${args.join(', ')}].`);

    // 这将在 action 成功并完全运行后触发。
    // 它等待着任何返回的 promise
    after(result => {
      console.log(
        `Finished "${name}" after ${
          Date.now() - startTime
        }ms.\nResult: ${result}.`
      );
    });

    // 如果 action 抛出或返回一个拒绝的 promise，这将触发
    onError(error => {
      console.warn(
        `Failed "${name}" after ${Date.now() - startTime}ms.\nError: ${error}.`
      );
    });
  }
);

// 手动删除监听器
unsubscribe();
```

默认情况下，action 订阅器会被绑定到添加它们的组件上(如果 store 在组件的 setup() 内)。这意味着，当该组件被卸载时，它们将被自动删除。
如果你想在组件卸载后依旧保留它们，请将 true 作为第二个参数传递给 action 订阅器，以便将其从当前组件中分离：

```js
<script setup>
  const someStore = useSomeStore() // 此订阅器即便在组件卸载之后仍会被保留
  someStore.$onAction(callback, true)
</script>
```

## 插件

以下是支持扩展的内容:

- 为 store 添加新的属性
- 定义 store 时增加新的选项
- 为 store 增加新的方法
- 包装现有的方法
- 改变甚至取消 action
- 实现副作用，如本地存储
- 仅应用插件于特定 store

插件通过 pinia.use()来添加到 pinia 实例的。
最简单的例子：返回一个对象来为 pinia 实例的所有 store 添加一个静态属性

```js
import { createPinia } from 'pinia';
function SecretPiniaPlugin() {
  return { secret: 'the cake is a lie' };
}
const pinia = createPinia();
pinia.use(SecretPiniaPlugin);

// 在另一个文件中
const store = useStore();
store.secret; // 'the cake is a lie'
```

### 简介

```js
export function myPiniaPlugin(context) {
  context.pinia; // 用 `createPinia()` 创建的 pinia。
  context.app; // 用 `createApp()` 创建的当前应用(仅 Vue 3)。
  context.store; // 该插件想扩展的 store
  context.options; // 定义传给 `defineStore()` 的 store 的可选对象。
  // ...
}
```

### 添加新的外部属性

当添加外部属性、第三方库的类实例或非响应式的简单值时，你应该先用 markRaw() 来包装一下它，再将它传给 pinia。下面是一个在每个 store 中添加路由器的例子：

```js
import { markRaw } from 'vue';
// 根据你的路由器的位置来调整
import { router } from './router';

pinia.use(({ store }) => {
  store.router = markRaw(router);
});
```

### 添加新的选项

例如，你可以创建一个 debounce 选项，允许你让任何 action 实现防抖。

```js
defineStore('search', {
  actions: {
    searchContacts() {
      // ...
    },
  },

  // 这将在后面被一个插件读取
  debounce: {
    // 让 action searchContacts 防抖 300ms
    searchContacts: 300,
  },
});

// 使用任意防抖库
import debounce from 'lodash/debounce';

pinia.use(({ options, store }) => {
  if (options.debounce) {
    // 我们正在用新的 action 来覆盖这些 action
    return Object.keys(options.debounce).reduce((debouncedActions, action) => {
      debouncedActions[action] = debounce(
        store[action],
        options.debounce[action]
      );
      return debouncedActions;
    }, {});
  }
});
```

**注意：使用 setup 语法时，选项作为第三个参数传递**

```js
defineStore(
  'search',
  () => {
    // ...
  },
  {
    // 这将在后面被一个插件读取
    debounce: {
      // 让 action searchContacts 防抖 300ms
      searchContacts: 300,
    },
  }
);
```
