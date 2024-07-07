import currentDispatcher, { Dispatcher, resolveDispatcher } from './src/currentDispatcher';
import { jsxDEV } from './src/jsx';

/**
 *  * * * * * * * * * * * * * * * * *         * * * * * * * * * * * * * * * * *
 *  *  Reconciler                   *         *  内部数据共享层                *
 *  *        * * * * * * * * * *    *         *                               *
 *  *        * mount 时        *    *         *                               *
 *  *        *     useState    *    *         *                               *
 *  *        *     useEffect   *    *         *                               *
 *  *        *     ...         *    *         *                               *
 *  *        * * * * * * * * * *    *         *    当前使用的Hooks集合         *
 *  *                               *         *                               *       * * * * * * * *
 *  *        * * * * * * * * * *    *         *                               * ----> *    React    *
 *  *        * update时        *    *         *                               *       * * * * * * * *
 *  *        *     useState    *    *         *                               *
 *  *        *     useEffect   *    *         *                               *
 *  *        *     ...         *    *         *                               *
 *  *        * * * * * * * * * *    *         *                               *
 *  *                               *         *                               *
 *  *        * * * * * * * * * *    *         *                               *
 *  *        * hook上下文中     *    *         *                               *
 *  *        *     useState    *    *         *                               *
 *  *        *     useEffect   *    *         *                               *
 *  *        *     ...         *    *         *                               *
 *  *        * * * * * * * * * *    *         *                               *
 *  *                               *         *                               *
 *  * * * * * * * * * * * * * * * * *         * * * * * * * * * * * * * * * * *
 *
 *
 */

export const useState: Dispatcher['useState'] = (initialState) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};

/** 内部数据共享层 */
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRE = {
  currentDispatcher
};

export default {
	version: '0.0.0',
	/**
	 * 编译时：
	 * jsx语法在babel的作用下会被转化成React.createElement方法的运行,并且传入参数为(type,config)
	 * 这就是为什么我们写了jsx语法的代码,在控制台打印出来是一个对象的原因
	 *
	 */
	createElement: jsxDEV,
};
