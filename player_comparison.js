let allPlayers = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPlayerData();
    setupEventListeners();
});

function loadPlayerData() {
    fetch('playerStats.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data loaded:', data);
            allPlayers = data;
            populateTeamDropdowns();
        })
        .catch(error => {
            console.error('Error loading player data:', error);
        });
}

function setupEventListeners() {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');
    const compareButton = document.getElementById('compareButton');

    if (team1Select) team1Select.addEventListener('change', () => updatePlayerList(1));
    if (team2Select) team2Select.addEventListener('change', () => updatePlayerList(2));
    if (compareButton) compareButton.addEventListener('click', comparePlayers);
}

function populateTeamDropdowns() {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');

    if (!team1Select || !team2Select) {
        console.error('Team select elements not found');
        return;
    }

    const uniqueTeams = [...new Set(allPlayers.map(player => player.TEAM))];
    uniqueTeams.sort();

    uniqueTeams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        team1Select.appendChild(option.cloneNode(true));
        team2Select.appendChild(option);
    });

    // Trigger initial player list update
    updatePlayerList(1);
    updatePlayerList(2);
}

function updatePlayerList(playerNum) {
    const teamSelect = document.getElementById(`team${playerNum}`);
    const playerSelect = document.getElementById(`player${playerNum}`);

    if (!teamSelect || !playerSelect) {
        console.error(`Team or player select element not found for player ${playerNum}`);
        return;
    }

    const selectedTeam = teamSelect.value;
    playerSelect.innerHTML = '';

    const teamPlayers = allPlayers.filter(player => player.TEAM === selectedTeam);

    teamPlayers.forEach(player => {
        const option = document.createElement('option');
        option.value = player.PLAYER;
        option.textContent = player.PLAYER;
        playerSelect.appendChild(option);
    });
}

function comparePlayers() {
    const player1Name = document.getElementById('player1').value;
    const player2Name = document.getElementById('player2').value;

    if (player1Name && player2Name) {
        const player1 = allPlayers.find(p => p.PLAYER === player1Name);
        const player2 = allPlayers.find(p => p.PLAYER === player2Name);

        console.log("Player 1:", player1);
        console.log("Player 2:", player2);

        if (player1 && player2) {
            displayComparison(player1, player2);
            const recommendation = generateRecommendation(player1, player2);
            const recommendationContainer = document.getElementById('recommendation-container');
            if (recommendationContainer) {
                recommendationContainer.innerHTML = recommendation;
                document.querySelector('.right-column').style.display = 'block';
            } else {
                console.error("Recommendation container not found");
            }
        } else {
            alert('One or both players not found');
        }
    } else {
        alert('Please select two players to compare');
    }
}

function displayComparison(player1, player2) {
    const statsTable = document.getElementById('comparison-stats');
    const tbody = statsTable.querySelector('tbody');
    tbody.innerHTML = '';

    document.getElementById('player1-name').textContent = player1.PLAYER;
    document.getElementById('player2-name').textContent = player2.PLAYER;

    // Add position row
    const positionRow = document.createElement('tr');
    positionRow.innerHTML = `
        <td><strong>Position</strong></td>
        <td>${player1.POS}</td>
        <td>${player2.POS}</td>
    `;
    tbody.appendChild(positionRow);

    const stats = ['FG%', 'FT%', '3PM', 'PTS', 'TREB', 'AST', 'STL', 'BLK', 'TO'];

    stats.forEach(stat => {
        const row = document.createElement('tr');

        const statCell = document.createElement('td');
        statCell.textContent = stat;
        row.appendChild(statCell);

        const player1Cell = document.createElement('td');
        player1Cell.textContent = player1[stat];
        row.appendChild(player1Cell);

        const player2Cell = document.createElement('td');
        player2Cell.textContent = player2[stat];
        row.appendChild(player2Cell);

        if (['FG%', 'FT%'].includes(stat)) {
            const player1Value = parseFloat(player1[stat]);
            const player2Value = parseFloat(player2[stat]);
            if (player1Value > player2Value) {
                player1Cell.classList.add('better-stat');
                player2Cell.classList.add('worse-stat');
            } else if (player2Value > player1Value) {
                player2Cell.classList.add('better-stat');
                player1Cell.classList.add('worse-stat');
            }
        } else if (stat !== 'TO') {
            if (parseFloat(player1[stat]) > parseFloat(player2[stat])) {
                player1Cell.classList.add('better-stat');
                player2Cell.classList.add('worse-stat');
            } else if (parseFloat(player2[stat]) > parseFloat(player1[stat])) {
                player2Cell.classList.add('better-stat');
                player1Cell.classList.add('worse-stat');
            }
        } else {
            if (parseFloat(player1[stat]) < parseFloat(player2[stat])) {
                player1Cell.classList.add('better-stat');
                player2Cell.classList.add('worse-stat');
            } else if (parseFloat(player2[stat]) < parseFloat(player1[stat])) {
                player2Cell.classList.add('better-stat');
                player1Cell.classList.add('worse-stat');
            }
        }

        tbody.appendChild(row);
    });
}

function generateRecommendation(player1, player2) {
    let recommendation = `<h3>Comparison Insights: ${player1.PLAYER} vs ${player2.PLAYER}</h3>`;

    const categories = {
        'Scoring': ['PTS', '3PM'],
        'Rebounding': ['TREB'],
        'Playmaking': ['AST'],
        'Defense': ['STL', 'BLK'],
        'Efficiency': ['FG%', 'FT%', 'TO']
    };

    for (const [category, stats] of Object.entries(categories)) {
        let insights = [];

        if (category === 'Scoring') {
            const ptsDiff = Math.abs(parseFloat(player1['PTS']) - parseFloat(player2['PTS'])).toFixed(1);
            const threePMDiff = Math.abs(parseFloat(player1['3PM']) - parseFloat(player2['3PM'])).toFixed(1);

            if (ptsDiff > 0.5 || threePMDiff > 0.5) {
                const ptsHigher = parseFloat(player1['PTS']) > parseFloat(player2['PTS']) ? player1.PLAYER : player2.PLAYER;
                insights.push(`${ptsHigher} scores ${ptsDiff} more points overall and makes ${threePMDiff} more three-pointers per game.`);
            }
        } else if (category === 'Efficiency') {
            ['FG%', 'FT%'].forEach(stat => {
                const p1Value = parseFloat(player1[stat]);
                const p2Value = parseFloat(player2[stat]);
                const diff = Math.abs(p1Value - p2Value).toFixed(1);

                if (diff >= 0.001) {  // Comparing percentage difference of 0.01% or more
                    const higher = p1Value > p2Value ? player1.PLAYER : player2.PLAYER;
                    const lower = p1Value > p2Value ? player2.PLAYER : player1.PLAYER;
                    insights.push(`${higher} has a ${diff}% higher ${stat} (${Math.max(p1Value, p2Value).toFixed(1)}%) compared to ${lower} (${Math.min(p1Value, p2Value).toFixed(1)}%).`);
                }
            });

            const toDiff = Math.abs(parseFloat(player1['TO']) - parseFloat(player2['TO'])).toFixed(1);
            if (toDiff > 0.5) {
                const lower = parseFloat(player1['TO']) < parseFloat(player2['TO']) ? player1.PLAYER : player2.PLAYER;
                insights.push(`${lower} commits ${toDiff} fewer turnovers per game.`);
            }
        } else {
            stats.forEach(stat => {
                const p1Value = parseFloat(player1[stat]);
                const p2Value = parseFloat(player2[stat]);
                const diff = Math.abs(p1Value - p2Value).toFixed(1);

                if (diff > 0.5) {
                    const higher = p1Value > p2Value ? player1.PLAYER : player2.PLAYER;
                    insights.push(`${higher} averages ${diff} more ${stat} per game.`);
                }
            });
        }

        if (insights.length > 0) {
            recommendation += `<h4>${category}:</h4><ul>`;
            insights.forEach(insight => {
                recommendation += `<li>${insight}</li>`;
            });
            recommendation += '</ul>';
        }
    }

    console.log("Generated recommendation:", recommendation);
    return recommendation;
}

function clearComparison() {
    document.getElementById('stat-header').textContent = '';
    document.getElementById('comparison-stats').querySelector('tbody').innerHTML = '';
    document.getElementById('recommendation-container').innerHTML = '';
    document.querySelector('.right-column').style.display = 'none';
    // Clear player names in the table header
    document.getElementById('player1-name').textContent = '';
    document.getElementById('player2-name').textContent = '';
}
