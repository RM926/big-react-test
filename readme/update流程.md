## 第十课 初探update流程

update流程和mount流程的区别

对于beginWork:

- 需要处理ChildDeletion的情况
- 需要处理节点移动的情况（abc->bca)

对于completeWork:

- 需要处理HostText内容更新的情况
- 需要处理HostComponent属性变化的情况

对于commitWork:

- 对于ChildDeletion,需要遍历被删除的子树

对于useState:

- 实现相对于mountState的updateState

### beginWork流程

本节课进处理单一节点，所以省去了`节点移动`的情况，我们需要处理：

- singleElement
- singleTextNode

处理流程为：

1. 比较是否可以复用current fiber

   a.比较key，如果key不同，不能复用

   b.比较type,如果type不同，不能复用

   c.如果key与type相同，则可复用

2. 不能复用，则创建新的（同mount流程），可以复用则复用旧的

注意：对于同一个fiberNode，即使反复更新，current、wip这两个fiberNode会重复利用

### completeWork流程

主要处理`标记Update`的情况，本节课我们处理HostText内容更新的情况

### commitWork流程

对于标记ChildDeletion的子树，由于子树中：

- 对于FC,需要处理useEffect unmount执行、解绑ref
- 对于HostComponent，需要解绑ref
- 对于子树的`根HostComponent`，需要移除DOM

### 对于useState

需要实现：

- 针对update时的dispatcher
- 实现对标mountWorkInProgressHook的updateWorkInProgressHook
- 实现updateState中`计算新state的逻辑`

其中updateWorkInProgressHook的实现需要考虑的问题：

- hook数据从哪来
- 交互阶段触发的更新

```jsx
<div onClick={() => updaet(1)}></div>
```

- render阶段触发的更新（todo）

```jsx
function App(){
    const [num,setNum] = useState(0)
    // 触发更新
    setNum(100)
    return <div>{num}</div>
}
```

