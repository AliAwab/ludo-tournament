import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../main';
import { useToast } from '../main';

// ── Tournaments Tab ──────────────────────────────────────────────────────────
function TournamentsTab() {
    const [list, setList] = useState([]);
    const [previewTId, setPreviewTId] = useState(null);
    const [previewTeams, setPreviewTeams] = useState([]);
    const [form, setForm] = useState({ name: '', format: '4-team' });
    const [creating, setCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [pairingMode, setPairingMode] = useState('random'); // 'random' or 'manual'
    const [seeding, setSeeding] = useState([]); // Array of team IDs
    const toast = useToast();
    const navigate = useNavigate();

    const fetchTournaments = useCallback(async () => {
        const data = await api.getTournaments();
        setList(data);
    }, []);

    useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

    const handleStartPreview = async (tournament) => {
        const max = tournament.format === '4-team' ? 4 : 8;
        if (tournament.approved_teams !== max) {
            toast(`Exactly ${max} approved teams required! (Currently ${tournament.approved_teams})`, 'error');
            return;
        }
        try {
            const regs = await api.getRegistrations(tournament.id);
            const approved = regs.filter(r => r.status === 'approved');
            setPreviewTeams(approved);
            setSeeding(approved.map(t => t.id)); // Default order
            setPreviewTId(tournament.id);
            setPairingMode('random');
        } catch (err) { toast(err.message, 'error'); }
    };

    const handleConfirmStart = async () => {
        if (!previewTId) return;
        setLoading(true);
        try {
            const body = pairingMode === 'manual' ? { seeding } : {};
            await api.startTournament(previewTId, body);
            toast('Bracket generated! Tournament is now Live. 🚀', 'success');
            setPreviewTId(null);
            fetchTournaments();
        } catch (err) { toast(err.message, 'error'); }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { toast('Tournament name required', 'error'); return; }
        setLoading(true);
        try {
            await api.createTournament(form);
            toast('Tournament created!', 'success');
            setForm({ name: '', format: '4-team' });
            setCreating(false);
            fetchTournaments();
        } catch (err) { toast(err.message, 'error'); }
        setLoading(false);
    };

    const handleDeleteClick = (id, name) => {
        setConfirmDelete({ id, name });
    };

    const confirmDeleteAction = async () => {
        if (!confirmDelete) return;
        setLoading(true);
        try {
            await api.deleteTournament(confirmDelete.id);
            toast('Tournament deleted.', 'info');
            fetchTournaments();
        } catch (err) { toast(err.message, 'error'); }
        setLoading(false);
        setConfirmDelete(null);
    };

    const statusBadge = (s) => {
        const map = { open: 'badge-open', in_progress: 'badge-progress', completed: 'badge-done' };
        const lbl = { open: '● Open', in_progress: '▶ Live', completed: '✔ Done' };
        return <span className={`badge ${map[s]}`}>{lbl[s]}</span>;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Tournaments</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setCreating(c => !c)}>
                    {creating ? '✕ Cancel' : '+ New Tournament'}
                </button>
            </div>

            {creating && (
                <form onSubmit={handleCreate} className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
                        <label className="form-label">Tournament Name *</label>
                        <input
                            className="form-input"
                            placeholder="e.g. Summer 2025 Showdown"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                        <label className="form-label">Format *</label>
                        <select className="form-select" value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                            <option value="4-team">4 Teams (2 players each)</option>
                            <option value="8-team">8 Teams (2 players each)</option>
                        </select>
                    </div>
                    <button className="btn btn-green" type="submit" disabled={loading}>
                        {loading ? '⏳' : '✅ Create'}
                    </button>
                </form>
            )}

            {list.length === 0 ? (
                <div className="empty-state card">
                    <div className="icon">🎲</div>
                    <p>No tournaments yet. Click "New Tournament" to get started!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {list.map(t => (
                        <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>🎲 {t.name}</span>
                                    {statusBadge(t.status)}
                                    <span className={`badge ${t.format === '4-team' ? 'badge-4team' : 'badge-8team'}`}>{t.format}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text2)', marginTop: 4 }}>
                                    ✅ {t.approved_teams} approved · ⏳ {t.pending_teams} pending
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/tournament/${t.id}`)}>
                                    View Bracket
                                </button>
                                {t.status === 'open' && (
                                    <button className="btn btn-accent btn-sm" onClick={() => handleStartPreview(t)}>
                                        ▶ Start Bracket
                                    </button>
                                )}
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(t.id, t.name)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {previewTId && (
                <div className="modal-overlay" onClick={() => setPreviewTId(null)}>
                    <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-title">🏆 Review Initial Matchups</div>

                        <div style={{ display: 'flex', background: 'var(--bg2)', padding: 4, borderRadius: 8, marginBottom: 20 }}>
                            <button
                                className={`btn btn-sm w-full ${pairingMode === 'random' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setPairingMode('random')}
                            >
                                🎲 Random Draw
                            </button>
                            <button
                                className={`btn btn-sm w-full ${pairingMode === 'manual' ? 'btn-manual' : 'btn-ghost'}`}
                                onClick={() => setPairingMode('manual')}
                                style={pairingMode === 'manual' ? { background: 'var(--accent)', color: '#000' } : {}}
                            >
                                🎯 Manual Pairing
                            </button>
                        </div>

                        {pairingMode === 'random' ? (
                            <p className="text-sm color-muted mb-16">Matching will be randomized upon starting. Approved teams:</p>
                        ) : (
                            <p className="text-sm color-muted mb-16">Select teams for each bracket slot:</p>
                        )}

                        <div className="card" style={{ background: 'rgba(255,255,255,0.05)', marginBottom: 20 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {Array.from({ length: seeding.length / 2 }).map((_, matchIdx) => (
                                    <div key={matchIdx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase' }}>
                                            Match {matchIdx + 1}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
                                            {/* Slot A */}
                                            {pairingMode === 'random' ? (
                                                <div className="text-sm" style={{ fontWeight: 600, padding: '8px 12px', background: 'var(--card-bg)', borderRadius: 6 }}>
                                                    {previewTeams.find(t => t.id === seeding[matchIdx * 2])?.team_name || 'Team A'}
                                                </div>
                                            ) : (
                                                <select
                                                    className="form-select text-sm"
                                                    style={{ padding: '6px 10px' }}
                                                    value={seeding[matchIdx * 2]}
                                                    onChange={(e) => {
                                                        const newSeeding = [...seeding];
                                                        newSeeding[matchIdx * 2] = Number(e.target.value);
                                                        setSeeding(newSeeding);
                                                    }}
                                                >
                                                    {previewTeams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                                                </select>
                                            )}

                                            <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>VS</span>

                                            {/* Slot B */}
                                            {pairingMode === 'random' ? (
                                                <div className="text-sm" style={{ fontWeight: 600, padding: '8px 12px', background: 'var(--card-bg)', borderRadius: 6 }}>
                                                    {previewTeams.find(t => t.id === seeding[matchIdx * 2 + 1])?.team_name || 'Team B'}
                                                </div>
                                            ) : (
                                                <select
                                                    className="form-select text-sm"
                                                    style={{ padding: '6px 10px' }}
                                                    value={seeding[matchIdx * 2 + 1]}
                                                    onChange={(e) => {
                                                        const newSeeding = [...seeding];
                                                        newSeeding[matchIdx * 2 + 1] = Number(e.target.value);
                                                        setSeeding(newSeeding);
                                                    }}
                                                >
                                                    {previewTeams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                                                </select>
                                            )}
                                        </div>
                                        {matchIdx < (seeding.length / 2 - 1) && <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {pairingMode === 'manual' && new Set(seeding).size !== seeding.length && (
                            <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginBottom: 12, textAlign: 'center' }}>
                                ⚠️ Duplicate teams selected! Please ensure each team is unique.
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                className="btn btn-green w-full"
                                onClick={handleConfirmStart}
                                disabled={loading || (pairingMode === 'manual' && new Set(seeding).size !== seeding.length)}
                            >
                                {loading ? 'Starting...' : '🚀 Confirm & Start Live'}
                            </button>
                            <button className="btn btn-ghost w-full" onClick={() => setPreviewTId(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-title" style={{ color: 'var(--red)' }}>⚠️ Delete Tournament</div>
                        <p className="text-sm color-muted mb-16">
                            Are you sure you want to delete <strong>{confirmDelete.name}</strong> and ALL its data? This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-danger w-full" onClick={confirmDeleteAction} disabled={loading}>
                                {loading ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                            <button className="btn btn-ghost w-full" onClick={() => setConfirmDelete(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Registrations Tab ────────────────────────────────────────────────────────
function RegistrationsTab() {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTId, setSelectedTId] = useState('');
    const [regs, setRegs] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        api.getTournaments().then(data => {
            setTournaments(data);
            if (data.length > 0) setSelectedTId(String(data[0].id));
        });
    }, []);

    const fetchRegs = useCallback(async (tid) => {
        if (!tid) return;
        setLoading(true);
        try {
            const data = await api.getRegistrations(tid);
            setRegs(data);
        } catch (err) { toast(err.message, 'error'); }
        setLoading(false);
    }, [toast]);

    useEffect(() => { fetchRegs(selectedTId); }, [selectedTId, fetchRegs]);

    const handleStatus = async (id, status) => {
        try {
            await api.updateRegistration(id, status);
            toast(`Registration ${status}!`, status === 'approved' ? 'success' : 'info');
            fetchRegs(selectedTId);
        } catch (err) { toast(err.message, 'error'); }
    };

    const statusBadge = (s) => (
        <span className={`badge badge-${s}`}>{s}</span>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Registrations</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <select
                        className="form-select"
                        value={selectedTId}
                        onChange={e => setSelectedTId(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-wrap"><div className="spinner" /></div>
            ) : regs.length === 0 ? (
                <div className="empty-state card">
                    <div className="icon">📋</div>
                    <p>No registrations yet for this tournament.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="reg-table">
                        <thead>
                            <tr>
                                <th>Team</th>
                                <th>Player 1</th>
                                <th>Player 2</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {regs.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 700 }}>{r.team_name}</td>
                                    <td>
                                        <div>{r.player1_name}</div>
                                        <div>
                                            <a href={`https://www.threads.com/${r.player1_threads.slice(1)}`} target="_blank" rel="noopener noreferrer" className="threads-link">
                                                {r.player1_threads}
                                            </a>
                                        </div>
                                    </td>
                                    <td>
                                        <div>{r.player2_name}</div>
                                        <div>
                                            <a href={`https://www.threads.com/${r.player2_threads.slice(1)}`} target="_blank" rel="noopener noreferrer" className="threads-link">
                                                {r.player2_threads}
                                            </a>
                                        </div>
                                    </td>
                                    <td>{statusBadge(r.status)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {r.status !== 'approved' && (
                                                <button className="btn btn-green btn-sm" onClick={() => handleStatus(r.id, 'approved')}>✓ Approve</button>
                                            )}
                                            {r.status !== 'rejected' && (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleStatus(r.id, 'rejected')}>✗ Reject</button>
                                            )}
                                            {r.status !== 'pending' && (
                                                <button className="btn btn-ghost btn-sm" onClick={() => handleStatus(r.id, 'pending')}>↺ Reset</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ── Matches Tab ──────────────────────────────────────────────────────────────
function MatchesTab() {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTId, setSelectedTId] = useState('');
    const [tData, setTData] = useState(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const [pickMatchId, setPickMatchId] = useState(null);

    useEffect(() => {
        api.getTournaments().then(data => {
            const active = data.filter(t => t.status === 'in_progress' || t.status === 'completed');
            setTournaments(active);
            if (active.length > 0) setSelectedTId(String(active[0].id));
        });
    }, []);

    const fetchTData = useCallback(async (tid) => {
        if (!tid) return;
        setLoading(true);
        try {
            const data = await api.getTournament(tid);
            setTData(data);
        } catch (err) { toast(err.message, 'error'); }
        setLoading(false);
    }, [toast]);

    useEffect(() => { fetchTData(selectedTId); }, [selectedTId, fetchTData]);

    const handleWinner = async (matchId, winnerId) => {
        try {
            await api.setWinner(matchId, winnerId);
            toast('Winner set! Bracket updated. ✅', 'success');
            setPickMatchId(null);
            fetchTData(selectedTId);
        } catch (err) { toast(err.message, 'error'); }
    };

    const activeMatches = tData?.matches.filter(m => m.status === 'active' && !m.is_bye) || [];
    const pickMatch = activeMatches.find(m => m.id === pickMatchId);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h2 className="section-title" style={{ fontSize: '1.3rem' }}>Enter Match Results</h2>
                {selectedTId && (
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/tournament/${selectedTId}`)}>
                        View Full Bracket ↗
                    </button>
                )}
            </div>

            {tournaments.length === 0 ? (
                <div className="empty-state card">
                    <div className="icon">⏳</div>
                    <p>No active tournaments. Start a bracket from the Tournaments tab.</p>
                </div>
            ) : (
                <>
                    <select
                        className="form-select"
                        value={selectedTId}
                        onChange={e => setSelectedTId(e.target.value)}
                        style={{ maxWidth: 320, marginBottom: 20 }}
                    >
                        {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>

                    {loading ? (
                        <div className="loading-wrap"><div className="spinner" /></div>
                    ) : activeMatches.length === 0 ? (
                        <div className="empty-state card">
                            <div className="icon">{tData?.tournament.status === 'completed' ? '🏆' : '⏳'}</div>
                            <p>{tData?.tournament.status === 'completed' ? 'Tournament complete! All matches done.' : 'No active matches right now.'}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <p className="color-muted text-sm mb-8">Click a match to set the winner:</p>
                            {activeMatches.map(m => (
                                <div
                                    key={m.id}
                                    className="card"
                                    style={{ borderLeft: '3px solid var(--blue)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                    onClick={() => setPickMatchId(m.id)}
                                    onMouseEnter={e => e.currentTarget.style.borderLeftColor = 'var(--yellow)'}
                                    onMouseLeave={e => e.currentTarget.style.borderLeftColor = 'var(--blue)'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                                                Round {m.round} · Match #{m.position + 1}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 700 }}>{m.team1_name || 'TBD'}</span>
                                                <span style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>VS</span>
                                                <span style={{ fontWeight: 700 }}>{m.team2_name || 'TBD'}</span>
                                            </div>
                                        </div>
                                        <button className="btn btn-accent btn-sm">Set Winner</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Winner pick modal */}
            {pickMatch && (
                <div className="modal-overlay" onClick={() => setPickMatchId(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">🏆 Select Winner</div>
                        <div className="modal-sub">Round {pickMatch.round} · {pickMatch.team1_name} vs {pickMatch.team2_name}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <button className="btn btn-green w-full" onClick={() => handleWinner(pickMatch.id, pickMatch.team1_id)}>
                                🎲 {pickMatch.team1_name}
                            </button>
                            <button className="btn btn-blue w-full" onClick={() => handleWinner(pickMatch.id, pickMatch.team2_id)}>
                                🎲 {pickMatch.team2_name}
                            </button>
                            <button className="btn btn-ghost w-full" onClick={() => setPickMatchId(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Admin Page ──────────────────────────────────────────────────────────
export default function Admin() {
    const { adminEmail } = useAuth();
    const [tab, setTab] = useState('tournaments');

    return (
        <div className="page">
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h1 className="section-title">🎲 Admin Dashboard</h1>
                    <span className="badge badge-approved">Organizer</span>
                </div>
                <p className="color-muted text-sm">Logged in as <strong>{adminEmail}</strong></p>
            </div>

            <div className="admin-tabs">
                <button className={`admin-tab ${tab === 'tournaments' ? 'active' : ''}`} onClick={() => setTab('tournaments')}>
                    🏆 Tournaments
                </button>
                <button className={`admin-tab ${tab === 'registrations' ? 'active' : ''}`} onClick={() => setTab('registrations')}>
                    📋 Registrations
                </button>
                <button className={`admin-tab ${tab === 'matches' ? 'active' : ''}`} onClick={() => setTab('matches')}>
                    🎯 Match Results
                </button>
            </div>

            {tab === 'tournaments' && <TournamentsTab />}
            {tab === 'registrations' && <RegistrationsTab />}
            {tab === 'matches' && <MatchesTab />}
        </div>
    );
}
