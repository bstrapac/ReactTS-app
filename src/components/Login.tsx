import { SubmitEvent, useState } from 'react';
import { ApiError } from '../api/client';
import '../styles/login.css';

type LoginProps = {
	onLogin: (organizationId: string, token: string) => Promise<void>;
};

export function Login({ onLogin }: LoginProps) {
	const [organizationId, setOrganizationId] = useState(process.env.REACT_APP_ORGANIZATION_ID ?? '');
	const [token, setToken] = useState(process.env.REACT_APP_API_TOKEN ?? '');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const submit = async (event: SubmitEvent) => {
		event.preventDefault();
		if (!organizationId || !token) return;
		setError('');
		setLoading(true);
		try {
			await onLogin(organizationId, token);
			console.log('[Login] authentication succeeded', { organizationId });
		} catch (cause) {
			const apiError = cause instanceof ApiError ? `API ${cause.status}: ${formatApiError(cause.body)}` : 'The browser could not reach the API.';
			console.error('[Login] authentication failed', { organizationId, error: cause });
			setError(apiError);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className='login-page'>
			<section className='login-panel'>
				<div className='brand-mark'>
					hours<span>.</span>
				</div>
				<p className='eyebrow'>PERSONAL TIME TRACKER</p>
				<h1>
					Make time
					<br />
					<em>count.</em>
				</h1>
				<p className='login-copy'>A calm place to keep your workday clear, focused, and accounted for.</p>
				<form onSubmit={submit} className='login-form'>
					<label>
						Organization ID
						<input
							type='number'
							value={organizationId}
							onChange={({ target: { value } }) => setOrganizationId(value)}
							placeholder='Organization ID'
							required
						/>
					</label>
					<label>
						API token
						<input
							type='password'
							value={token}
							onChange={({ target: { value } }) => setToken(value)}
							placeholder='Enter your token here'
							required
						/>
					</label>
					{error && <p className='form-error' role='alert'>{error}</p>}
					<button className='primary-button' type='submit'>
						{loading ? 'Checking...' : 'Sign in'} <span aria-hidden='true'>→</span>
					</button>
				</form>
			</section>
			<aside className='login-aside'>
				<div className='aside-shape' />
				<p>“The clarity of knowing where your hours go is a small daily superpower.”</p>
				<span>— A better workday</span>
			</aside>
		</main>
	);
}

function formatApiError(body: unknown) {
	if (typeof body === 'string') return body;
	if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') return body.message;
	return 'The API rejected the request.';
}
