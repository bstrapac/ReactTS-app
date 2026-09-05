import { createContext, ReactNode, useContext, useState } from 'react';

type SessionContextValue = {
	email: string | null;
	signIn: (email: string) => void;
	signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
	const [email, setEmail] = useState<string | null>(null);

	return (
		<SessionContext.Provider value={{ email, signIn: setEmail, signOut: () => setEmail(null) }}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const session = useContext(SessionContext);
	if (!session) throw new Error('useSession must be used within SessionProvider');
	return session;
}
