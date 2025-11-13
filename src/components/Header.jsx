import React from "react";
import "./components.css";

export default function Header({ user, userType, onLogout }) {
  const name = user?.name || user?.displayName || user?.email || 'Guest';
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="header">
      <div>
              <div className="profile-circle">{initials}</div>
        <h1>Kanhar Hostel</h1>
        <p>Welcome, {name} {userType && <span className="user-type">({userType})</span>}</p>
      </div>

      <div className="logout">
        <button type="button" className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
