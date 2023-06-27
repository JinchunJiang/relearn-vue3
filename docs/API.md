# 记录 vue3 的 API

## 应用实例 API

- createApp()
  创建一个应用实例

  ```js
  function createApp(rootComponent: Component, rootProps?: object): App
  ```

- createSSRApp()
  以 SSR 激活模式创建一个应用实例。用法与 createApp() 完全相同。

- app.mount()
  将应用实例挂载在一个容器元素中。

- app.unmount()
  卸载一个已挂载的应用实例。卸载一个应用会触发该应用组件树内所有组件的卸载生命周期钩子。

- app.component()

- app.directive()

- app.use()

- app.provide()

- app.runWithContext()
  3.3+新增
  使用当前应用作为注入上下文执行回调函数。

  ```js
  import { inject } from 'vue';
  app.provide('id', 1);
  const injected = app.runWithContext(() => {
    return inject('id');
  });
  console.log(injected); // 1
  ```

- app.version

- app.config

  - app.config.errorHandler

    ```js
    app.config.errorHandler = (err, instance, info) => {
      // 处理错误，例如：报告给一个服务
    };
    ```

  - app.config.globalProperties
    ```js
    app.config.globalProperties.msg = 'hello';
    ```

## 通用

- version

- nextTick

- defineComponent()
  在定义 Vue 组件时提供类型推导的辅助函数。

- defineAsyncComponent()
  定义一个异步组件，它在运行时是懒加载的。

- defineCustomElement()
  这个方法和 defineComponent 接受的参数相同，不同的是会返回一个原生自定义元素类的构造器。
  ```js
  import { defineCustomElement } from 'vue';
  const MyVueElement = defineCustomElement({
    /* 组件选项 */
  });
  // 注册自定义元素
  customElements.define('my-vue-element', MyVueElement);
  ```
