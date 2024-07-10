// ReactElement

import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
	Key,
	Props,
	ReactElementType,
	Ref,
	ElementType,
} from 'shared/ReactTypes';

export const ReactElement = (
	type: ElementType,
	key: Key,
	ref: Ref,
	props: Props,
): ReactElementType => {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: 'self',
	};
	return element;
};

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key' && prop !== null) {
			key = val + '';
		} else if (prop === 'ref' && prop !== null) {
			ref = val + '';
		} else {
			if ({}.hasOwnProperty.call(config, prop)) {
				props[prop] = val;
			}
		}
	}
	const maybeChildrenLength = maybeChildren.length;
	if (maybeChildrenLength) {
		if (maybeChildrenLength === 1) {
			props.children = maybeChildren[0];
		} else {
			props.children = maybeChildren;
		}
	}

	return ReactElement(type, key, ref, props);
};

export const jsxDEV = (type: ElementType, config: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key' && prop !== null) {
			key = val + '';
		} else if (prop === 'ref' && prop !== null) {
			ref = val + '';
		} else {
			if ({}.hasOwnProperty.call(config, prop)) {
				props[prop] = val;
			}
		}
	}

	return ReactElement(type, key, ref, props);
};

export function isValidElement(object: any) {
	return (
		typeof object === 'object' &&
		object !== null &&
		object.$$typeof === REACT_ELEMENT_TYPE
	);
}
