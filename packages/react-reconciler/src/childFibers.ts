import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, createFiberFromElement } from './fiber';
import { HostText } from './workTags';
import { Placement } from './fiberFlags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';

export function ChildReconciler(shouldTrackEffects: boolean) {
	// HostComponent <div></div>
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType,
	) {
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	// HostText
	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number,
	) {
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffects && fiber.alternate === null) {
			// fiber.alternate 指向的current,current === null,说明当前的节点是刚创建的,是首屏渲染的过程
			fiber.flags |= Placement;
		}
		return fiber;
	}

	return function reconcileFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType,
	) {
		// 判断当前的fiber的类型
		if (typeof newChild === 'object') {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return reconcileSingleElement(returnFiber, currentFiber, newChild);
				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild);
					}
					break;
			}
		}

		//HostText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return reconcileSingleTextNode(returnFiber, currentFiber, newChild);
		}
		// return fiberNode
	};
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
