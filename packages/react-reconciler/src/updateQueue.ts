import { Action } from 'shared/ReactTypes';
import { FiberNode } from './fiber';

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

// 创建
export const createUpdate = <State>(action: Action<State>) => {
	return {
		action,
	};
};

// 插入
export const enqueueUpdate = <Action>(
	updateQueue: UpdateQueue<Action>,
	update: Update<Action>,
) => {
	updateQueue.shared.pending = update;
};

// 初始化
export const createUpdateQueue = <Action>() => {
	const updateQueue: UpdateQueue<Action> = {
		shared: {
			pending: null,
		},
	};
	return updateQueue;
};

// 消费
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null,
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState,
	};

	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// baseState 1 update(x) => 4x -> memoizedState 4
			result.memoizedState = action(baseState);
		} else {
			// baseState 1 update2 -> memoizedState2
			result.memoizedState = action;
		}
	}

	return result;
};
