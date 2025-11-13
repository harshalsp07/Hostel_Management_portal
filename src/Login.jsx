import React, { useState } from 'react';
import './Login.css';

export const AuthForm = ({ onSubmit, message, setMessage, onClearMessage, isProcessing }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            setMessage?.({ text: 'Password must be at least 6 characters.', isError: true });
            return;
        }

        onClearMessage?.();
        await onSubmit?.({
            mode: 'login',
            email,
            password,
        });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand-panel">
                    <div className="brand-badge">Welcome back</div>
                    <h2>Hostel Management System</h2>
                    <p>Keep occupancy, maintenance, and student records organized in one intuitive workspace.</p>
                    <ul className="brand-highlights">
                        <li>Real-time occupancy insights</li>
                        <li>Smart allocation workflows</li>
                        <li>Automated reminders</li>
                    </ul>
                </div>
                <div className="form-panel">
                    <div className="tab-group">
                        <button
                            type="button"
                            className="tab-button active"
                            disabled
                        >
                            Login
                        </button>
                    </div>

                    {message?.text && (
                        <div className={`auth-message${message.isError ? ' error' : ' success'}`}>
                            {message.text}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="email-address" className="field-label">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                                className="field-input"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="password" className="field-label">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                                className="field-input"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-submit primary"
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Please wait…' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const HostelDashboard = ({ user, onLogout }) => {
    const handleLogout = async () => {
        await onLogout?.();
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-shell">
                <header className="dashboard-header">
                    <div>
                        <h1>Hostel Dashboard</h1>
                        <span className="dashboard-subtitle">Central command for your daily operations</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </header>
                <section className="dashboard-card">
                    <h2>Hello, <span>{user?.email}</span></h2>
                    <p>
                        Use the left navigation to manage rooms, track inmate details, and stay ahead of maintenance tasks.
                        Configure additional modules to unlock analytics tailored to your hostel.
                    </p>
                </section>
            </div>
        </div>
    );
};
