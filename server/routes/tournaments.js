const router = require('express').Router();
const { supabase } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/tournaments — public, returns all
router.get('/', async (req, res) => {
  // We need to fetch tournaments and count registrations. 
  // Supabase doesn't support complex joins in a single call as easily as SQL, 
  // so we'll fetch tournaments and then enrich them or use a view if we had one.
  // For now, let's fetch tournaments and then counts.

  const { data: tournaments, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Enrich with counts
  const enriched = await Promise.all(tournaments.map(async (t) => {
    const { count: approved } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', t.id)
      .eq('status', 'approved');

    const { count: pending } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', t.id)
      .eq('status', 'pending');

    return { ...t, approved_teams: approved, pending_teams: pending };
  }));

  res.json(enriched);
});

// GET /api/tournaments/leaderboard - public, top winning players
router.get('/leaderboard', async (req, res) => {
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      id,
      winner_id,
      winner:registrations!winner_id(player1_threads, player2_threads, player1_name, player2_name)
    `)
    .not('winner_id', 'is', null);

  if (error) return res.status(500).json({ error: error.message });

  const playerWins = {};
  matches.forEach(m => {
    const w = m.winner;
    if (!w) return;

    const increment = (threads, name) => {
      if (!threads) return;
      const normalizedThreads = threads.startsWith('@') ? threads.toLowerCase() : '@' + threads.toLowerCase();
      if (!playerWins[normalizedThreads]) {
        playerWins[normalizedThreads] = { threads: normalizedThreads, name, wins: 0 };
      }
      playerWins[normalizedThreads].wins += 1;
    };

    increment(w.player1_threads, w.player1_name);
    increment(w.player2_threads, w.player2_name);
  });

  const leaderboard = Object.values(playerWins).sort((a, b) => b.wins - a.wins).slice(0, 10);
  res.json(leaderboard);
});

// GET /api/tournaments/:id — full tournament data with bracket
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();

  if (tErr || !tournament) return res.status(404).json({ error: 'Tournament not found' });

  const { data: teams } = await supabase
    .from('registrations')
    .select('*')
    .eq('tournament_id', id)
    .eq('status', 'approved')
    .order('id');

  // Fetch matches with team names. Supabase supports inner/left joins via nested selects.
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      team1:registrations!team1_id(team_name, player1_name, player1_threads, player2_name, player2_threads),
      team2:registrations!team2_id(team_name, player1_name, player1_threads, player2_name, player2_threads),
      winner:registrations!winner_id(team_name, player1_name, player1_threads, player2_name, player2_threads)
    `)
    .eq('tournament_id', id)
    .order('round')
    .order('position');

  // Remap nested data to match frontend expectations
  const mappedMatches = matches.map(m => ({
    ...m,
    team1_name: m.team1?.team_name,
    player1_name: m.team1?.player1_name,
    player1_threads: m.team1?.player1_threads,
    player2_name: m.team1?.player2_name,
    player2_threads: m.team1?.player2_threads,
    team2_name: m.team2?.team_name,
    t2p1_name: m.team2?.player1_name,
    t2p1_threads: m.team2?.player1_threads,
    t2p2_name: m.team2?.player2_name,
    t2p2_threads: m.team2?.player2_threads,
    winner_name: m.winner?.team_name,
    winner_p1_name: m.winner?.player1_name,
    winner_p1_threads: m.winner?.player1_threads,
    winner_p2_name: m.winner?.player2_name,
    winner_p2_threads: m.winner?.player2_threads
  }));

  res.json({ tournament, teams, matches: mappedMatches });
});

// POST /api/tournaments — admin only
router.post('/', requireAdmin, async (req, res) => {
  const { name, format } = req.body;
  if (!name || !format) return res.status(400).json({ error: 'name and format required' });

  const { data, error } = await supabase
    .from('tournaments')
    .insert([{ name, format }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// POST /api/tournaments/:id/start — admin, generate bracket
router.post('/:id/start', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { seeding } = req.body; // Array of team IDs in preferred order

  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', id).single();
  if (!tournament) return res.status(404).json({ error: 'Not found' });
  if (tournament.status !== 'open') return res.status(400).json({ error: 'Tournament already started' });

  const maxTeams = tournament.format === '4-team' ? 4 : 8;
  const { data: teams, count } = await supabase
    .from('registrations')
    .select('*', { count: 'exact' })
    .eq('tournament_id', id)
    .eq('status', 'approved')
    .order('id');

  if (count !== maxTeams) {
    return res.status(400).json({ error: `Exactly ${maxTeams} approved teams are required to start this tournament. Currently have ${count}.` });
  }

  // Seeding vs Shuffle
  let orderedTeams = [...teams];
  if (seeding && Array.isArray(seeding)) {
    // Map existing teams to the requested order
    orderedTeams = seeding.map(sid => teams.find(t => String(t.id) === String(sid))).filter(Boolean);
    if (orderedTeams.length !== maxTeams) {
      return res.status(400).json({ error: 'Invalid seeding data provided.' });
    }
  } else {
    // Shuffle
    for (let i = orderedTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [orderedTeams[i], orderedTeams[j]] = [orderedTeams[j], orderedTeams[i]];
    }
  }

  const slots = orderedTeams.length <= 4 ? 4 : 8;
  while (orderedTeams.length < slots) orderedTeams.push(null);

  const round1Matches = [];
  const totalRounds = Math.log2(slots);

  for (let i = 0; i < slots; i += 2) {
    const t1 = orderedTeams[i];
    const t2 = orderedTeams[i + 1];
    const isBye = !t1 || !t2;
    round1Matches.push({
      tournament_id: id, round: 1, position: i / 2,
      team1_id: t1?.id || null, team2_id: t2?.id || null,
      is_bye: isBye, status: isBye ? 'completed' : 'active'
    });
  }

  const laterRounds = [];
  for (let round = 2; round <= totalRounds; round++) {
    const count = slots / Math.pow(2, round);
    for (let pos = 0; pos < count; pos++) {
      laterRounds.push({
        tournament_id: id, round, position: pos,
        team1_id: null, team2_id: null, is_bye: false, status: 'pending'
      });
    }
  }

  await supabase.from('matches').insert([...round1Matches, ...laterRounds]);

  // Handle byes
  const { data: byes } = await supabase.from('matches').select('*').eq('tournament_id', id).eq('round', 1).eq('is_bye', true);
  for (const m of (byes || [])) {
    const winner = m.team1_id || m.team2_id;
    if (winner) {
      await supabase.from('matches').update({ winner_id: winner, status: 'completed' }).eq('id', m.id);
      const nextPos = Math.floor(m.position / 2);
      const slot = m.position % 2;
      const { data: nextMatch } = await supabase.from('matches').select('*').eq('tournament_id', id).eq('round', 2).eq('position', nextPos).single();
      if (nextMatch) {
        const update = slot === 0 ? { team1_id: winner } : { team2_id: winner };
        // Check if both teams present to activate
        const { data: check } = await supabase.from('matches').select('*').eq('id', nextMatch.id).single();
        const otherTeam = slot === 0 ? check.team2_id : check.team1_id;
        if (otherTeam) update.status = 'active';
        await supabase.from('matches').update(update).eq('id', nextMatch.id);
      }
    }
  }

  await supabase.from('tournaments').update({ status: 'in_progress' }).eq('id', id);
  res.json({ success: true });
});

// DELETE /api/tournaments/:id — admin
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('tournaments').delete().eq('id', id);
    if (error) {
      console.error('DELETE ERROR:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
