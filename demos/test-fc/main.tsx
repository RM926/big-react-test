import React from 'react';
import ReactDOM from 'react-dom/client';

function Child() {
	return <span>big-react</span>;
}

function App() {
	return (
		<div>
			<Child />
		</div>
	);
}

const root = document.querySelector('#root');
ReactDOM.createRoot(root!).render(<App />);
