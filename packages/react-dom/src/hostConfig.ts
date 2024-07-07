export type Container = Element | Document;
export type Instance = Element;
export type TextInstance = Text;

export const createInstance = (type: string) => {
	return document.createElement(type);
};

export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

export const appendInitialChild = (parent: Instance | Container, child: Instance) => {
	parent.appendChild(child);
};

export const appendChildToContainer = appendInitialChild
