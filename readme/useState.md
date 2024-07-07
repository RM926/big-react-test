# 第八课

hook脱离FC上下文，仅仅是普通函数，如何让它拥有感知上下文环境的能力？

比如说：

- hook如何知道在另一个hook的上下文环境内执行？

  ```javascript
  function App(){
      useEffect(() => {
          // 执行useState是怎么知道在useEffect的回调中
          useState(0)
      })
  }
  ```

- hook怎么知道当前是mount还是update？

  解决方案：在不同上下文中调用的hook不是同一个函数

实现`内部数据共享层`的注意事项

以浏览器举例，Reconciler + hostConfig = ReactDom

增加`内部数据共享层`，意味着Reconciler与React产生关联，进而意味着ReactDOM与React产生关联。

如果两个包产生关联，在打包时需要考虑：

两者的代码是打包在一起还是分开？

如果打包在一起，意味着打包后的ReactDOM中会包含React的代码，那么ReactDOM中会包含一个内部数据共享层，React中也会包含一个内部数据共享层，这两者不是同一个内部数据共享层。

而我们希望两者共享数据，所以不希望ReactDOM中包含React的代码

- hook如何知道自身数据保存在哪？

  ```javascript
  function App(){
      // 执行useState为什么能返回正确的值
      const [num] = useState(0)
  }
  ```

  答案：可以记录当前正在render的FC对应fiberNode，在fiberNode保存hook数据

## 实现Hooks的数据结构

fiberNode可用字段：

- memoizedState
- updateQueue

对于FC对应的fiberNode，存在两层数据

- fiberNode.memoizedState对应Hooks链表
- 链表中每个hook对应自身的数据

## 实现useState

包含2方面的工作：

1. 实现mount时useState的事项
2. 实现dispatch方法，并接入现有更新流程内