import path from 'path';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

console.log('pkgPath, distPath:', pkgPath, distPath);
export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	} else {
		return `${pkgPath}/${pkgName}`;
	}
}

export function getPackageJSON(pkgName) {
	// 包路径
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	const packageJSON = JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
	console.log(packageJSON);
	return packageJSON;
}

export function getBaseRollupPlugins({
	alias = { __DEV__: true, preventAssignment: true },
	typescript = {},
} = {}) {
	return [replace(alias), cjs(), ts(typescript)];
}
