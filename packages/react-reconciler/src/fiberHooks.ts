import internals from 'shared/internals';
import { FiberNode } from './fiber';
import { Dispatch, Dispatcher } from 'react/src/currentDispatcher';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
  processUpdateQueue,
} from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

const { currentDispatcher } = internals;

/**
 * 当前在render的Fiber,当前函数组件在执行过程的记录
 *
 */
let currentlyRenderingFiber: FiberNode | null = null;

/**
 * 当进入function Component的beginWork的时候，处理hook链表中的每个hook，需要有个指针来记录当前的hook
 */
let workInProgressHook: Hook | null = null;

/**
 * update流程当前的Hook
 */
let currentHook: Hook | null = null;

/**
 *  * * * * * * * * * *
 *  * FC FiberNode    *
 *  * memoizedState ----->  * * * * * * * * * *    * * * * * * * * * *    * * * * * * * * * *
 *  * * * * * * * * * *     * useState        *    * useState        *    * useState        *
 *                          *.next   ------------> * .next   ------------>* .next   ---------->
 *                          * .memoizedState  *    * .memoizedState  *    * .memoizedState  *
 *                          * * * * * * * * * *    * * * * * * * * * *    * * * * * * * * * *
 */
interface Hook {
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}

export function renderWithHooks(wip: FiberNode) {
	// 赋值操作
	currentlyRenderingFiber = wip;

	// 重置，保存的是hooks链表,在mount流程的时候，是新创建；而update需要从
	wip.memoizedState = null;
	const current = wip.alternate;

	if (current !== null) {
		// update
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		// mount
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);

	// 重置操作
	currentlyRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null

	return children;
}

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState,
};

const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState,
};

function updateState<State>(
	initialState: (() => State) | State,
): [State, Dispatch<State>] {
	const hook = updateWorkInProgressHook();
  // 计算新的state的逻辑
  const queue = hook.updateQueue as UpdateQueue<State>
  const pending = queue.shared.pending

  if(pending !== null){
    const { memoizedState} = processUpdateQueue(hook.memoizedState,pending)
    hook.memoizedState = memoizedState
  }
	return [hook.memoizedState,queue.dispatch as Dispatch<State>];
}

function updateWorkInProgressHook(): Hook {
  // todo Render阶段触发的更新
  // function App(){
  //   const [num,setNum] = useState(0)
  //   // 触发更新
  //   setNum(100)
  //   return <div>{num}</div>
  // }
	let nextCurrentHook: Hook | null = null;
	if (currentHook === null) {
		// 这是这个FC update时第一个hook
		const current = currentlyRenderingFiber?.alternate;
		if (current !== null) {
			nextCurrentHook = current?.memoizedState;
		} else {
			// mount mount阶段current===null,是一些边界情况
			nextCurrentHook = null;
		}
	} else {
		// 这是FC update时后续的Hook
		nextCurrentHook = currentHook.next;
	}

	if (nextCurrentHook === null) {
		/**
		 * mount u1 u2 u3
		 * update u1 u2 u3 u4 --> 多一个hook
		 * 如果nextCurrentHook === null的情况，说明mount阶段和update阶段的hook数量一样
		 */
		throw new Error(
			`组件${currentlyRenderingFiber?.type}本次执行时的Hook比上次执行的多`,
		);
	}

	currentHook = nextCurrentHook as Hook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		updateQueue: currentHook.updateQueue,
		next: null,
	};

	if (workInProgressHook === null) {
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook');
		} else {
			workInProgressHook = newHook;
			currentlyRenderingFiber.memoizedProps = workInProgressHook;
		}
	} else {
		// mount时，后续的hook
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}
	return workInProgressHook;
}

function mountState<State>(
	initialState: (() => State) | State,
): [State, Dispatch<State>] {
	// 找到当前userState对应的hook数据
	const hook = mountWorkInProgressHook();
	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	hook.memoizedState = memoizedState;

	//@ts-ignore
	// toThink 函数的bind方法，代入参数，此时是没有执行，只是将对应的实时参数赋予
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
	queue.dispatch = dispatch;
	return [memoizedState, dispatch];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>,
) {
	// toThink 首屏渲染的更新流程
	// const update = createUpdate<ReactElementType | null>(element);
	// 	enqueueUpdate(
	// 		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
	// 		update,
	// 	);

	// 	scheduleUpdateOnFiber(hostRootFiber);
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null,
	};
	if (workInProgressHook === null) {
		// mount时，第一个hook
		if (currentlyRenderingFiber === null) {
			// 如果currentlyRenderingFiber等于null，则说明hook没有在function Component中使用，
			// 当执行mountWorkInProgressHook的时候，currentlyRenderingFiber是会指向现在正在render的FiberNode
			/**
			 * function App(){
			 *  useState(0)
			 * }
			 */
			throw new Error('请在函数组件内调用hook');
		} else {
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedProps = workInProgressHook;
		}
	} else {
		// mount时，后续的hook
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}
	return workInProgressHook;
}
