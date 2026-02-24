const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const { data: matches, error } = await supabase
        .from('matches')
        .select(`
      *,
      team1:registrations!team1_id(team_name, player1_name, player1_threads, player2_name, player2_threads),
      team2:registrations!team2_id(team_name, player1_name, player1_threads, player2_name, player2_threads),
      winner:registrations!winner_id(team_name)
    `)
        .limit(1);

    console.log('Error:', error);
    console.log('Data:', matches);
}

test();
