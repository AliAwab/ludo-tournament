import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

const COLOR_CYCLE = ['var(--red)', 'var(--blue)', 'var(--green)', 'var(--yellow)'];

function StatusBadge({ status }) {
    const map = { open: 'badge-open', in_progress: 'badge-progress', completed: 'badge-done' };
    const labels = { open: '● Open', in_progress: '▶ In Progress', completed: '✔ Completed' };
    return <span className={`badge ${map[status] || 'badge-pending'}`}>{labels[status] || status}</span>;
}

function TournamentCard({ t, idx }) {
    const navigate = useNavigate();
    const color = COLOR_CYCLE[idx % 4];
    return (
        <div
            className="t-card"
            onClick={() => navigate(`/tournament/${t.id}`)}
            style={{ borderLeft: `3px solid ${color}` }}
        >
            <div className="t-card-header">
                <div className="t-card-name">
                    <span style={{ fontSize: '0.95rem' }}>🎲</span>
                    {t.name}
                </div>
                <StatusBadge status={t.status} />
            </div>
            <div className="t-card-meta">
                <span className={`badge ${t.format === '4-team' ? 'badge-4team' : 'badge-8team'}`}>{t.format}</span>
                <span>✅ {t.approved_teams} approved</span>
                {t.pending_teams > 0 && <span>⏳ {t.pending_teams} pending</span>}
            </div>
        </div>
    );
}

export default function Landing() {
    const [tournaments, setTournaments] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            const [tData, lData] = await Promise.all([
                api.getTournaments(),
                api.getLeaderboard()
            ]);
            setTournaments(tData);
            setLeaderboard(lData);
        } catch { }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
        // Poll every 5 seconds for live updates
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return (
        <div className="page-full landing">
            {/* LEFT — Hero */}
            <div className="landing-left">
                <div>
                    <div className="dice-spin" style={{ fontSize: '3rem', marginBottom: 16 }}>🎲</div>
                    <h1 className="landing-title">
                        <span className="gradient-text">Threads</span><br />
                        Ludo Star<br />
                        <span className="gradient-text">Tournament</span>
                    </h1>
                </div>

                <p className="landing-sub">
                    The ultimate Ludo Star showdown on Threads. Register your team, battle through the bracket, and claim the crown.
                </p>

                <div className="landing-actions">
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/join')}>
                        🎯 Join a Tournament
                    </button>
                    <a
                        href="https://www.threads.com/datsleeepyhead"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-lg"
                    >
                        <svg width="18" height="18" viewBox="0 0 192 192" fill="currentColor">
                            <path d="M141.537 88.988a66.667 66.667 0 00-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.69-1.14C76.089 83.309 58.824 93.651 59.98 113.52c.589 10.009 5.754 18.629 14.567 24.28 7.417 4.812 16.974 7.152 26.924 6.621 13.121-.72 23.39-5.728 30.512-14.876 5.347-6.965 8.713-15.98 10.16-27.37 6.097 3.676 10.607 8.526 13.08 14.464 4.392 10.44 4.643 27.571-9.112 41.314C132.07 171.403 113.11 178 90.873 178c-24.489-.081-43.064-8.04-55.198-23.655C23.737 138.012 17.805 116.714 17.6 90c.205-26.714 6.137-48.012 18.075-63.345C47.81 11.039 66.385 3.08 90.874 3c24.664.081 43.568 8.079 56.189 23.799 6.136 7.757 10.724 17.45 13.682 28.821l16.28-4.325c-3.595-13.264-9.317-24.977-17.138-34.99C143.982 9.17 120.275-.057 90.951 0h-.08C61.741.057 38.366 9.329 22.5 27.396 8.111 43.836.504 67.157.2 96.025L.2 96l.001.024c.303 28.862 7.91 52.149 22.3 68.59C38.365 182.681 61.74 191.943 90.87 192h.08c26.168-.057 45.512-7.037 60.965-22.485 20.47-20.454 19.846-46.025 13.092-61.733-4.825-11.458-14.096-20.716-23.47-18.794z" />
                        </svg>
                        @datsleeepyhead
                    </a>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text3)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>🔴 Red Team</span>
                    <span>🔵 Blue Team</span>
                    <span>🟢 Green Team</span>
                    <span>🟡 Yellow Team</span>
                </div>
            </div>

            {/* RIGHT — Live Tournaments */}
            <div className="landing-right">
                <div className="panel-title">
                    <span className="live-dot" />
                    Live Tournaments
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text3)' }}>Auto-refreshes every 5s</span>
                </div>

                {loading ? (
                    <div className="loading-wrap"><div className="spinner" /></div>
                ) : tournaments.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">🎲</div>
                        <p>No tournaments yet. Check back soon!</p>
                        <p style={{ fontSize: '0.8rem' }}>Follow <strong>@datsleeepyhead</strong> on Threads for announcements.</p>
                    </div>
                ) : (
                    tournaments.map((t, i) => <TournamentCard key={t.id} t={t} idx={i} />)
                )}

                {/* Leaderboard */}
                <div className="panel-title" style={{ marginTop: 32 }}>
                    🏆 Top Champions Leaderboard
                </div>
                {leaderboard.length === 0 && !loading ? (
                    <div className="empty-state" style={{ padding: '40px 20px' }}>
                        <p>No match winners recorded yet.</p>
                    </div>
                ) : (
                    <div className="leaderboard-list">
                        {leaderboard.map((lb, i) => (
                            <div key={lb.threads} className="leaderboard-item">
                                <div className={`lb-rank ${i < 3 ? 'top-3' : ''}`}>
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                </div>
                                <div className="lb-details">
                                    <div className="lb-name">{lb.name}</div>
                                    <a href={`https://www.threads.com/${lb.threads.slice(1)}`} target="_blank" rel="noopener noreferrer" className="threads-link lb-threads">
                                        {lb.threads}
                                    </a>
                                </div>
                                <div className="lb-score">
                                    <span className="lb-wins">{lb.wins}</span>
                                    <span className="lb-wins-label">Wins</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
