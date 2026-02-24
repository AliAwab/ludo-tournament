const router = require('express').Router();
const { supabase } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// POST /api/registrations — public
router.post('/', async (req, res) => {
    const { tournament_id, team_name, player1_name, player1_threads, player2_name, player2_threads } = req.body;

    if (!tournament_id || !team_name || !player1_name || !player1_threads || !player2_name || !player2_threads) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const p1t = player1_threads.startsWith('@') ? player1_threads : '@' + player1_threads;
    const p2t = player2_threads.startsWith('@') ? player2_threads : '@' + player2_threads;

    const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournament_id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.status !== 'open') return res.status(400).json({ error: 'Tournament is not open' });

    const { data, error } = await supabase
        .from('registrations')
        .insert([{
            tournament_id, team_name, player1_name, player1_threads: p1t, player2_name, player2_threads: p2t
        }])
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// GET /api/registrations — admin only
router.get('/', requireAdmin, async (req, res) => {
    const { tournament_id } = req.query;
    let query = supabase.from('registrations').select('*').order('created_at', { ascending: false });
    if (tournament_id) query = query.eq('tournament_id', tournament_id);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// PATCH /api/registrations/:id — admin
router.patch('/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // If approving, check limits
    if (status === 'approved') {
        const { data: reg } = await supabase.from('registrations').select('tournament_id').eq('id', id).single();
        if (reg) {
            const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', reg.tournament_id).single();
            const maxTeams = tournament.format === '4-team' ? 4 : 8;

            const { count } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .eq('tournament_id', reg.tournament_id)
                .eq('status', 'approved');

            if (count >= maxTeams) {
                return res.status(400).json({ error: `Cannot approve more than ${maxTeams} teams for this tournament format.` });
            }
        }
    }

    const { data, error } = await supabase
        .from('registrations')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

module.exports = router;
