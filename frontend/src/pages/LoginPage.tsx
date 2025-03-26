import React, { useState } from 'react';
import authService from '@services/authService';
import { useAuth } from '@features/auth/AuthContext';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [usernameOrEmail, setUsernameOrEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await authService.login(usernameOrEmail, password); // Use authService for login
            await login(usernameOrEmail, password); // Update context state
            window.location.href = '/dashboard'; // Redirect to dashboard
        } catch (err: any) {
            console.error('Login failed:', err);
            setError('Invalid username or password.');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username or Email:</label>
                    <input
                        type="text"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default LoginPage;
