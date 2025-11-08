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
