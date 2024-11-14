let allPlayersSeason = [];
let allPlayersSevenDays = [];
let allPlayersFourteenDays = [];


document.addEventListener('DOMContentLoaded', () => { // Wait for the DOM to load before running the script
    loadStats();
    setupEventListeners();
});


function loadStats() {
    Promise.all([ //used here to wait for all three fetch operations to complete before proceeding.
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
    // Process the data if needed - as a form of future proofing.
    return data;
}


function setupEventListeners() { // Add event listeners to dropdowns and buttons
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


function populateTeamDropdowns() { // Populate dropdowns with teams and players
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');


    if (!team1Select || !team2Select) {
        console.error('Team select elements not found');
        return;
    }


    const uniqueTeams = [...new Set(allPlayersSeason.map(player => player.TEAM))]; // Remove duplicates and sort teams
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


function updatePlayerList(playerNum) { // Update player list based on selected team and time period
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


function comparePlayers() { // Display comparison and recommendation based on selected players and time period
    clearComparison();
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
    const table = document.getElementById('comparison-stats');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';


    // Clear the header row
    const headerRow = table.querySelector('thead tr');
    headerRow.innerHTML = '<th></th><th></th><th></th>';
    const recommendationContainer = document.getElementById('recommendation-container');
    recommendationContainer.innerHTML = '';
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


            categories[category].forEach(stat => { // Calculate the difference between the two players' stats
                const value1 = parseFloat(player1[stat]); // Normalize the values to a common scale
                const value2 = parseFloat(player2[stat]);
                let comparison = '';


                if (stat === 'TO') {
                    const diff = (value1 - value2).toFixed(1);
                    if (value1 < value2) {
                        comparison = `${player1.PLAYER} has ${Math.abs(diff)} fewer turnovers`; //math.abs returns the absolute value of a number i.e. positive
                    } else if (value2 < value1) {
                        comparison = `${player2.PLAYER} has ${Math.abs(diff)} fewer turnovers`;
                    } else {
                        comparison = `Both players have the same number of turnovers`;
                    }
                } else if (stat === 'FG%' || stat === 'FT%') {
                    const diff = (value1 - value2).toFixed(3); // .toFixed(3): This is a method called on the result of the subtraction. It does two things: It rounds the number to a specified number of decimal places (in this case, 3). It converts the number to a string representation.
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


                categoryHTML += `<li>${comparison}</li>`; // Append the comparison to the category HTML
            });


            categoryHTML += '</ul></div>';
            recommendationHTML += categoryHTML; // It adds the value of the right operand to a variable and assigns the result to that variable. It's a shorthand for adding and assigning in one step.
        }


        return recommendationHTML;
    }


function displayComparison(player1, player2) {
    console.log("Displaying comparison for:", player1.PLAYER, "and", player2.PLAYER);
    const comparisonTable = document.getElementById('comparison-stats');
    if (!comparisonTable) { //! = not
        console.error("Comparison table not found");
        return;
    }


    const tbody = comparisonTable.querySelector('tbody');
    if (!tbody) {
        console.error("Table body not found");
        return;
    }
    tbody.innerHTML = '';


    const statsToCompare = [
        'POS', 'R#', 'GP', 'MPG', 'FG%', 'FT%', '3PM', 'PTS', 'TREB', 'AST', 'STL', 'BLK', 'TO'
    ];


    const player1NameElement = document.getElementById('player1-name');
    const player2NameElement = document.getElementById('player2-name');


    if (player1NameElement) {
        player1NameElement.textContent = player1.PLAYER;
    } else {
        console.error("Element with id 'player1-name' not found");
    }


    if (player2NameElement) {
        player2NameElement.textContent = player2.PLAYER;
    } else {
        console.error("Element with id 'player2-name' not found");
    }


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