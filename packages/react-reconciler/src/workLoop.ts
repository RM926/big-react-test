import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';
/**
 * react内部有三个阶段
 * 1.schedule阶段
 * 2.render阶段(beginWork和completeWork)
 * 3.commit阶段(commitWork) ----> beforeMutation mutation layout
 */

/***
 *     * * * * * * * * *                 * * * * * * * * *               * * * * * * * * *
 *     *               *   ---current--> *               *   ---child--> *               *
 *     * FiberRootNode *                 * hostRootFiber *               *      APP      *
 *     *               *   <-stateNode-- *               *   <--return-- *               *
 *     * * * * * * * * *                 * * * * * * * * *               * * * * * * * * *
 */

// 全局当前执行的FiberNode
let workInProgress: FiberNode | null = null;

/**初始化首个执行的Fiber,即hostRootFiber*/
function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

// 调用主入口，挂载的初始化函数在fiberReconciler.ts
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// TODO 调度功能
	//fiberRootNode
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

/**
 * 传入fiber节点获取FiberRootNode
 * @param fiber
 * @returns
 */
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}

	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

// toThink 这里传入的root可以是最上层的节点，也可以是某个组件的节点？
function renderRoot(root: FiberRootNode) {
	// 初始化
	prepareFreshStack(root);
	do {
		try {
			workLoop();
			break;
		} catch (error) {
			if (__DEV__) {
				console.warn('workLoop发生错误');
			}
			workInProgress = null;
		}
	} while (true);

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	/** wip fiberNode 树，树中包含了flag标记 */
	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;
	if (finishedWork === null) {
		return;
	}

	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}

	// 重置操作
	root.finishedWork = null;

	// 判断是否存在3个子阶段需要执行的操作
	// root flags root subtreeFlags
	const subTreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subTreeHasEffect || rootHasEffect) {
		/**
		 * commit阶段有三个子阶段
		 * 1.beforeMutation阶段
		 * 2.mutation阶段
		 * 3.layout阶段
		 */

		// mutation
		commitMutationEffects(finishedWork);
		root.current = finishedWork;
	} else {
		root.current = finishedWork;
	}
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	// next 可能是子fiber,也可能是null
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		//说明没有子fiber,递归到最深层,开始向上回溯,执行completeWork流程
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next as FiberNode;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		node = node.return;
	} while (node !== null);
}
