const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const { data: matches, error } = await supabase
        .from('matches')
        .select(`
      id,
      winner_id,
      winner:registrations!winner_id(player1_threads, player2_threads, player1_name, player2_name)
    `)
        .not('winner_id', 'is', null);

    console.log('Error:', error);

    const playerWins = {};

    if (matches) {
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
    }

    const leaderboard = Object.values(playerWins).sort((a, b) => b.wins - a.wins);
    console.log('Leaderboard:', leaderboard);
}

test();
