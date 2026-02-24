-- 1. Create Admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  player1_name TEXT NOT NULL,
  player1_threads TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  player2_threads TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Matches table
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  position INTEGER NOT NULL,
  team1_id INTEGER REFERENCES registrations(id) ON DELETE SET NULL,
  team2_id INTEGER REFERENCES registrations(id) ON DELETE SET NULL,
  winner_id INTEGER REFERENCES registrations(id) ON DELETE SET NULL,
  is_bye BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  CONSTRAINT fk_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  CONSTRAINT fk_team1 FOREIGN KEY (team1_id) REFERENCES registrations(id) ON DELETE SET NULL,
  CONSTRAINT fk_team2 FOREIGN KEY (team2_id) REFERENCES registrations(id) ON DELETE SET NULL,
  CONSTRAINT fk_winner FOREIGN KEY (winner_id) REFERENCES registrations(id) ON DELETE SET NULL
);
