import { useState } from 'react';
import { useAuth } from '../main';
import { useToast } from '../main';
import { api } from '../api';

function getThreadsUrl(handle) {
    const clean = handle.startsWith('@') ? handle.slice(1) : handle;
    return `https://www.threads.com/${clean}`;
}

function TeamSlot({ team, isWinner, hasWinner }) {
    if (!team) return (
        <div className="match-team" style={{ color: 'var(--text3)', fontStyle: 'italic', fontSize: '0.82rem' }}>
            TBD
        </div>
    );
    return (
        <div className={`match-team ${isWinner ? 'winner' : hasWinner ? 'loser' : ''}`}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="match-team-name">{team.team_name}</div>
                <div className="match-team-handles">
                    <a href={getThreadsUrl(team.player1_threads)} target="_blank" rel="noopener noreferrer" className="threads-link">
                        {team.player1_threads}
                    </a>
                    {' · '}
                    <a href={getThreadsUrl(team.player2_threads || team.t2p2_threads || '')} target="_blank" rel="noopener noreferrer" className="threads-link">
                        {team.player2_threads || team.t2p2_threads}
                    </a>
                </div>
            </div>
            {isWinner && <span style={{ fontSize: '1.2rem' }}>🏆</span>}
        </div>
    );
}

function MatchCard({ match, onWinnerSet, isAdmin }) {
    const [open, setOpen] = useState(false);
    const toast = useToast();

    const canClick = isAdmin && match.status === 'active' && !match.is_bye;

    const team1 = match.team1_id ? {
        id: match.team1_id,
        team_name: match.team1_name,
        player1_threads: match.player1_threads,
        player2_threads: match.player2_threads,
    } : null;

    const team2 = match.team2_id ? {
        id: match.team2_id,
        team_name: match.team2_name,
        player1_threads: match.t2p1_threads,
        player2_threads: match.t2p2_threads,
    } : null;

    const handlePick = async (winnerId) => {
        try {
            await api.setWinner(match.id, winnerId);
            toast('Winner set! Bracket updated.', 'success');
            setOpen(false);
            onWinnerSet();
        } catch (e) {
            toast(e.message, 'error');
        }
    };

    if (match.is_bye) return (
        <div className="bye-card">
            BYE — {(team1 || team2)?.team_name || 'TBD'} advances
        </div>
    );

    return (
        <>
            <div
                className={`match-card ${match.status} ${canClick ? 'clickable' : ''}`}
                onClick={() => canClick && setOpen(true)}
                title={canClick ? 'Click to set winner' : ''}
            >
                <TeamSlot team={team1} isWinner={match.winner_id === match.team1_id && !!match.winner_id} hasWinner={!!match.winner_id} />
                <div className="match-vs">VS</div>
                <TeamSlot
                    team={team2}
                    isWinner={match.winner_id === match.team2_id && !!match.winner_id}
                    hasWinner={!!match.winner_id}
                />
                {match.status === 'active' && isAdmin && (
                    <div style={{ textAlign: 'center', padding: '4px 0', fontSize: '0.72rem', color: 'var(--blue)', fontWeight: 700 }}>
                        CLICK TO SET WINNER
                    </div>
                )}
            </div>

            {open && (
                <div className="modal-overlay" onClick={() => setOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">🏆 Select Winner</div>
                        <div className="modal-sub">Choose the winning team for this match</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {team1 && (
                                <button className="btn btn-green w-full" onClick={() => handlePick(team1.id)}>
                                    🎲 {team1.team_name}
                                </button>
                            )}
                            {team2 && (
                                <button className="btn btn-blue w-full" onClick={() => handlePick(team2.id)}>
                                    🎲 {team2.team_name}
                                </button>
                            )}
                            <button className="btn btn-ghost w-full" onClick={() => setOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function BracketView({ tournament, matches, teams, onRefresh }) {
    const { isAdmin } = useAuth();

    if (!matches.length) return (
        <div className="empty-state">
            <div className="icon">⏳</div>
            <p>Bracket not generated yet. Admin will start it once registrations are approved.</p>
        </div>
    );

    const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
    const totalRounds = rounds.length;

    const roundLabel = (r) => {
        if (r === totalRounds && totalRounds > 1) return <><span style={{ fontSize: '1rem' }}>🏆</span> FINAL</>;
        if (r === totalRounds - 1 && totalRounds > 2) return 'SEMI-FINAL';
        if (r === totalRounds - 2 && totalRounds > 3) return 'QUARTER-FINAL';
        return `ROUND ${r}`;
    };

    return (
        <div className="bracket-wrap">
            <div className="bracket">
                {rounds.map((round, rIdx) => {
                    const roundMatches = matches.filter(m => m.round === round);
                    return (
                        <div key={round} style={{ display: 'flex', alignItems: 'stretch' }}>
                            <div className="bracket-round">
                                <div className="round-label">{roundLabel(round)}</div>
                                <div className="bracket-matches">
                                    {roundMatches.map(match => (
                                        <MatchCard
                                            key={match.id}
                                            match={match}
                                            onWinnerSet={onRefresh}
                                            isAdmin={isAdmin}
                                        />
                                    ))}
                                </div>
                            </div>
                            {rIdx < rounds.length - 1 && (
                                <div className="bracket-connector">
                                    {roundMatches.map((_, i) => (
                                        <div key={i} className="connector-line" />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
