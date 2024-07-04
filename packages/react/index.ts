import { jsxDEV } from './src/jsx';

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
