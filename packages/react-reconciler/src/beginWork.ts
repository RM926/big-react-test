/**
 * 递归中的递阶段
 * <A>
 *  <B/>
 * </A>
 * 当进入A的beginWork时，通过对比B current fiberNode 与 B reactElement,生成B对应的wip fiberNode
 * 在此过程中最多会标记两类与"结构变化"相关的flags
 * — Placement
 *    插入： a --> ab 移动：abc --> bca
 * — ChildDeletion
 *    删除：ul>li*3 --> ul>li
 * 不包含与"属性变化"相关的flag:
 * Update
 * <img title='1' /> --> <img title='2'/>
 *
 *
 * —— HostRoot的beginWork工作流程：
 *    1.计算状态的最新值
 *    2.创造子fiberNode
 *
 * —— HostComponent的beginWork工作流程：
 *    1.创造子fiberNode
 *
 * ——— HostText没有beginWork流程(因为没有其它子节点)
 */

import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTags';
import { mountChildFibers, reconcileChildFibers } from './childFibers';

export function beginWork(wip: FiberNode) {
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		case HostText:
			return null;
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型');
			}
			break;
	}
  return null;
}

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;

	const pending = updateQueue.shared.pending;

	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending);

	// 执行到这里的时候wip.memoizedState = <App /> 从fiberReconciler中的updateContainer方法为起始点
	wip.memoizedState = memoizedState;
	const nextChildren = wip.memoizedState;
	reconcilerChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcilerChildren(wip, nextChildren);
	return wip.child;
}

function reconcilerChildren(wip: FiberNode, children?: ReactElementType) {
	// 对比子节点的current fiberNode 与 子节点的ReactElement,来生成wip fiberNode
	const current = wip.alternate;
	/**
	 * React.createDom(hostElement).render(<App/>)
	 * 在首屏渲染的时候，通过createWorkInProgress已经将hostElement对应的hostRootFiber初始化了
	 * alternate字段，所以下面的条件判断，hostFiber下的子节点只会进入mounted过程
	 */
	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children)!;
	} else {
		// mounted
		/**
		 * 从父级节点向下遍历,依次将子ReactElement转换为FiberNode
		 */
		// wip FiberNode
		wip.child = mountChildFibers(wip, null, children)!;
	}
}
