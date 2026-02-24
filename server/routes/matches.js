const router = require('express').Router();
const { supabase } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// PATCH /api/matches/:id — admin sets winner
router.patch('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { winner_id } = req.body;

  if (!winner_id) return res.status(400).json({ error: 'winner_id required' });

  const { data: match } = await supabase.from('matches').select('*').eq('id', id).single();
  if (!match) return res.status(404).json({ error: 'Match not found' });
  if (match.status === 'completed') return res.status(400).json({ error: 'Already completed' });

  // Update match
  await supabase.from('matches').update({ winner_id, status: 'completed' }).eq('id', id);

  // Advance
  const nextRound = match.round + 1;
  const nextPos = Math.floor(match.position / 2);
  const slot = match.position % 2;

  const { data: nextMatch } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', match.tournament_id)
    .eq('round', nextRound)
    .eq('position', nextPos)
    .single();

  if (nextMatch) {
    const update = slot === 0 ? { team1_id: winner_id } : { team2_id: winner_id };
    // Check if other team exists to mark active
    const otherTeam = slot === 0 ? nextMatch.team2_id : nextMatch.team1_id;
    if (otherTeam) update.status = 'active';
    await supabase.from('matches').update(update).eq('id', nextMatch.id);
  } else {
    // Final match complete
    await supabase.from('tournaments').update({ status: 'completed' }).eq('id', match.tournament_id);
  }

  res.json({ success: true });
});

module.exports = router;
