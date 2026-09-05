import { useState } from 'react';
import './App.css';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';

function App() {
	const [loggedIn, setLoggedIn] = useState(false);
	return loggedIn ? <Dashboard onSignOut={() => setLoggedIn(false)} /> : <Login onLogin={() => setLoggedIn(true)} />;
}

export default App;
