import { SubmitEvent, useState } from 'react';
/**
 * https://developer.productive.io/reference/resources/organization-memberships

*/
export function Login({ onLogin }: { onLogin: () => void }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const submit = (event: SubmitEvent) => {
		event.preventDefault();
		if (email && password) onLogin();
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
						Email address
						<input
							type='email'
							value={email}
							onChange={({ target: { value } }) => setEmail(value)}
							placeholder='you@company.com'
							required
						/>
					</label>
					<label>
						Password
						<input
							type='password'
							value={password}
							onChange={({ target: { value } }) => setPassword(value)}
							placeholder='Enter your password'
							required
						/>
					</label>
					<button className='primary-button' type='submit'>
						Sign in <span aria-hidden='true'>→</span>
					</button>
				</form>
				<p className='login-foot'>
					New here?{' '}
					<button className='text-button' type='button'>
						Create an account
					</button>
				</p>
			</section>
			<aside className='login-aside'>
				<div className='aside-shape' />
				<p>“The clarity of knowing where your hours go is a small daily superpower.”</p>
				<span>— A better workday</span>
			</aside>
		</main>
	);
}
