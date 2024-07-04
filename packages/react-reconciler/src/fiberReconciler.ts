import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
} from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

// ReactDom.createRoot()
export function createContainer(container: Container) {
	// hostRootFiber
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	// fiberRootNode
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}

// render
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode,
) {
	const hostRootFiber = root.current;
	// toThink: 这里传入的是element,即是<App />,理应来说,createUpdate传入的是Action
	const update = createUpdate<ReactElementType | null>(element);
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update,
	);

	scheduleUpdateOnFiber(hostRootFiber);
	return element;
}
