/** 递归中的归
 *  completeWork
 *  需要解决的问题
 *  —— 对于Host类型fiberNode: 构建离屏DOM树
 *  —— 标记Update Tag
 *
 *  completeWork性能优化策略
 *  flags分布在不同fiberNode中,如何快速找到他们？
 *  answer: 利用completeWork向上遍历的流程，将子fiberNode的flags冒泡到父fiberNode
 *
 */

import {
	Container,
	appendInitialChild,
	createInstance,
	createTextInstance,
} from 'hostConfig';
import { FiberNode } from './fiber';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText,
} from './workTags';
import { NoFlags } from './fiberFlags';

export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// mount
				/*
          1.构建DOM 
         */
				// const instance = createInstance(wip.type, newProps);
				const instance = createInstance(wip.type);

				/**
				 * 2.将DOM插入到DOM树中
				 *  */
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// mount
				/*
          1.构建DOM 
          toThink 不需要执行append的操作？？？
         */
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
			bubbleProperties(wip);
			return null;
		case FunctionComponent:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未实现的completeWork情况', wip);
			}
			break;
	}
	return null;
};

/**
 *
 * @param parent
 * @param wip
 *
 * 难点情况示例：
 * 找到父级节点,A函数组件的父级元素节点是h3
 * function A(){
 * }
 * const jsx = <h3><A/></h3>
 *
 * toThink: 流程理解
 */
function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node?.sibling;
	}
}

function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}

	wip.subtreeFlags |= subtreeFlags;
}
