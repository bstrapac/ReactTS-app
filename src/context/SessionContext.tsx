import { createContext, ReactNode, useContext, useState } from 'react';
import { ApiClient } from '../api/client';
import { OrganizationMemberProfile } from '../types';
import { login } from '../services/loginService';

type SessionContextValue = {
	organizationId: string | null;
	signIn: (organizationId: string, token: string) => Promise<void>;
	signOut: () => void;
	profile: OrganizationMemberProfile | null;
	client: ApiClient | null;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
	const [organizationId, setOrganizationId] = useState<string | null>(null);
	const [profile, setProfile] = useState<OrganizationMemberProfile | null>(null);
	const [client, setClient] = useState<ApiClient | null>(null);
	const signIn = async (nextOrganizationId: string, token: string) => {
		const { client: nextClient, profile: nextProfile } = await login(nextOrganizationId, token);
		setOrganizationId(nextOrganizationId);
		setProfile(nextProfile);
		setClient(nextClient);
	};
	const signOut = () => {
		setOrganizationId(null);
		setProfile(null);
		setClient(null);
	};

	return (
		<SessionContext.Provider value={{ organizationId, signIn, signOut, profile, client }}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const session = useContext(SessionContext);
	if (!session) throw new Error('useSession must be used within SessionProvider');
	return session;
}
