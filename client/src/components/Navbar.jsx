import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../main';

// Threads SVG logo
const ThreadsLogo = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M141.537 88.988a66.667 66.667 0 00-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.69-1.14C76.089 83.309 58.824 93.651 59.98 113.52c.589 10.009 5.754 18.629 14.567 24.28 7.417 4.812 16.974 7.152 26.924 6.621 13.121-.72 23.39-5.728 30.512-14.876 5.347-6.965 8.713-15.98 10.16-27.37 6.097 3.676 10.607 8.526 13.08 14.464 4.392 10.44 4.643 27.571-9.112 41.314C132.07 171.403 113.11 178 90.873 178c-24.489-.081-43.064-8.04-55.198-23.655C23.737 138.012 17.805 116.714 17.6 90c.205-26.714 6.137-48.012 18.075-63.345C47.81 11.039 66.385 3.08 90.874 3c24.664.081 43.568 8.079 56.189 23.799 6.136 7.757 10.724 17.45 13.682 28.821l16.28-4.325c-3.595-13.264-9.317-24.977-17.138-34.99C143.982 9.17 120.275-.057 90.951 0h-.08C61.741.057 38.366 9.329 22.5 27.396 8.111 43.836.504 67.157.2 96.025L.2 96l.001.024c.303 28.862 7.91 52.149 22.3 68.59C38.365 182.681 61.74 191.943 90.87 192h.08c26.168-.057 45.512-7.037 60.965-22.485 20.47-20.454 19.846-46.025 13.092-61.733-4.825-11.458-14.096-20.716-23.47-18.794z" fill="currentColor" />
    </svg>
);

export default function Navbar() {
    const { isAdmin, adminEmail, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(
        () => document.documentElement.getAttribute('data-theme') || 'dark'
    );

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setTheme(next);
    };

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo" style={{ gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ background: '#000', borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                        <svg viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                            <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.216 44.905 97.5619 44.745C97.4484 44.744 97.3355 44.744 97.222 44.744C66.136 44.744 45.4184 68.1203 45.4184 94.484C45.4184 123.361 65.6596 148.452 97.4372 148.452C118.847 148.452 135.21 138.825 141.026 122.997C141.603 121.427 141.012 119.682 139.58 118.816C138.147 117.949 136.262 118.2 135.084 119.418C130.686 123.971 120.306 132.8 97.4372 132.8C75.2533 132.8 61.07 115.845 61.07 96.1895C61.07 94.757 61.1685 93.3598 61.3551 92.0076C63.2687 97.108 67.761 101.446 74.072 104.532C80.2526 107.554 87.8383 109.115 95.843 109.115C118.816 109.115 133.01 98.4048 133.01 80.8931C133.01 64.9126 121.737 56.4011 97.222 56.4011C97.3355 56.4011 97.4484 56.4021 97.563 56.4032C114.735 56.5163 123.511 67.5401 123.921 86.8166C121.246 86.1309 118.156 85.6429 114.659 85.3424C109.303 84.8824 103.149 84.6644 96.6575 84.6644C73.4542 84.6644 58.053 88.5802 58.053 100.864C58.053 107.039 62.4842 111.411 69.102 111.411C77.019 111.411 85.122 107.13 90.573 101.378C93.4255 98.3687 95.558 94.6704 96.868 90.627C107.838 91.0784 117.801 92.5152 125.795 95.5322C130.669 97.3712 134.425 99.8517 136.786 102.837C137.669 103.953 139.317 104.184 140.528 103.364C141.739 102.544 142.124 100.957 141.406 99.6874C139.311 95.9868 135.253 92.4042 129.589 89.261C132.899 88.9419 136.212 88.8052 139.467 88.8052C140.407 88.8052 141.139 88.6346 141.537 88.9883ZM93.565 89.3093C92.483 93.3364 90.177 96.6369 87.266 98.924C83.844 101.611 79.526 102.895 75.254 102.895C72.883 102.895 70.824 102.132 69.349 100.783C67.923 99.4796 67.227 97.8037 67.227 95.9171C67.227 92.0518 72.84 89.0494 81.332 88.1691C84.346 87.8566 87.726 87.6976 91.353 87.6976C92.179 87.6976 92.909 87.708 93.633 87.7289C93.611 88.2541 93.589 88.7801 93.565 89.3093Z" fill="#FFFFFF" />
                        </svg>
                    </div>
                    <span className="dice-spin" style={{ fontSize: '1.2rem' }}>🎲</span>
                </div>
                <span className="navbar-logo-text">Threads Ludo Star</span>
            </Link>

            <div className="navbar-right">
                <NavLink to="/" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Home</NavLink>
                <NavLink to="/join" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Join</NavLink>

                {isAdmin && (
                    <>
                        <NavLink to="/admin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Admin</NavLink>
                        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
                    </>
                )}
                {!isAdmin && (
                    <NavLink to="/admin/login" className="nav-link">Admin</NavLink>
                )}

                <a
                    href="https://www.threads.com/datsleeepyhead"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="organizer-badge"
                >
                    <ThreadsLogo size={14} />
                    <span className="organizer-dot" />
                    <span>@datsleeepyhead</span>
                </a>

                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Toggle dark/light mode"
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
        </nav>
    );
}
