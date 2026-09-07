import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders the login screen', () => {
    render(<App />);
    expect(screen.getByText(/make time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});
