import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../main';
import { useToast } from '../main';

export default function AdminLogin() {
    const [email, setEmail] = useState('aliawab888@gmail.com');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAdmin } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    if (isAdmin) { navigate('/admin'); return null; }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await api.login(email, password);
            login(data.token, data.email);
            toast('Welcome back! 🎲', 'success');
            navigate('/admin');
        } catch (err) {
            toast(err.message || 'Login failed', 'error');
        }
        setLoading(false);
    };

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: 400, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }} className="dice-spin">🎲</div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Admin Login</h1>
                    <p className="color-muted text-sm mt-8">Organizer access only</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            required
                        />
                    </div>
                    <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                        {loading ? '⏳ Signing in...' : '🔑 Sign In'}
                    </button>
                </form>

                <p className="text-center color-muted text-sm mt-16">
                    Not an admin?{' '}
                    <a href="/" className="threads-link" style={{ color: 'var(--accent)' }}>Back to Home</a>
                </p>
            </div>
        </div>
    );
}
