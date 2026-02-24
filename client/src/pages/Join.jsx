import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useToast } from '../main';

export default function Join() {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTId, setSelectedTId] = useState('');
    const [form, setForm] = useState({
        team_name: '',
        player1_name: '', player1_threads: '@',
        player2_name: '', player2_threads: '@',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        api.getTournaments().then(data => {
            const open = data.filter(t => t.status === 'open');
            setTournaments(open);
            if (open.length === 1) setSelectedTId(String(open[0].id));
        }).catch(() => { });
    }, []);

    const selectedT = tournaments.find(t => String(t.id) === selectedTId);

    const set = (field) => (e) => {
        let val = e.target.value;
        // Keep @ prefix for threads handles
        if ((field === 'player1_threads' || field === 'player2_threads') && !val.startsWith('@')) {
            val = '@' + val.replace(/^@+/, '');
        }
        setForm(f => ({ ...f, [field]: val }));
    };

    const validate = () => {
        if (!selectedTId) return 'Please select a tournament.';
        if (!form.team_name.trim()) return 'Team name is required.';
        if (!form.player1_name.trim()) return 'Player 1 name is required.';
        if (!form.player2_name.trim()) return 'Player 2 name is required.';
        if (form.player1_threads.length < 2) return 'Player 1 Threads handle is required.';
        if (form.player2_threads.length < 2) return 'Player 2 Threads handle is required.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { toast(err, 'error'); return; }
        setLoading(true);
        try {
            await api.register({ tournament_id: Number(selectedTId), ...form });
            setSubmitted(true);
            toast('Registration submitted! Waiting for admin approval.', 'success');
        } catch (err) {
            toast(err.message, 'error');
        }
        setLoading(false);
    };

    if (submitted) return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card text-center" style={{ maxWidth: 440 }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
                <h2 className="section-title">Registration Submitted!</h2>
                <p className="color-muted" style={{ margin: '12px 0 24px', lineHeight: 1.7 }}>
                    Your team <strong>{form.team_name}</strong> has been registered.
                    The organiser <strong>@datsleeepyhead</strong> will review and approve your spot.
                    Follow them on Threads for updates!
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => { setSubmitted(false); setForm({ team_name: '', player1_name: '', player1_threads: '@', player2_name: '', player2_threads: '@' }); }}>
                        Register Another Team
                    </button>
                    <button className="btn btn-ghost" onClick={() => navigate('/')}>Back to Home</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="page">
            <div className="join-container">
                <div style={{ marginBottom: 28 }}>
                    <h1 className="section-title">🎯 Join a Tournament</h1>
                    <p className="section-sub">Register your team (2 players). The organiser will approve your spot.</p>
                </div>

                {tournaments.length === 0 ? (
                    <div className="card empty-state">
                        <div className="icon">⏳</div>
                        <p>No open tournaments right now.</p>
                        <p className="text-sm color-muted">Follow <strong>@datsleeepyhead</strong> on Threads for announcements!</p>
                        <button className="btn btn-ghost mt-16" onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="card join-card">
                        {/* Tournament select */}
                        <div className="form-group">
                            <label className="form-label">Select Tournament *</label>
                            <select
                                className="form-select"
                                value={selectedTId}
                                onChange={e => setSelectedTId(e.target.value)}
                                required
                            >
                                <option value="">— Choose a tournament —</option>
                                {tournaments.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.format})</option>
                                ))}
                            </select>
                            {selectedT && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                    <span className={`badge ${selectedT.format === '4-team' ? 'badge-4team' : 'badge-8team'}`}>{selectedT.format}</span>
                                    <span className="badge badge-open">Open for Registration</span>
                                </div>
                            )}
                        </div>

                        {/* Team name */}
                        <div className="form-group">
                            <label className="form-label">Team Name *</label>
                            <input
                                className="form-input"
                                placeholder="e.g. Red Dragons"
                                value={form.team_name}
                                onChange={set('team_name')}
                                required maxLength={40}
                            />
                        </div>

                        {/* Player 1 */}
                        <div className="team-section">
                            <div className="team-section-title">🎲 Player 1</div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        className="form-input"
                                        placeholder="Full name"
                                        value={form.player1_name}
                                        onChange={set('player1_name')}
                                        required maxLength={60}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Threads Handle *</label>
                                    <input
                                        className="form-input"
                                        placeholder="@username"
                                        value={form.player1_threads}
                                        onChange={set('player1_threads')}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Player 2 */}
                        <div className="team-section">
                            <div className="team-section-title">🎲 Player 2</div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        className="form-input"
                                        placeholder="Full name"
                                        value={form.player2_name}
                                        onChange={set('player2_name')}
                                        required maxLength={60}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Threads Handle *</label>
                                    <input
                                        className="form-input"
                                        placeholder="@username"
                                        value={form.player2_threads}
                                        onChange={set('player2_threads')}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--text3)', lineHeight: 1.5 }}>
                            ℹ️ After submitting, <strong>@datsleeepyhead</strong> will review and approve your registration. You'll be notified via Threads.
                        </div>

                        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                            {loading ? '⏳ Submitting...' : '✅ Submit Registration'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
