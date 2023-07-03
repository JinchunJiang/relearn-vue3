# vuex

这里记录 vuex4.x(与 vue3.x 匹配)和 vuex3.x 在用法上的一些差异

注册 store

```js
// store/index.js
import { createStore } from 'vuex';
const store = createStore({
  // ...
});

export default store;

// main.js
import { createApp } from 'vue';
import store from './store/index';
const app = createApp(/* ... */);
app.use(store);
```

## 组合式 API

在 vue 组件的 setup 函数中使用 store，要使用 useStore

```js
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore(); // 等同于option api中的this.$store
  },
};
```
