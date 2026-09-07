import './styles/base.css';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { SessionProvider, useSession } from './context/SessionContext';

function AppContent() {
	const { organizationId, signIn } = useSession();
	return organizationId ? <Dashboard /> : <Login onLogin={signIn} />;
}

function App() {
	return (
		<SessionProvider>
			<AppContent />
		</SessionProvider>
	);
}

export default App;
