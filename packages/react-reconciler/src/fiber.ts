import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags, Placement } from './fiberFlags';
import { Container } from 'hostConfig'

export class FiberNode {
	tag: WorkTag;
	key: Key;
	stateNode: any;
	type: any;
	ref: Ref;

	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	pendingProps: Props;
	memoizedProps: Props | null;
	memoizedState: any;
	updateQueue: unknown;

  deletions: FiberNode[] | null; // 需要删除的子fiber节点

	alternate: FiberNode | null; // 交替,代替者

	flags: Flags;
	subtreeFlags: Flags;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag;
		this.key = key;
		// HostComponent div Dom
		// FunctionComponent () => {}
		this.stateNode = null;
		this.type = null;

		/* 节点之间的关系属性,构成树级结构 */
		// 父级节点
		this.return = null;
		// 同级右侧的兄弟节点
		this.sibling = null;
		this.child = null;
		// 同级节点的位置数
		this.index = 0;

		this.ref = null;

		/** 作为工作单元 */
		// 工作单元开始工作的状态
		this.pendingProps = pendingProps;
		// 工作执行完确定下来的memoizedProps
		this.memoizedProps = null;
		this.memoizedState = null;
		//
		this.updateQueue = null;

		// 交替单元,如果当前的FiberNode是current,那么alternate指向workProgress,如果当前FiberNode是workProgress,那么alternate指向current
		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
		// 子树是否有副作用,在completeWork流程中，如果子树有副作用，冒泡到父级节点，方便查找副作用
		this.subtreeFlags = NoFlags;
    // 子树是否有需要删除的Fiber节点
    this.deletions = null
	}
}

/***
 *
 *     * * * * * * * * *                 * * * * * * * * *               * * * * * * * * *
 *     *               *   ---current--> *               *   ---child--> *               *
 *     * FiberRootNode *                 * hostRootFiber *               *      APP      *
 *     *               *   <-stateNode-- *               *   <--return-- *               *
 *     * * * * * * * * *                 * * * * * * * * *               * * * * * * * * *
 *
 */
/**
 * ReactDom.createRoot(rootElement).render(<App />)
 * rootElement对应的fiberNode为hostRootFiber
 * fiberRootNode的current --> hostRootFiber
 */
export class FiberRootNode {
	// 挂载节点rootElement
	container: Container;
	// 指向hostRootFiber
	current: FiberNode;
	// 这个更新流程(递归结束)的hostRootFiber保存在finishedWork中
	finishedWork: FiberNode | null;

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		this.finishedWork = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props,
): FiberNode => {
	let wip = current.alternate;
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
    wip.deletions = null
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;

	return wip;
};

/**
 * ReactElement 转化为 FiberNode
 * @param element
 * @returns
 */
export function createFiberFromElement(element: ReactElementType) {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		// div type: 'div'
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}

	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
