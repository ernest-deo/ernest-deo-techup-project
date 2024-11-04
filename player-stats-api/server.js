const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3003;

// Enable CORS for all routes
app.use(cors());

// Sample player statistics data
const playerStats = [
    { player: 'LeBron James', team: 'LAL', gamesPlayed: 10, points: 24, rebounds: 8, assists: 7, steals: 1, blocks: 1, fgPercentage: 50, ftPercentage: 75, threePMade: 3, turnovers: 2 },
    { player: 'Kevin Durant', team: 'PHX', gamesPlayed: 10, points: 26, rebounds: 6, assists: 5, steals: 1, blocks: 0, fgPercentage: 52, ftPercentage: 90, threePMade: 2, turnovers: 1 },
    { player: 'Giannis Antetokounmpo', team: 'MIL', gamesPlayed: 10, points: 30, rebounds: 12, assists: 5, steals: 1, blocks: 2, fgPercentage: 55, ftPercentage: 67, threePMade: 1, turnovers: 3 },
];

// Define a root route
app.get('/', (req, res) => {
    res.send('Welcome to the NBA Fantasy Visualizer API. Use /api/stats to get player statistics.');
});

// Define a route for fetching player stats
app.get('/api/stats', (req, res) => {
    res.json(playerStats);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
