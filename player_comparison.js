let allPlayersSeason = [];
let allPlayersSevenDays = [];
let allPlayersFourteenDays = [];

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    setupEventListeners();
});

function loadStats() {
    Promise.all([
        fetch('playerStats.json'),
        fetch('playerStats_Seven.json'),
        fetch('playerStats_Fourteen.json')
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(([seasonData, sevenDaysData, fourteenDaysData]) => {
        allPlayersSeason = processData(seasonData);
        allPlayersSevenDays = processData(sevenDaysData);
        allPlayersFourteenDays = processData(fourteenDaysData);
        populateTeamDropdowns();
    })
    .catch(error => console.error('Error:', error));
}

function processData(data) {
    // Process the data if needed
    return data;
}

function setupEventListeners() {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');
    const compareButton = document.getElementById('compareButton');
    const timePeriodSelect = document.getElementById('time-period');

    if (team1Select) team1Select.addEventListener('change', () => updatePlayerList(1));
    if (team2Select) team2Select.addEventListener('change', () => updatePlayerList(2));
    if (compareButton) compareButton.addEventListener('click', comparePlayers);
    if (timePeriodSelect) {
        timePeriodSelect.addEventListener('change', () => {
            updatePlayerList(1);
            updatePlayerList(2);
            clearComparison();
        });
    }
}

function populateTeamDropdowns() {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');

    if (!team1Select || !team2Select) {
        console.error('Team select elements not found');
        return;
    }

    const uniqueTeams = [...new Set(allPlayersSeason.map(player => player.TEAM))];
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
    const timePeriod = document.getElementById('time-period').value;

    if (!teamSelect || !playerSelect) {
        console.error(`Team or player select element not found for player ${playerNum}`);
        return;
    }

    const selectedTeam = teamSelect.value;
    playerSelect.innerHTML = '<option value="">Select Player</option>';

    let players;
    switch (timePeriod) {
        case 'seven':
            players = allPlayersSevenDays;
            break;
        case 'fourteen':
            players = allPlayersFourteenDays;
            break;
        default:
            players = allPlayersSeason;
    }

    const teamPlayers = players.filter(player => player.TEAM === selectedTeam);

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
    const timePeriod = document.getElementById('time-period').value;

    let players;
    switch (timePeriod) {
        case 'seven':
            players = allPlayersSevenDays;
            break;
        case 'fourteen':
            players = allPlayersFourteenDays;
            break;
        default:
            players = allPlayersSeason;
    }

    if (player1Name && player2Name) {
        const player1 = players.find(p => p.PLAYER === player1Name);
        const player2 = players.find(p => p.PLAYER === player2Name);

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
            alert('One or both players not found for the selected time period');
        }
    } else {
        alert('Please select two players to compare');
    }
}

function clearComparison() {
    const comparisonTable = document.getElementById('comparison-stats');
    if (comparisonTable) {
        comparisonTable.querySelector('tbody').innerHTML = '';
    }
    const recommendationContainer = document.getElementById('recommendation-container');
    if (recommendationContainer) {
        recommendationContainer.innerHTML = '';
    }
}
    function generateRecommendation(player1, player2) {
        const categories = {
            offense: ['PTS', '3PM', 'AST'],
            defense: ['TREB', 'STL', 'BLK'],
            efficiency: ['FG%', 'FT%', 'TO']
        };

        let recommendationHTML = '<h2>Player Comparison Insights</h2>';

        for (const category in categories) {
            let categoryHTML = `<div class="insight-category">
                <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <ul>`;

            categories[category].forEach(stat => {
                const value1 = parseFloat(player1[stat]);
                const value2 = parseFloat(player2[stat]);
                let comparison = '';

                if (stat === 'TO') {
                    const diff = (value1 - value2).toFixed(1);
                    if (value1 < value2) {
                        comparison = `${player1.PLAYER} has ${Math.abs(diff)} fewer turnovers`;
                    } else if (value2 < value1) {
                        comparison = `${player2.PLAYER} has ${Math.abs(diff)} fewer turnovers`;
                    } else {
                        comparison = `Both players have the same number of turnovers`;
                    }
                } else if (stat === 'FG%' || stat === 'FT%') {
                    const diff = (value1 - value2).toFixed(3);
                    if (value1 > value2) {
                        comparison = `${player1.PLAYER} leads by ${diff} in ${stat}`;
                    } else if (value2 > value1) {
                        comparison = `${player2.PLAYER} leads by ${Math.abs(diff)} in ${stat}`;
                    } else {
                        comparison = `Both players are equal in ${stat}`;
                    }
                } else {
                    const diff = (value1 - value2).toFixed(1);
                    if (value1 > value2) {
                        comparison = `${player1.PLAYER} leads by ${diff} in ${stat}`;
                    } else if (value2 > value1) {
                        comparison = `${player2.PLAYER} leads by ${Math.abs(diff)} in ${stat}`;
                    } else {
                        comparison = `Both players are equal in ${stat}`;
                    }
                }

                categoryHTML += `<li>${comparison}</li>`;
            });

            categoryHTML += '</ul></div>';
            recommendationHTML += categoryHTML;
        }

        return recommendationHTML;
    }

function determineOverallWinner(insights) {
    let player1Wins = 0;
    let player2Wins = 0;

    for (const category in insights) {
        if (insights[category].winner === insights.offense.winner) {
            player1Wins++;
        } else if (insights[category].winner !== 'Tie') {
            player2Wins++;
        }
    }

    if (player1Wins > player2Wins) {
        return insights.offense.winner;
    } else if (player2Wins > player1Wins) {
        return player2Wins === 2 ? insights.defense.winner : insights.efficiency.winner;
    } else {
        return 'Tie';
    }
}
function displayComparison(player1, player2) {
    const comparisonTable = document.getElementById('comparison-stats');
    const tbody = comparisonTable.querySelector('tbody');
    tbody.innerHTML = '';

    const statsToCompare = [
        'POS', 'R#', 'GP', 'MPG', 'FG%', 'FT%', '3PM', 'PTS', 'TREB', 'AST', 'STL', 'BLK', 'TO'
    ];

    document.getElementById('player1-name').textContent = player1.PLAYER;
    document.getElementById('player2-name').textContent = player2.PLAYER;

    statsToCompare.forEach(stat => {
        const row = document.createElement('tr');
        const statCell = document.createElement('td');
        const player1Cell = document.createElement('td');
        const player2Cell = document.createElement('td');

        statCell.textContent = stat;
        player1Cell.textContent = player1[stat];
        player2Cell.textContent = player2[stat];

        if (stat !== 'POS') {
            const value1 = parseFloat(player1[stat]);
            const value2 = parseFloat(player2[stat]);
            if (stat === 'R#' || stat === 'TO') {
                if (value1 < value2) {
                    player1Cell.classList.add('better-value');
                    player2Cell.classList.add('worse-value');
                } else if (value2 < value1) {
                    player2Cell.classList.add('better-value');
                    player1Cell.classList.add('worse-value');
                }
            } else {
                if (value1 > value2) {
                    player1Cell.classList.add('better-value');
                    player2Cell.classList.add('worse-value');
                } else if (value2 > value1) {
                    player2Cell.classList.add('better-value');
                    player1Cell.classList.add('worse-value');
                }
            }
        }

        row.appendChild(statCell);
        row.appendChild(player1Cell);
        row.appendChild(player2Cell);
        tbody.appendChild(row);
    });
}

function highlightBetterValue(cell1, cell2, isCell1Better) {
    if (isCell1Better) {
        cell1.classList.add('better-value');
    } else if (cell1.textContent !== cell2.textContent) {
        cell2.classList.add('better-value');
    }
}
