import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Navbar from './components/Navbar';
import FloatingBubbles from './components/FloatingBubbles';
import Landing from './pages/Landing';
import Join from './pages/Join';
import TournamentPage from './pages/Tournament';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';

// ── Auth Context ─────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// ── Toast Context ─────────────────────────────────────────────────────────────
export const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((msg, type = 'info') => {
        const id = Date.now();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    }, []);
    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="toast-wrap">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
    const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('admin_email'));

    const login = (tok, email) => {
        localStorage.setItem('admin_token', tok);
        localStorage.setItem('admin_email', email);
        setToken(tok);
        setAdminEmail(email);
    };
    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
        setToken(null);
        setAdminEmail(null);
    };
    return (
        <AuthContext.Provider value={{ token, adminEmail, isAdmin: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Theme is managed on <html> via data-theme attribute, synced with localStorage
function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    else if (window.matchMedia('(prefers-color-scheme: light)').matches)
        document.documentElement.setAttribute('data-theme', 'light');
}
initTheme();

function ProtectedRoute({ children }) {
    const { isAdmin } = useAuth();
    return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <FloatingBubbles />
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/join" element={<Join />} />
                        <Route path="/tournament/:id" element={<TournamentPage />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
