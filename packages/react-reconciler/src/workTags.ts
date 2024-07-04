export type WorkTag =
	| typeof FunctionComponent
	| typeof HostComponent
	| typeof HostRoot
	| typeof HostText;

export const FunctionComponent = 0;


export const HostRoot = 3;
// <div></div>
export const HostComponent = 5;
// text
export const HostText = 6;
