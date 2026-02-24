const BASE = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const req = async (method, path, body) => {
    const res = await fetch(BASE + path, {
        method,
        headers: getHeaders(),
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        try {
            data = await res.json();
        } catch (e) {
            throw new Error(`Failed to parse response: ${e.message}`);
        }
    } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.substring(0, 100)}...`);
    }

    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
};

export const api = {
    // Auth
    login: (email, password) => req('POST', '/auth/login', { email, password }),

    // Tournaments
    getTournaments: () => req('GET', '/tournaments'),
    getTournament: (id) => req('GET', `/tournaments/${id}`),
    getLeaderboard: () => req('GET', '/tournaments/leaderboard'),
    createTournament: (body) => req('POST', '/tournaments', body),
    startTournament: (id, body) => req('POST', `/tournaments/${id}/start`, body),
    deleteTournament: (id) => req('DELETE', `/tournaments/${id}`),

    // Registrations
    register: (body) => req('POST', '/registrations', body),
    getRegistrations: (tid) => req('GET', `/registrations?tournament_id=${tid}`),
    updateRegistration: (id, status) => req('PATCH', `/registrations/${id}`, { status }),

    // Matches
    setWinner: (id, winner_id) => req('PATCH', `/matches/${id}`, { winner_id }),
};
