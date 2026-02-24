import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import BracketView from '../components/BracketView';

function StatusBadge({ status }) {
    const map = { open: 'badge-open', in_progress: 'badge-progress', completed: 'badge-done' };
    const labels = { open: '● Open', in_progress: '▶ In Progress', completed: '✔ Completed' };
    return <span className={`badge ${map[status] || 'badge-pending'}`}>{labels[status] || status}</span>;
}

export default function TournamentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.getTournament(id);
            setData(res);
            setError(null);
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) return (
        <div className="page loading-wrap"><div className="spinner" /></div>
    );

    if (error) return (
        <div className="page empty-state">
            <div className="icon">⚠️</div>
            <p>{error}</p>
            <button className="btn btn-ghost mt-16" onClick={() => navigate('/')}>Back to Home</button>
        </div>
    );

    const { tournament, teams, matches } = data;

    const winner = tournament.status === 'completed'
        ? matches.find(m => m.round === Math.max(...matches.map(x => x.round)) && m.winner_id)
        : null;

    return (
        <div className="page">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Back</button>
                        <StatusBadge status={tournament.status} />
                        <span className={`badge ${tournament.format === '4-team' ? 'badge-4team' : 'badge-8team'}`}>{tournament.format}</span>
                    </div>
                    <h1 className="section-title" style={{ fontSize: '2rem' }}>🎲 {tournament.name}</h1>
                    <p className="color-muted text-sm">Organized by{' '}
                        <a href="https://www.threads.com/datsleeepyhead" target="_blank" rel="noopener noreferrer" className="threads-link" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                            @datsleeepyhead
                        </a>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {tournament.status === 'open' && (
                        <button className="btn btn-primary" onClick={() => navigate('/join')}>
                            🎯 Join This Tournament
                        </button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={fetchData}>🔄 Refresh</button>
                </div>
            </div>

            {/* Champion banner */}
            {winner && (
                <div className="champion-banner">
                    <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🏆</span>
                    <div>
                        <div className="champ-title">Tournament Champion</div>
                        <div className="champ-name" style={{ marginBottom: 4 }}>{winner.winner_name}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text2)', display: 'flex', gap: 12 }}>
                            <span>👤 {winner.winner_p1_name} · <a href={`https://www.threads.com/${winner.winner_p1_threads?.slice(1)}`} target="_blank" rel="noopener noreferrer" className="threads-link" style={{ fontWeight: 600 }}>{winner.winner_p1_threads}</a></span>
                            <span>👤 {winner.winner_p2_name} · <a href={`https://www.threads.com/${winner.winner_p2_threads?.slice(1)}`} target="_blank" rel="noopener noreferrer" className="threads-link" style={{ fontWeight: 600 }}>{winner.winner_p2_threads}</a></span>
                        </div>
                    </div>
                </div>
            )}

            {/* Bracket */}
            <div className="card" style={{ marginBottom: 24, padding: '32px 24px' }}>
                <div className="panel-title" style={{ marginBottom: 24, fontSize: '0.9rem' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: 4 }}>🗂️</span> TOURNAMENT BRACKET
                    {tournament.status === 'in_progress' && <><span className="live-dot" style={{ marginLeft: 8 }} /> Live</>}
                </div>
                <BracketView
                    tournament={tournament}
                    matches={matches}
                    teams={teams}
                    onRefresh={fetchData}
                />
            </div>

            {/* Registered Teams */}
            {teams.length > 0 && (
                <div className="card">
                    <div className="panel-title" style={{ marginBottom: 16 }}>🎲 Competing Teams ({teams.length})</div>
                    <div className="grid-2">
                        {teams.map((team, i) => {
                            const colors = ['var(--red)', 'var(--blue)', 'var(--green)', 'var(--yellow)'];
                            return (
                                <div key={team.id} style={{
                                    background: 'var(--bg2)', borderRadius: 'var(--radius-sm)',
                                    padding: '14px 16px', borderLeft: `3px solid ${colors[i % 4]}`
                                }}>
                                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{team.team_name}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <span>👤 {team.player1_name} ·{' '}
                                            <a href={`https://www.threads.com/${team.player1_threads.slice(1)}`} target="_blank" rel="noopener noreferrer" className="threads-link">
                                                {team.player1_threads}
                                            </a>
                                        </span>
                                        <span>👤 {team.player2_name} ·{' '}
                                            <a href={`https://www.threads.com/${team.player2_threads.slice(1)}`} target="_blank" rel="noopener noreferrer" className="threads-link">
                                                {team.player2_threads}
                                            </a>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
