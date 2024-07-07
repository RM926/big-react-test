/**
 * commit 阶段要执行的任务
 * 1.fiber树的切换
 * 2.执行Placement对应操作
 *
 * 需要注意的问题，如果span含有flag,该如何找到它
 * <App>
 *   <div>
 *    <span>内容</span>
 *   </div>
 * </App>
 *
 */

import { Container, appendChildToContainer } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTags';

let nextEffect: FiberNode | null = null;

export function commitMutationEffects(finishedWork: FiberNode) {
	nextEffect = finishedWork;

	while (nextEffect !== null) {
		// 向下遍历
		const child: FiberNode | null = nextEffect.child;
		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child;
		} else {
			// 向上遍历,执行到没有subtreeFlags副作用的节点，即下面的节点没有变化，可以不用向下检测了
			up: while (nextEffect !== null) {
				debugger;
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;

				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}

				nextEffect = nextEffect.return;
			}
		}
	}
}

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;
	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
	}

	// flags Update
	// flags Deletion
};

const commitPlacement = (finishedWork: FiberNode) => {
  debugger;
	if (__DEV__) {
		console.warn('执行Placement操作', finishedWork);
	}

	// parent Dom 获取宿主环境的父级节点
	const hostParent = getHostParent(finishedWork);

	// finishedWork  DOM append parent DOM 
	if (hostParent !== null) {
		appendPlacementNodeIntoContainer(finishedWork, hostParent);
	}
};

const getHostParent = (fiber: FiberNode): Container | null => {
	let parent = fiber.return;
	while (parent) {
		const parentTag = parent.tag;
		// HostComponent HostRoot
		if (parentTag === HostComponent) {
			return parent.stateNode as Container;
		}

    // HostRoot ---> FiberRootNode
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}

	if (__DEV__) {
		console.warn('未找到host parent');
	}
	return null;
};

const appendPlacementNodeIntoContainer = (
	finishedWork: FiberNode,
	hostParent: Container,
) => {
	// fiber host 传进来的finishedWork的节点并不一定是原生节点，可以执行append操作,所以需要遍历找到HostComponent和HostText类型的finishedWork.tag
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(hostParent, finishedWork.stateNode);
		return;
	}

	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;

		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
};
