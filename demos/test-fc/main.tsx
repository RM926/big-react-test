import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function Child() {
	return <span>big-react</span>;
}

function App() {
	const [num, setNum] = useState(0);
	window.setNum = setNum;
	return <div>{num}</div>;
}

const root = document.querySelector('#root');
ReactDOM.createRoot(root!).render(<App />);
