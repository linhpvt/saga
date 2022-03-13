import React from 'react';
import logo from './logo.svg';
import './App.scss';
import { toString, FORMAT } from './helpers/datetime';
import Counter from './features/counter/Counter';

function App() {
	return (
		<div className="App">
			<Counter />
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit {toString(new Date(), FORMAT.Y_M_D, 'ERROR')} <code>src/App.tsx</code> and save to reload.
				</p>
				<a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
					Learn React
				</a>
			</header>
		</div>
	);
}

export default App;
