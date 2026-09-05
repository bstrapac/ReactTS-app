import './App.css';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { SessionProvider, useSession } from './context/SessionContext';

function AppContent() {
	const { email, signIn } = useSession();
	return email ? <Dashboard /> : <Login onLogin={signIn} />;
}

function App() {
	return (
		<SessionProvider>
			<AppContent />
		</SessionProvider>
	);
}

export default App;
