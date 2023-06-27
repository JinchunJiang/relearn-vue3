# 组合式 API

## setup()

## 响应式 API

### 核心

- ref()

- computed()

- reactive()

- readonly()
  返回一个只读代理

- watchEffect()

- watchPostEffect()
  watchEffect() 使用 flush: 'post' 选项时的别名。

- watchSyncEffect()
  watchEffect() 使用 flush: 'sync' 选项时的别名。

- watch()

### 工具函数

- isRef()
  检查某个值是否为 ref。

- unref()
  如果参数是 ref，则返回内部值，否则返回参数本身。
  这是 val = isRef(val) ? val.value : val 计算的一个语法糖。

- toRef()
  3.3+
  可以将值、refs 或 getters 规范化为 refs

- ​​toValue()
  3.3+
  将值、refs 或 getters 规范化为值。这与 unref() 类似，不同的是此函数也会规范化 getter 函数。如果参数是一个 getter，它将会被调用并且返回它的返回值。

- toRefs()

  ```js
  const state = reactive({
    foo: 1,
    bar: 2,
  });
  const stateAsRefs = toRefs(state);
  /*
  stateAsRefs 的类型：{
  foo: Ref<number>,
  bar: Ref<number>
  }
  */
  // 这个 ref 和源属性已经“链接上了”
  state.foo++;
  console.log(stateAsRefs.foo.value); // 2
  stateAsRefs.foo.value++;
  console.log(state.foo); // 3
  ```

- isProxy()
  检查一个对象是否是由 reactive()、readonly()、shallowReactive() 或 shallowReadonly() 创建的代理。

- isReactive()
  检查一个对象是否是由 reactive() 或 shallowReactive() 创建的代理。

- isReadonly()
  检查一个对象是否是由 readonly() 或 shallowReadonly() 创建的代理。

### 进阶

- shallowRef()
  ref() 的浅层作用形式。

- triggerRef()
  强制触发依赖于一个浅层 ref 的副作用，这通常在对浅引用的内部值进行深度变更后使用。

  ```js
  const shallow = shallowRef({
    greet: 'Hello, world',
  });
  // 触发该副作用第一次应该会打印 "Hello, world"
  watchEffect(() => {
    console.log(shallow.value.greet);
  });
  // 这次变更不应触发副作用，因为这个 ref 是浅层的
  shallow.value.greet = 'Hello, universe';
  // 打印 "Hello, universe"
  triggerRef(shallow);
  ```

- customRef()
  创建一个自定义的 ref，显式声明对其依赖追踪和更新触发的控制方式。

  ```js
  import { customRef } from 'vue';
  export function useDebouncedRef(value, delay = 200) {
    let timeout;
    return customRef((track, trigger) => {
      return {
        get() {
          track();
          return value;
        },
        set(newValue) {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            value = newValue;
            trigger();
          }, delay);
        },
      };
    });
  }
  ```

- shallowReactive()
  reactive() 的浅层作用形式。

- shallowReadonly()
  readonly() 的浅层作用形式

- toRaw()
  根据一个 Vue 创建的代理返回其原始对象。

- markRaw()
  将一个对象标记为不可被转为代理。返回该对象本身。

- effectScope()
  创建一个 effect 作用域，可以捕获其中所创建的响应式副作用 (即计算属性和侦听器)，这样捕获到的副作用可以一起处理。

  ```js
  const scope = effectScope();
  scope.run(() => {
    const doubled = computed(() => counter.value * 2);
    watch(doubled, () => console.log(doubled.value));
    watchEffect(() => console.log('Count: ', doubled.value));
  });
  // 处理掉当前作用域内的所有 effect
  scope.stop();
  ```

- getCurrentScope()
  如果有的话，返回当前活跃的 effect 作用域。

- onScopeDispose()
  在当前活跃的 effect 作用域上注册一个处理回调函数。当相关的 effect 作用域停止时会调用这个回调函数。

## 生命周期钩子

- onBeforeMount()

- onMounted()

- onBeforeUpdate()

- onUpdated()

- onBeforeUnmount()

- onUnmounted()

- onErrorCaptured()
  注册一个钩子，在捕获了后代组件传递的错误时调用。

- onActivated()

- onDeactivated()
