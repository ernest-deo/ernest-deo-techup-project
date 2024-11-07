let allPlayers = [];
let chart = null;
let teams = [];

document.addEventListener('DOMContentLoaded', function() {
    // Load header
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
        })
        .then(() => {
            // Load player data after header is loaded
            return fetch('playerStats.json');
        })
        .then(response => response.json())
        .then(data => {
            allPlayers = data;
            extractTeams();
            populateTeamSelects();
            updatePlayerList(1);
            updatePlayerList(2);

            // Add event listeners after everything is loaded
            addEventListeners();
        })
        .catch(error => console.error('Error:', error));
});

function addEventListeners() {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');
    const player1Select = document.getElementById('player1');
    const player2Select = document.getElementById('player2');
    const compareButton = document.getElementById('compareButton');

    if (team1Select) {
        team1Select.addEventListener('change', () => {
            updatePlayerList(1);
            clearComparison();
        });
    }
    if (team2Select) {
        team2Select.addEventListener('change', () => {
            updatePlayerList(2);
            clearComparison();
        });
    }
    if (player1Select) player1Select.addEventListener('change', clearComparison);
    if (player2Select) player2Select.addEventListener('change', clearComparison);
    if (compareButton) compareButton.addEventListener('click', comparePlayers);
}

function extractTeams() {
    teams = [...new Set(allPlayers.map(player => player.TEAM))].sort();
}

function populateTeamSelects() {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');

    if (!team1Select || !team2Select) {
        console.error('Team select elements not found');
        return;
    }

    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        team1Select.appendChild(option.cloneNode(true));
        team2Select.appendChild(option);
    });
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

function generateRecommendation(player1, player2) {
    let recommendation = `<h3>Comparison Insights: ${player1.PLAYER} vs ${player2.PLAYER}</h3>`;

    const categories = {
        'Scoring': ['PTS', 'FG%', 'FT%', '3PM'],
        'Rebounding': ['TREB'],
        'Playmaking': ['AST'],
        'Defense': ['STL', 'BLK'],
        'Efficiency': ['TO']
    };

    for (const [category, stats] of Object.entries(categories)) {
        let player1Advantage = 0;
        let player2Advantage = 0;
        let insights = [];

        stats.forEach(stat => {
            const p1Value = parseFloat(player1[stat]);
            const p2Value = parseFloat(player2[stat]);
            const diff = Math.abs(p1Value - p2Value).toFixed(1);

            if (stat === 'TO') {
                if (p1Value < p2Value) {
                    player1Advantage++;
                    insights.push(`${player2.PLAYER} has ${diff} more turnovers than ${player1.PLAYER}.`);
                } else if (p2Value < p1Value) {
                    player2Advantage++;
                    insights.push(`${player1.PLAYER} has ${diff} less turnovers than ${player2.PLAYER}.`);
                }
            } else {
                if (p1Value > p2Value) {
                    player1Advantage++;
                    if (diff > 0.5) insights.push(`${player1.PLAYER} leads in ${stat} by ${diff}.`);
                } else if (p2Value > p1Value) {
                    player2Advantage++;
                    if (diff > 0.5) insights.push(`${player2.PLAYER} leads in ${stat} by ${diff}.`);
                }
            }
        });

        recommendation += `<p><strong>${category}:</strong> `;
        if (player1Advantage > player2Advantage) {
            recommendation += `${player1.PLAYER} has the edge. `;
        } else if (player2Advantage > player1Advantage) {
            recommendation += `${player2.PLAYER} has the advantage. `;
        } else {
            recommendation += `Both players are evenly matched. `;
        }
        recommendation += insights.join(' ') + '</p>';
    }

    return recommendation;
}
function displayComparison(player1, player2) {
    const statsTable = document.getElementById('comparison-stats');
    const tbody = statsTable.querySelector('tbody');
    tbody.innerHTML = '';

    // Update player names in the table header
    document.getElementById('player1-name').textContent = player1.PLAYER;
    document.getElementById('player2-name').textContent = player2.PLAYER;

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

        // Compare stats and add classes for better/worse
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
            // For all other stats except TO, higher is better
            if (parseFloat(player1[stat]) > parseFloat(player2[stat])) {
                player1Cell.classList.add('better-stat');
                player2Cell.classList.add('worse-stat');
            } else if (parseFloat(player2[stat]) > parseFloat(player1[stat])) {
                player2Cell.classList.add('better-stat');
                player1Cell.classList.add('worse-stat');
            }
        } else {
            // For TO, lower is better
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

function createRadarChart(player1, player2) {
    const ctx = document.getElementById('radarChart').getContext('2d');

    // Destroy existing chart if it exists
    if (window.myRadarChart) {
        window.myRadarChart.destroy();
    }

    const stats = ['PTS', 'TREB', 'AST', 'STL', 'BLK', '3PM', 'FG%', 'FT%'];
    const data = {
        labels: stats,
        datasets: [
            {
                label: player1.PLAYER,
                data: stats.map(stat => parseFloat(player1[stat])),
                fill: true,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(255, 99, 132)'
            },
            {
                label: player2.PLAYER,
                data: stats.map(stat => parseFloat(player2[stat])),
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)'
            }
        ]
    };

    window.myRadarChart = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: false
                    },
                    suggestedMin: 0,
                    suggestedMax: Math.max(...data.datasets.flatMap(ds => ds.data)) * 1.1
                }
            }
        }
    });
}
function comparePlayers() {
    const player1Name = document.getElementById('player1').value;
    const player2Name = document.getElementById('player2').value;

    if (player1Name && player2Name) {
        const player1 = allPlayers.find(p => p.PLAYER === player1Name);
        const player2 = allPlayers.find(p => p.PLAYER === player2Name);

        if (player1 && player2) {
            // Add the "Stat" text to the header
            document.getElementById('stat-header').textContent = 'Stat';
            displayComparison(player1, player2);
            const recommendation = generateRecommendation(player1, player2);
            document.getElementById('recommendation-container').innerHTML = recommendation;

            // Make sure the right column is visible
            document.querySelector('.right-column').style.display = 'block';
        } else {
            alert('One or both players not found');
        }
    } else {
        alert('Please select two players to compare');
    }
}

// Add this function to clear the comparison
function clearComparison() {
    document.getElementById('stat-header').textContent = '';
    document.getElementById('comparison-stats').querySelector('tbody').innerHTML = '';
    document.getElementById('recommendation-container').innerHTML = '';
    document.querySelector('.right-column').style.display = 'none';
}
